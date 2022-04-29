import { Component, OnInit } from '@angular/core';
import {DataService} from "../api/data-service";

@Component({
  selector: 'settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  selectedTable: any = {};
  tables: any = [];

  selectedColumnData: any = {};
  colData: any = [];

  val: number = 50;
  min: number = 0;
  max: number = 1000;

  constructor(private dataService: DataService) { }

  ngOnInit(): void {
    // Get all Tables from the Dataset
    this.dataService.getTables();

    // Subscribe to the Tables
    this.dataService.tableSub.subscribe((data: any) => {
      console.log("DATA: ", data);
      this.tables = data;
    })


  }


  updateTableSelection() {
    // Get Column Data
    console.log("Changed to ", this.selectedTable);
    this.dataService.getSelectedColData(this.selectedTable);
  }
}
