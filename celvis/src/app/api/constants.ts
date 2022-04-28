import { Injectable } from '@angular/core';

/**
 * Class which holds the important constants for the API
 */
@Injectable()
export class Constants {
  // Endpoint of the Real API... (TODO: CHANGE ON FRIDAY!!!)
  public readonly API_ENDPOINT: string = 'https://domain.com/api';

  // Endpoint of the Mock API
  public readonly API_MOCK_ENDPOINT: string = 'https://mocki.io/v1';
}
