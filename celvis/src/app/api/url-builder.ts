import {QueryStringParameters} from './query-string-parameters';

/**
 * Class which can construct URLs
 * (NO NEED FOR CHANGES HERE)
 */
export class UrlBuilder {
  // URL
  public url: string;

  // Query String (for additional parameters after the "?"
  public queryString: QueryStringParameters;

  /**
   * Constructer which creates a URL Builder
   * @param baseUrl BaseURL (first part, most-likely to be constant)
   * @param action String which should be appended to the BaseURL
   * @param queryString QueryParameters (list of strings) which should be appended after the "?"
   */
  constructor(private baseUrl: string, private action: string, queryString?: QueryStringParameters) {
    this.url = [baseUrl, action].join('/');
    this.queryString = queryString || new QueryStringParameters();
  }

  /**
   * Deserializes the Content of the URL-Builder into a string
   */
  public toString(): string {
    const qs: string = this.queryString ? this.queryString.toString() : '';
    return qs ? `${this.url}?${qs}` : this.url;
  }
}
