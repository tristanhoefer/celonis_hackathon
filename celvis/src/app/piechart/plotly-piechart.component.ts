import { Component, OnInit } from '@angular/core';

// CommonJS
// @ts-ignore
var Plotly = require('plotly.js-dist')

@Component({
  selector: 'app-piechart',
  templateUrl: './plotly-piechart.component.html',
  styleUrls: ['./plotly-piechart.component.scss']
})
export class PlotlyPiechartComponent implements OnInit {

  constructor() { }


  ngOnInit(): void {
    this.updatePieChart()
  }

  updatePieChart() {

    const data  = [{
      values: [19, 26, 55],
      labels: ['Residential', 'Non-Residential', 'Utility'],
      type: 'pie'
    }];

    const layout = {
      height: 400,
      width: 500
    };

    const config = {responsive: true}


    Plotly.newPlot('myDiv1', data, layout, config);
  }
}
