import { Injectable } from '@angular/core';

/**
 * Class which holds the important constants for the API
 */
@Injectable()
export class Constants {
  // Endpoint of the Real API...
  public readonly API_ENDPOINT: string =
    'https://academic-henrik-falke-rwth-aachen-de.eu-2.celonis.cloud/process-analytics/analysis/v2/api';

  // Endpoint of the Mock API
  public readonly API_MOCK_ENDPOINT: string = 'https://mocki.io/v1';
}
