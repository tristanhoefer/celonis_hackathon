import { Component, OnInit } from '@angular/core';
import {DataService} from "../api/data-service";

@Component({
  selector: 'characteristic-values',
  templateUrl: './characteristic-values.component.html',
  styleUrls: ['./characteristic-values.component.scss']
})
export class CharacteristicValuesComponent implements OnInit {

  constructor(private dataService: DataService) { }

  clickedId: number = -5;
  clusterSize: number = 0;

  ngOnInit(): void {
    this.dataService.clickedIdSub.subscribe((id: number) => {
      this.clickedId = id;

      console.log(this.dataService.clusters);
    })

    this.dataService.clusterSizeSub.subscribe((id: number) => {
      this.clusterSize = id;
    })
  }

}
