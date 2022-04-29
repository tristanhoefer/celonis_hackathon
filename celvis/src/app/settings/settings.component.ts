import { Component, OnInit } from '@angular/core';
import {DataService} from "../api/data-service";
import {SliderModule} from 'primeng/slider';


@Component({
  selector: 'settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  selectedTable: any = {};
  tables: any = [];

  val: number = 50; //initial number for slider
  min: number = 0; //min value for slider
  max: number = 1000; //max value for slider

  rangeValues: number[] = [20,80];
  constructor(private dataService: DataService) { }

  ngOnInit(): void {
    this.dataService.getTables();

    this.dataService.tableSub.subscribe((data: any) => {
      console.log("DATA: ", data);
      this.tables = data;
    })
  }

}
