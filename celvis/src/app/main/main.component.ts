import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {DataService} from "../api/data-service";

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  constructor(private dataService: DataService, private cdRef: ChangeDetectorRef) {
  }

  collapsed: boolean = true;

  update() {
    this.collapsed = !this.collapsed;
  }

  ngOnInit(): void {
    this.dataService.clickedIdSub.subscribe((id: number) => {
      if(id > -3) this.collapsed = false;
    })

    this.dataService.clusterSizeSub.subscribe((size: number) => {
      if(size < 0) return;
      this.updateSlider(size);
    })

    this.dataService.totalNumberOfVariantsSub.subscribe((size: number) => {
      if(size < 0) return;
      this.updateSlider(size);
    })
  }

  updateSlider(maxSize: number) {
    if(isNaN(maxSize)) return;
    this.slider_max_value = maxSize;
    this.number_of_activities_range = [this.slider_min_value, this.slider_max_value];
    this.cdRef.detectChanges();
  }

  slider_max_value: number = 100;
  slider_min_value: number = 0;
  number_of_activities_range: number[] = [10, 90];

  showTau: boolean = false;
  tauOptions: any = [{label: 'Show Tau', value: true}, {label: "Hide Tau", value: false}];

  updateMiner() {
    this.dataService.number_of_activities_range = this.number_of_activities_range;
    this.dataService.showTau = this.showTau;
    this.dataService.updateMiner();
  }
}
