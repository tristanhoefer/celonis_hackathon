import {Component, OnInit} from '@angular/core';
import {ApiEndpointsService} from "../api/api-endpoints.service";
import {ApiHttpService} from "../api/ApiHttpService";
import {AutoUnsubscribe} from "../utility/AutoUnsubscribe";

@Component({
  selector: 'api-test',
  templateUrl: './api-test.component.html',
  styleUrls: ['./api-test.component.scss']
})
@AutoUnsubscribe()  // Automatically Unsubscribe from all subscriptions in this component
export class ApiTestComponent implements OnInit {
  // Currently Selected Option of the Item List
  selectedOption: string = "Nothing Selected";

  // List of all Options available to display inside the item list
  options: any[] = [];

  constructor(private apiHttpService: ApiHttpService, private apiEndpointsService: ApiEndpointsService) {
  }


  ngOnInit() {
    /*
     Create the one API-Call that really matters, where we get the data.
     1. The .get(...) simply asks the service to make the API-Call to the passed API
     2. The .subscribe(...) waits until the previous .get() request returns a result.
        If it does, we jump inside the function and execute the code
        Inside the "data" variable, we receive the result of the API-Call (in this case a simple json file with names)
        Those names are filled in the "this.options", which itself is used in the html-file to populate the item list
     */
    this.apiHttpService.get(this.apiEndpointsService.getListboxData()).subscribe((data: any) => {
        console.log('News loaded');
        console.log("Found Data: ", data);
        this.options = data.options;
      });


    // Console Log some more Test-API Calls
    console.log(this.apiEndpointsService.getListboxData())
    console.log(this.apiEndpointsService.getDataByIdEndpoint("123"))
    console.log(this.apiEndpointsService.getDataByIdAndCodeEndpoint("123", 999))
    console.log(this.apiEndpointsService.getDataByIdCodeAndYearEndpoint("123", 999, 666))
    console.log(this.apiEndpointsService.getProductListByCountryCodeEndpoint("DE"))
    console.log(this.apiEndpointsService.getProductListByCountryAndPostalCodeEndpoint("US", "123"));
  }
}
