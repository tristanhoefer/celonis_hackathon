import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {catchError, throwError} from "rxjs";

/**
 * ApiService which performs the actual HTTP Requests
 * (NO NEED FOR CHANGES HERE)
 */
@Injectable()
export class ApiHttpService {
  constructor(private http: HttpClient) {}

  auth_header: any = {
    "headers": new HttpHeaders({
      // 'Content-Type': 'application/json',
      // 'Access-Control-Allow-Origin': '*',
      // 'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type, Origin, Authorization, Accept, Client-Security-Token, Accept-Encoding, X-Auth-Token, content-type',
      // 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,DELETE,PUT',
      'Authorization': 'Bearer OTc4MDA5ZjMtZmMxNC00ODRkLWFhMjMtNGVjNTFiNmNlMTVhOjBGZ2J0NlU1SVJYMTBybUhtcWZFeGFKRzgvK0JBU1VLbEFGZldLZ21VM2lu'
    })
  }

  // GET Data from the passed URL
  public get(url: string, options?: any) {
    return this.http.get(url, {...this.auth_header, options}).pipe(catchError(this.handleError));
  }

  // Send POST request to given url with given data
  public post(url: string, data: any, options?: any) {
    return this.http.post(url, data, {...this.auth_header, options}).pipe(catchError(this.handleError));
  }

  // Send PUT request to given url with given data
  public put(url: string, data: any, options?: any) {
    return this.http.put(url, data, {...this.auth_header, options}).pipe(catchError(this.handleError));
  }

  // Send DELETE request to given url with given data
  public delete(url: string, options?: any) {
    return this.http.delete(url, {...this.auth_header, options}).pipe(catchError(this.handleError));
  }


  // Error Handling
  private handleError(error: HttpErrorResponse) {
    switch (error.status) {
      case 0:
        // A client-side or network error occurred. Handle it accordingly.
        console.error('An error occurred:', error.error);
        break;
      case 401:      // Login
        break;
      case 403:     // Forbidden
        console.error("Access forbidden: ", error.error);
        break;
      case 404:     // Not Found
        console.error("Requested API not Found! ", error.error);
        break;
      default:
        // The backend returned an unsuccessful response code.
        // The response body may contain clues as to what went wrong.
        console.error(
          `Backend returned code ${error.status}, body was: `, error.error);
    }

    // Return an observable with a user-facing error message.
    return throwError(() => new Error('Something bad happened; please try again later. \n Error Status: ' + error.status));
  }
}
