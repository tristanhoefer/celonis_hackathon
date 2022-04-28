/**
 * Helper Class for Array of Query Parameters
 * (NO NEED FOR CHANGES HERE)
 */
export class QueryStringParameters {
  // Store Parameters
  private paramsAndValues: string[];

  /**
   * Constructor for initialization
   */
  constructor() {
    this.paramsAndValues = [];
  }

  /**
   * Push another key-value-pair to the array (for query parameter)
   * @param key Key of the query Parameter
   * @param value Value for the corresponding key
   */
  public push(key: string, value: Object): void {
    value = encodeURIComponent(value.toString());
    this.paramsAndValues.push([key, value].join('='));
  }

  /**
   * Deserialize the List of QueryParams to a single string and separate them by an "&"-Symbol
   */
  public toString = (): string => this.paramsAndValues.join('&');
}
