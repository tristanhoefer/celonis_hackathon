import {Component, OnInit} from '@angular/core';
import {ApiHttpService} from "../api/ApiHttpService";
import {AutoUnsubscribe} from "../utility/AutoUnsubscribe";
import {DataService} from "../api/data-service";

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

  constructor(private dataService: DataService, private apiHttpService: ApiHttpService) {
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

    // Update Data of DataService
    this.dataService.updateData(this.dataService.getListboxData())

    // React to Data Changes
    this.dataService.dataSub.subscribe((data: any) => {
      this.options = data.options;
    })


    // Console Log some more Test-API Calls
    console.log(this.dataService.getListboxData())
    console.log(this.dataService.getDataByIdEndpoint("123"))
    console.log(this.dataService.getDataByIdAndCodeEndpoint("123", 999))
    console.log(this.dataService.getDataByIdCodeAndYearEndpoint("123", 999, 666))
    console.log(this.dataService.getProductListByCountryCodeEndpoint("DE"))
    console.log(this.dataService.getProductListByCountryAndPostalCodeEndpoint("US", "123"));
  }
}
