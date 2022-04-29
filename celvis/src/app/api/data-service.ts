import {Injectable} from '@angular/core';
import {QueryStringParameters} from "./query-string-parameters";
import {ApiEndpointsService} from "./api-endpoints.service";
import {ApiHttpService} from "./ApiHttpService";
import {BehaviorSubject} from "rxjs";
import {AutoUnsubscribe} from "../utility/AutoUnsubscribe";

/**
 * Service which can Create API-Endpoints which then can be used inside the components
 */
@Injectable()
@AutoUnsubscribe()
export class DataService {

  // Data object with current data queried from the API
  data: any = {};

  // Current URL (TODO: Maybe add some sort of object here later on so manage the states, depending on the API complexity)
  current_url: string = "";

  // BehaviourSubject watching the data (so we can subscribe to it and can react to changes properly)
  dataSub: BehaviorSubject<any> = new BehaviorSubject({});

  constructor(private apiEndpoint: ApiEndpointsService, private apiHttpService: ApiHttpService) {
  }

  // Here we can also manage the states of the currently queried API and thus modify it somehow...


  /**
   * Function which gets passed an URL. Afterwards it performs a http get request.
   * If the result has returned, we trigger a dataSub-Event so that other components can react to changes.
   * @param url URL to query
   * @param options Query Options
   */
  updateData(url: string, options?: any) {
    this.current_url = url;
    this.apiHttpService.get(url, options).subscribe((data: any) => {
      console.log("Found Data: ", data);
      this.dataSub.next(data);
      this.data = data;
    });
  }


  /* CUSTOM (APPLICATION SPECIFIC) API CALLS GO HERE */
  /*
  * public a = (): string => XYU; is a one-line function.
  * It initializes getListboxData with the function that takes no input data and returns a string url
  */
  // Returns: https://mocki.io/v1/8701fbf3-a1eb-4735-945d-3fa2690dd184
  public getListboxData = (): string => this.apiEndpoint.createUrl('8701fbf3-a1eb-4735-945d-3fa2690dd184', true);

  /* #region EXAMPLES */
  // Returns https://mocki.io/v1/data/ID
  public getDataByIdEndpoint = (id: string): string => this.apiEndpoint.createUrlWithPathVariables('data', [id], true);

  // Returns https://mocki.io/v1/data/ID/CODE
  public getDataByIdAndCodeEndpoint = (id: string, code: number): string => this.apiEndpoint.createUrlWithPathVariables('data', [id, code], true);

  // Returns https://mocki.io/v1/data/ID/CODE?year=YEAR
  public getDataByIdCodeAndYearEndpoint(id: string, code: number, year: number): string {
    const queryString: QueryStringParameters = new QueryStringParameters();
    queryString.push('year', year);
    return `${this.apiEndpoint.createUrlWithPathVariables('data', [id, code], true)}?${queryString.toString()}`;
  }

  // Returns https://mocki.io/v1/productlist?countryCode=COUNTRYCODE
  public getProductListByCountryCodeEndpoint(countryCode: string): string {
    return this.apiEndpoint.createUrlWithQueryParameters('productlist', (qs: QueryStringParameters) => qs.push('countryCode', countryCode), true);
  }

  // Returns https://mocki.io/v1/productlist?countryCode=COUNTRYCODE&postalCode=POSTALCODE
  public getProductListByCountryAndPostalCodeEndpoint(countryCode: string, postalCode: string): string {
    return this.apiEndpoint.createUrlWithQueryParameters('productlist', (qs: QueryStringParameters) => {
      qs.push('countryCode', countryCode);
      qs.push('postalCode', postalCode);
    }, true);
  }

  /* End of the Testing */


}
