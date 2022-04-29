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
  selectedOption: any = {};

  // List of all Options available to display inside the item list
  options: any[] = [];

  columns: any[] = [];

  constructor(private dataService: DataService, private apiHttpService: ApiHttpService) {
  }


  table: any[] = [];

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
    // const url = this.dataService.testCelonis()
    // console.log(url);
    // const body = {
    //   "variables": [],
    //   "requests": [
    //     {
    //       "id": "24c7c893-bcd5-47da-bde1-d26399be7d5c||24c7c893-bcd5-47da-bde1-d26399be7d5c||fetch-data",
    //       "request": {
    //         "commands": [
    //           {
    //             "computationId": 0,
    //             "isTransient": null,
    //             "queries": [
    //               " TABLE ( ESTIMATE_CLUSTER_PARAMS ( VARIANT(\"_CEL_P2P_ACTIVITIES_EN_parquet\".\"ACTIVITY_EN\"), 2, 20, 5 ) \nAS \"New Expression\") ORDER BY ESTIMATE_CLUSTER_PARAMS ( VARIANT(\"_CEL_P2P_ACTIVITIES_EN_parquet\".\"ACTIVITY_EN\"), 2, 20, 5 )\n DESC LIMIT 400 OFFSET 0"
    //             ]
    //           }
    //         ],
    //         "cubeId": null
    //       }
    //     },
    //   ],
    //   "version": 1
    // }

    // this.dataService.updateData(url, body)


    // https://academic-henrik-falke-rwth-aachen-de.eu-2.celonis.cloud/process-analytics/analysis/v2/api/analysis/99f38193-e510-4635-9f0a-c0b98b13b451/data_service_batch
    // https://academic-henrik-falke-rwth-aachen-de.eu-2.celonis.cloud/process-analytics/analysis/v2/api/analysis/99f38193-e510-4635-9f0a-c0b98b13b451/data_model
    // this.dataService.getTables().subscribe((data: any) => {
    //
    // })




    // React to Data Changes
    this.dataService.dataSub.subscribe((data: any) => {
      this.options = data;
    })


    // Console Log some more Test-API Calls
    // console.log(this.dataService.getListboxData())
    // console.log(this.dataService.getDataByIdEndpoint("123"))
    // console.log(this.dataService.getDataByIdAndCodeEndpoint("123", 999))
    // console.log(this.dataService.getDataByIdCodeAndYearEndpoint("123", 999, 666))
    // console.log(this.dataService.getProductListByCountryCodeEndpoint("DE"))
    // console.log(this.dataService.getProductListByCountryAndPostalCodeEndpoint("US", "123"));
  }
}
