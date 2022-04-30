import { Component, OnInit } from '@angular/core';
import {DataService} from "../api/data-service";
import {AutoUnsubscribe} from "../utility/AutoUnsubscribe";

@Component({
  selector: 'settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
@AutoUnsubscribe()
export class SettingsComponent implements OnInit {
  // Store selected dataset from Tree & the tree itself
  selectedTree: any = {};
  tree: any = [];

  // Store Selected Table (and all tables of the selected dataset)
  selectedTable: any = {};
  tables: any = [];

  // Value, Min and Max for the min-pts Slider
  min_pts_val: number = 50;
  min_pts_min: number = 0;
  min_pts_max: number = 10000;

  // Value, Min and Max for the min-pts Slider
  no_clusters_val: number = 50;
  no_clusters_min: number = 0;
  no_clusters_max: number = 10000;

  constructor(private dataService: DataService) { }

  ngOnInit(): void {
    this.dataService.getPackage();

    this.dataService.treeSub.subscribe((data: any) => {
      // Update tree data if we get new one
      this.tree = data;
    })

    // Subscribe to the Tables
    this.dataService.tableAndColSub.subscribe((data: any) => {
      // Update table and col data if we get new one
      this.tables = data;
    })

    this.dataService.clusterSub.subscribe((data: any) => {
      if(!data.data) return;
      this.unique_clusters = this.dataService.getUniqueValues(this.dataService.convert_2d_to_1d_array(data.data));
    });
  }

  // Only for illustrative purposes, delete later...
  unique_clusters: any = {};

  loadTree() {
    // Get all Tables from the Dataset
    this.dataService.dataset_key = this.selectedTree.id;
    this.dataService.getTablesAndColumns();
  }

  updateColumnSelection() {
    // Get correct Clusters Data
    this.dataService.getClusters(this.selectedTable.parentName, this.selectedTable.name, this.selectedTable?.formula, this.min_pts_val);
  }


  updateSlider() {
    // Get new Clusters
    this.dataService.getClusters(this.selectedTable.parentName, this.selectedTable.name, this.selectedTable?.formula, this.min_pts_val);
  }
}
