import { Component, OnInit } from '@angular/core';

import Plotly from 'plotly.js-dist';
// CommonJS
// @ts-ignore
var Plotly = require('plotly.js-dist')


@Component({
  selector: 'plotly-test',
  templateUrl: './plotly-test.component.html',
  styleUrls: ['./plotly-test.component.scss']
})
export class PlotlyTestComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    const data = [
      {
        x: [0, 1, 2],
        y: [6, 10, 2],
        error_y: {
          type: 'data',
          array: [1, 2, 3],
          visible: true
        },
        type: 'scatter'
      }
    ];
    const layout = {
      title: "Responsive to Window size!",
      font: {size: 18}
    }
    const config = {responsive: true}
    Plotly.newPlot('myDiv', data, layout, config);
  }
}
