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

  constructor(private dataService: DataService) { }

  ngOnInit(): void {
    this.dataService.getTables();

    this.dataService.tableSub.subscribe((data: any) => {
      console.log("DATA: ", data);
      this.tables = data;
    })
  }

}
