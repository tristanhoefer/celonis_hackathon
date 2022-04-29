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
  readonly KEY: string  = "99f38193-e510-4635-9f0a-c0b98b13b451"

  // Data object with current data queried from the API
  data: any = {};
  // BehaviourSubject watching the data (so we can subscribe to it and can react to changes properly)
  dataSub: BehaviorSubject<any> = new BehaviorSubject({});

  // Current URL (TODO: Maybe add some sort of object here later on so manage the states, depending on the API complexity)
  current_url: string = "";


  // Data object with current data queried from the API
  table: any = {};
  // BehaviourSubject watching the data (so we can subscribe to it and can react to changes properly)
  tableSub: BehaviorSubject<any> = new BehaviorSubject([]);


  constructor(private apiEndpoint: ApiEndpointsService, private apiHttpService: ApiHttpService) {
  }


  /**
   * Function which gets passed an URL. Afterwards it performs a http get request.
   * If the result has returned, we trigger a dataSub-Event so that other components can react to changes.
   * @param url URL to query
   * @param options Query Options
   */
  updateData(url: string, body: any, options?: any) {
    this.current_url = url;

    this.apiHttpService.post(url, body, options).subscribe((data: any) => {
      this.dataSub.next(data);
      this.data = data;
      console.log("FOUND: ", data);
    })
  }

  public getDataModelFromAPI = (): string => this.apiEndpoint.createUrl('analysis/' + this.KEY + '/data_model', false);

  getTables() {
    const url = this.getDataModelFromAPI()
    this.apiHttpService.get(url).subscribe((response: any) => {
      const constructed_table: any = [];
      response.tables.forEach((table: any) => {
        const table_obj: any = {
          "name": table.name,
          "shortName": table.shortName,
          "id": table.id
        };

        table_obj.columns = [];
        table.columns.forEach((col: any) => {
          const col_obj: any = {
            "name": col.name,
            "shortName": col.shortName,
            "id": col.id
          };
          table_obj.columns.push(col_obj);
        })

        constructed_table.push(table_obj);
      })

      this.table = constructed_table;
      this.tableSub.next(constructed_table);
    })
  }

  getSelectedColData(tableName: string) {
    // const query = "TABLE (DISTINCT\n\"_CEL_P2P_ACTIVITIES_EN_parquet\".\"ACTIVITY_EN\"\n) ORDER BY \"_CEL_P2P_ACTIVITIES_EN_parquet\".\"ACTIVITY_EN\" ASC LIMIT 99999"
    const query =  "TABLE ( ESTIMATE_CLUSTER_PARAMS ( VARIANT(\"_CEL_P2P_ACTIVITIES_EN_parquet\".\"ACTIVITY_EN\"), 2, 20, 5 ) \nAS \"New Expression\") ORDER BY ESTIMATE_CLUSTER_PARAMS ( VARIANT(\"_CEL_P2P_ACTIVITIES_EN_parquet\".\"ACTIVITY_EN\"), 2, 20, 5 )\n DESC LIMIT 400 OFFSET 0"
    const body = this.apiEndpoint.createPQLQueryBody(query)

    console.log(this.data_service_batch());
    this.apiHttpService.post(this.data_service_batch(), body).subscribe((data: any) => {
      console.log("GOT DATA: ", data);
    })

  }



  public data_service_batch = (): string => this.apiEndpoint.createUrl('analysis/' + this.KEY + '/data_service_batch', false);



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
