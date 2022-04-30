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
  min_pts_val: number = 20;
  min_pts_min: number = 1;
  min_pts_max: number = 10000;

  // Value, Min and Max for the min-pts Slider
  no_clusters_val: number = 1;
  no_clusters_min: number = 1;
  no_clusters_max: number = 50;
  no_cluster_data: number[] = [];

  // Token for mutual exclusion
  exclusion_token: boolean = false;

  constructor(private dataService: DataService, private cdRef: ChangeDetectorRef) { }

  @ViewChild('csTmp') test: TemplateRef<CascadeSelectModule> | undefined = undefined;

  ngOnInit(): void {
    this.dataService.getPackage();

    this.dataService.treeSub.subscribe((data: any) => {
      // Update tree data if we get new one
      this.tree = data;

      this.loadTree({value: {
          "key": "bpi-2017-niklas",
          "name": "BPI-2017 Niklas",
          "parentNodeKey": "29a19f6a-dc36-42c2-8f6c-3afd97cd2d2d",
          "id": "75209638-ba94-4651-bc5c-7bc0a107a8d4"
        }})

      this.dataService.getVariantCount().subscribe((data:any)=>{
        console.log("test" + data);
      });
    })

    this.dataService.clusterSub.subscribe((data: any) => {
      if(!data.data) return;
      this.unique_clusters = this.dataService.getUniqueValues(this.dataService.convert_2d_to_1d_array(data.data));
    });

    this.dataService.clusterEstimateSub.subscribe((data: any) => {
      console.log(data.length)
      if(!data.length) return;
      this.no_cluster_data = data
      this.updateSliderClusters();
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
    // this.dataService.getClusters(this.selectedVariant.parentName, this.selectedVariant.name, this.min_pts_val);
    this.dataService.testMiner(this.selectedVariant);
    this.dataService.getClustersEstimates(this.selectedVariant.parentName, this.selectedVariant.name);
    console.log("MIN_PTS: ", this.min_pts_val);
    // this.dataService.getClusters(this.selectedVariant.parentName, this.selectedVariant.name, this.min_pts_val);
  }


  updateSliderMinPts() {
    if(!this.exclusion_token){
      this.exclusion_token = true;
      this.dataService.getClusters(this.selectedVariant.parentName, this.selectedVariant.name, this.min_pts_val);
      const data: number[] = this.no_cluster_data
      if(!data.length) {
        this.exclusion_token = false;
        return;
      }

      const closestValue: number = data.reduce((prev, curr) => Math.abs(curr - this.min_pts_val) < Math.abs(prev - this.min_pts_val) ? curr : prev);
      this.no_clusters_val = data.findIndex((d: any) => d == closestValue)
      this.exclusion_token = false;
    }
  }

  updateSliderClusters(){
    if(!this.exclusion_token){
      this.exclusion_token = true;
      this.dataService.getClusters(this.selectedVariant.parentName, this.selectedVariant.name, this.no_cluster_data[this.no_clusters_val-1]);
      this.min_pts_val = this.no_cluster_data[this.no_clusters_val-1]
      this.exclusion_token = false;
    }

  }
}
