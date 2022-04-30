import { Component, OnInit } from '@angular/core';

import Plotly from 'plotly.js-dist';
import {DataService} from "../api/data-service";
// CommonJS
// @ts-ignore
var Plotly = require('plotly.js-dist')


@Component({
  selector: 'plotly-test',
  templateUrl: './plotly-test.component.html',
  styleUrls: ['./plotly-test.component.scss']
})
export class PlotlyTestComponent implements OnInit {

  constructor(private dataService: DataService) { }

  ngOnInit() {
    this.updatePlot([0, 1, 2], [2, 9, 5]);

    this.dataService.tableSub.subscribe((data: any) => {
      this.xAxisOptions = data;
      this.yAxisOptions = data;
      console.log("PLOTLY DATA: ", data);
    })

    this.dataService.yAxisDataSub.subscribe((data: any) => {
      this.updatePlot(this.dataService.xAxisData, this.dataService.yAxisData, this.dataService.color)
    })

    this.dataService.xAxisDataSub.subscribe((data: any) => {
      this.updatePlot(this.dataService.xAxisData, this.dataService.yAxisData, this.dataService.color)
    })

    this.dataService.clusterSub.subscribe((data: any) => {
      this.updatePlot(this.dataService.xAxisData, this.dataService.yAxisData, this.dataService.color)
    })
  }

  updatePlot(x: any[], y: any[], color: any[] = []) {
    if(x.length !== color.length) {
      color = "0".repeat(x.length).split("");
    }
    console.log("DATA: ", x, y);
    console.log("COLOR: ", color);

    const data = [
      {
        x: x,
        y: y,
        mode: 'markers',
        marker: {
          size: 10,
          color: color
        },
        type: 'scatter'
      }
    ];
    const layout = {
      title: "Test Title...!",
      font: {size: 12}
    }
    const config = {responsive: true}
    Plotly.newPlot('myDiv', data, layout, config);
  }

  xAxis: any = {};
  yAxis: any = {};
  xAxisOptions: any[] = [];
  yAxisOptions: any[] = [];

  xChange() {

    console.log(this.xAxis);
    this.dataService.xAxisSelection = this.xAxis;
    this.dataService.getXData();
  }

  yChange() {
    this.dataService.yAxisSelection = this.yAxis
    this.dataService.getYData();
  }
}
