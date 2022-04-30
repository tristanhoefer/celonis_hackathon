import {ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {DataService} from "../api/data-service";
import {AutoUnsubscribe} from "../utility/AutoUnsubscribe";
import {CascadeSelectModule} from "primeng/cascadeselect";

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
  selectedVariant: any = {};
  valid_variants: any = [];

  // Value, Min and Max for the min-pts Slider
  min_pts_val: number = 50;
  min_pts_min: number = 0;
  min_pts_max: number = 10000;

  // Value, Min and Max for the min-pts Slider
  no_clusters_val: number = 50;
  no_clusters_min: number = 0;
  no_clusters_max: number = 10000;

  constructor(private dataService: DataService, private cdRef: ChangeDetectorRef) { }

  @ViewChild('csTmp') test: TemplateRef<CascadeSelectModule> | undefined = undefined;

  ngOnInit(): void {
    this.dataService.getPackage();

    this.dataService.treeSub.subscribe((data: any) => {
      // Update tree data if we get new one
      this.tree = data;
    })

    this.dataService.clusterSub.subscribe((data: any) => {
      if(!data.data) return;
      this.unique_clusters = this.dataService.getUniqueValues(this.dataService.convert_2d_to_1d_array(data.data));
    });
  }

  ngAfterViewInit(): void {
    // Subscribe to the Tables
    this.dataService.tableAndColSub.subscribe((data: any) => {
      // Update table and col data if we get new one
      this.valid_variants = this.dataService.valid_variants;
      this.cdRef.detectChanges();
      if(this.valid_variants.length && this.valid_variants[0].columns?.length) {
        this.updateColumnSelection({"value": this.valid_variants[0].columns[0]})
      }
    })
  }

  // Only for illustrative purposes, delete later...
  unique_clusters: any = {};

  loadTree(event: any) {
    // Get all Tables from the Dataset
    this.selectedTree = event.value;
    this.dataService.dataset_key = this.selectedTree.id;
    this.dataService.getTablesAndColumns();
  }

  updateColumnSelection(event: any) {
    this.selectedVariant = event.value;
    // Get correct Clusters Data
    this.dataService.getClusters(this.selectedVariant.parentName, this.selectedVariant.name, this.min_pts_val);
    this.dataService.testMiner(this.selectedVariant);
  }


  updateSlider() {
    this.dataService.getClusters(this.selectedVariant.parentName, this.selectedVariant.name, this.min_pts_val);
    // Get new Clusters
  }
}
