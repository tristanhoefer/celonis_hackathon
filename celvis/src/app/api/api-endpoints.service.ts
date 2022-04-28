import {Injectable} from '@angular/core';
import {QueryStringParameters} from "./query-string-parameters";
import {Constants} from "./constants";
import {UrlBuilder} from "./url-builder";

/**
 * Service which can Create API-Endpoints which then can be used inside the components
 */
@Injectable()
export class ApiEndpointsService {

  constructor(private constants: Constants) {
  }

  /* CUSTOM (APPLICATION SPECIFIC) API CALLS GO HERE */
  /*
  * public a = (): string => XYU; is a one-line function.
  * It initializes getListboxData with the function that takes no input data and returns a string url
  */
  // Returns: https://mocki.io/v1/8701fbf3-a1eb-4735-945d-3fa2690dd184
  public getListboxData = (): string => this.createUrl('8701fbf3-a1eb-4735-945d-3fa2690dd184', true);

  /* #region EXAMPLES */
  // Returns https://mocki.io/v1/data/ID
  public getDataByIdEndpoint = (id: string): string => this.createUrlWithPathVariables('data', [id], true);

  // Returns https://mocki.io/v1/data/ID/CODE
  public getDataByIdAndCodeEndpoint = (id: string, code: number): string => this.createUrlWithPathVariables('data', [id, code], true);

  // Returns https://mocki.io/v1/data/ID/CODE?year=YEAR
  public getDataByIdCodeAndYearEndpoint(id: string, code: number, year: number): string {
    const queryString: QueryStringParameters = new QueryStringParameters();
    queryString.push('year', year);
    return `${this.createUrlWithPathVariables('data', [id, code], true)}?${queryString.toString()}`;
  }

  // Returns https://mocki.io/v1/productlist?countryCode=COUNTRYCODE
  public getProductListByCountryCodeEndpoint(countryCode: string): string {
    return this.createUrlWithQueryParameters('productlist', (qs: QueryStringParameters) => qs.push('countryCode', countryCode), true);
  }

  // Returns https://mocki.io/v1/productlist?countryCode=COUNTRYCODE&postalCode=POSTALCODE
  public getProductListByCountryAndPostalCodeEndpoint(countryCode: string, postalCode: string): string {
    return this.createUrlWithQueryParameters('productlist', (qs: QueryStringParameters) => {
      qs.push('countryCode', countryCode);
      qs.push('postalCode', postalCode);
    }, true);
  }
  /* End of the Testing */


  /***********************************/
  /***********************************/
  /*                                 */
  /*           URL CREATOR           */
  /*            (Constant)           */
  /*                                 */
  /***********************************/
  /***********************************/

  /**
   * Create a URL by concatenating the endpoint with the action
   * Example-URL to create: URL/asdf1234
   * @param action Path which should be appended to the API Endpoint
   * @param isMockAPI Boolean to decide whether to use our Mock-API or the real one (default = use real one)
   * @private
   */
  private createUrl(action: string, isMockAPI: boolean = false): string {
    const urlBuilder: UrlBuilder = new UrlBuilder(
      isMockAPI ? this.constants.API_MOCK_ENDPOINT : this.constants.API_ENDPOINT,
      action
    );
    return urlBuilder.toString();
  }

  /**
   * Create a URL and additionally include QueryString Parameters
   * Example-URL to create: URL/productlist?countryCode=US&postalCode=123
   * @param action Path which should be appended to the API Endpoint
   * @param queryStringHandler (Passing a function) which gets called with the queryString (see examples & make better explanation)
   * @param isMockAPI Boolean to decide whether to use our Mock-API or the real one (default = use real one)
   * @private
   */
  private createUrlWithQueryParameters(action: string, queryStringHandler?: (queryStringParameters: QueryStringParameters) => void, isMockAPI: boolean = false): string {
    const urlBuilder: UrlBuilder = new UrlBuilder(isMockAPI ? this.constants.API_MOCK_ENDPOINT : this.constants.API_ENDPOINT, action);
    if (queryStringHandler) {
      // Push extra query string params (see above example for usage) to the currently existing queryString (so we just append id)
      queryStringHandler(urlBuilder.queryString);
    }
    return urlBuilder.toString();
  }

  /**
   * Create URL with Path Variables (and an action)
   * Example-URL to create: URL/123/test
   * @param action Path which should be appended to the API Endpoint
   * @param pathVariables Pass Array of Path Variables which get appended one after another.
   *                      For example: [123, "test"] yields in URL/123/test
   * @param isMockAPI Boolean to decide whether to use our Mock-API or the real one (default = use real one)
   * @private
   */
  private createUrlWithPathVariables(action: string, pathVariables: any[] = [], isMockAPI: boolean = false): string {
    let encodedPathVariablesUrl: string = '';
    // Push extra path variables
    for (const pathVariable of pathVariables) {
      console.log(pathVariable)
      if (pathVariable !== null) {
        encodedPathVariablesUrl += `/${encodeURIComponent(pathVariable.toString())}`;
      }
    }
    const urlBuilder: UrlBuilder = new UrlBuilder(isMockAPI ? this.constants.API_MOCK_ENDPOINT : this.constants.API_ENDPOINT, `${action}${encodedPathVariablesUrl}`);
    return urlBuilder.toString();
  }
}
