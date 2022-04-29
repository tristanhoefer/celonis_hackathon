import {Injectable} from '@angular/core';
import {QueryStringParameters} from "./query-string-parameters";
import {Constants} from "./constants";
import {UrlBuilder} from "./url-builder";

/**
 * Service which can Create API-Endpoints which then can be used inside the components
 */
@Injectable()
export class ApiEndpointsService {
  /***********************************/
  /***********************************/
  /*                                 */
  /*           URL CREATOR           */
  /*            (Constant)           */
  /*                                 */
  /***********************************/
  /***********************************/


  constructor(private constants: Constants) {
  }

  /**
   * Create a URL by concatenating the endpoint with the action
   * Example-URL to create: URL/asdf1234
   * @param action Path which should be appended to the API Endpoint
   * @param isMockAPI Boolean to decide whether to use our Mock-API or the real one (default = use real one)
   * @private
   */
  public createUrl(action: string, isMockAPI: boolean = false): string {
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
  public createUrlWithQueryParameters(action: string, queryStringHandler?: (queryStringParameters: QueryStringParameters) => void, isMockAPI: boolean = false): string {
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
  public createUrlWithPathVariables(action: string, pathVariables: any[] = [], isMockAPI: boolean = false): string {
    let encodedPathVariablesUrl: string = '';
    // Push extra path variables
    for (const pathVariable of pathVariables) {
      if (pathVariable !== null) {
        encodedPathVariablesUrl += `/${encodeURIComponent(pathVariable.toString())}`;
      }
    }
    const urlBuilder: UrlBuilder = new UrlBuilder(isMockAPI ? this.constants.API_MOCK_ENDPOINT : this.constants.API_ENDPOINT, `${action}${encodedPathVariablesUrl}`);
    return urlBuilder.toString();
  }
}
