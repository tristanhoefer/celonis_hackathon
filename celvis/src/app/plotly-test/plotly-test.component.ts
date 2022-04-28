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
    var data = [
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
    Plotly.newPlot('myDiv', data);
  }
}
