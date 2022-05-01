import {Component, OnInit} from '@angular/core';
import {DataService} from "../api/data-service";
import {AutoUnsubscribe} from "../utility/AutoUnsubscribe";

// CommonJS
// @ts-ignore
var Plotly = require('plotly.js-dist')

@Component({
  selector: 'app-piechart',
  templateUrl: './plotly-piechart.component.html',
  styleUrls: ['./plotly-piechart.component.scss']
})
@AutoUnsubscribe()
export class PlotlyPiechartComponent implements OnInit {

  constructor(private dataService: DataService) {
  }

  labels: any[] = [];
  values: any[] = [];

  ngOnInit(): void {
    this.updatePieChart()

    this.dataService.clusterInformalDataSub.subscribe((data: any) => {
      this.labels = [];
      this.values = [];
      this.labels.push(-1);
      this.values.push(data[-1]);
      data.forEach((d: any, index: number) => {
        this.labels.push(index);
        this.values.push(d);
      });
      this.updatePieChart();
    })
  }


  updatePieChart() {
    const data = [{
      values: this.values,
      labels: this.labels,
      type: 'pie'
    }];

    const layout = {
    };

    const config = {responsive: true}


    Plotly.newPlot('myDiv1', data, layout, config);

    let myPlot: any = document.getElementById('myDiv1');
    if(!myPlot) return;
    myPlot.on('plotly_click', (data: any) => {
      if(!data.points?.length || !data.points[0]?.label) return;
      this.dataService.setClickedId(data.points[0].label);
      this.dataService.setClusterSize(data.points[0].value);
    });
  }
}
