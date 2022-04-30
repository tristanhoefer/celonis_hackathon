import { Component, OnInit } from '@angular/core';

// CommonJS
// @ts-ignore
var Plotly = require('plotly.js-dist')

@Component({
  selector: 'app-piechart',
  templateUrl: './piechart.component.html',
  styleUrls: ['./piechart.component.scss']
})
export class PiechartComponent implements OnInit {

  constructor() { }


  ngOnInit(): void {
    this.updatePieChart()
  }

  updatePieChart() {

    const data  = [{
      values: [19, 26, 6],
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
