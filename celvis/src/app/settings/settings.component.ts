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

  selectedTree: any = {};
  tree: any = [];

  selectedColumnData: any = {};
  colData: any = [];

  val: number = 50;
  min: number = 0;
  max: number = 1000;

  constructor(private dataService: DataService) { }

  ngOnInit(): void {

    this.dataService.getPackage();

    this.dataService.treeSub.subscribe((data: any) => {
      console.log(data);
      this.tree = data;
    })

    // Subscribe to the Tables
    this.dataService.tableSub.subscribe((data: any) => {
      console.log("DATA: ", data);
      this.tables = data;
    })


  }

  loadTree() {
    // Get all Tables from the Dataset
    console.log(this.selectedTree);
    this.dataService.dataset_key = this.selectedTree.id;
    this.dataService.getTables();
  }

  updateTableSelection() {
    // Get Column Data
    console.log("Changed to ", this.selectedTable);
    this.dataService.getSelectedColData(this.selectedTable);
    this.dataService.getSliderData(this.selectedTable);
  }
}
