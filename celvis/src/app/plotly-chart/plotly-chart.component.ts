import {Component, OnInit} from '@angular/core';
import {DataService} from "../api/data-service";
import {BehaviorSubject} from "rxjs";
import {AutoUnsubscribe} from "../utility/AutoUnsubscribe";

// CommonJS
// @ts-ignore
var Plotly = require('plotly.js-dist')


@Component({
  selector: 'plotly-chart',
  templateUrl: './plotly-chart.component.html',
  styleUrls: ['./plotly-chart.component.scss']
})
@AutoUnsubscribe()
export class PlotlyChartComponent implements OnInit {
  visibleXData: any[] = [];
  visibleYData: any[] = [];
  visibleColor: any[] = [];

  updateRealSelect() {
    this.visibleXData = [];
    this.visibleYData = [];
    this.visibleColor = [];
    let ids: Set<number> = new Set();
    this.xAxisData.forEach((d: any, index: number) => {
      if (!this.xAxisSelectedDataOptions.includes(d)) ids.add(index);
    })
    this.yAxisData.forEach((d: any, index: number) => {
      if (!this.yAxisSelectedDataOptions.includes(d)) ids.add(index);
    })

    this.xAxisData.forEach((d: any, index: number) => {
      if (!ids.has(index)) this.visibleXData.push(d);
    })
    this.yAxisData.forEach((d: any, index: number) => {
      if (!ids.has(index)) this.visibleYData.push(d);
    })
    this.color.forEach((d: any, index: number) => {
      if (!ids.has(index)) this.visibleColor.push(d);
    })
    this.updatePlot(this.visibleXData, this.visibleYData, this.visibleColor)
  }

  // updateRealSelect() {
  // this.visibleXData = [];
  // this.visibleYData = [];
  // this.xAxisData.forEach((d: any, index: number) => {
  //   if(this.xAxisSelectedDataOptions.includes(d)) {
  //     this.visibleXData.push(d);
  //   }
  // })
  // this.yAxisData.forEach((d: any, index: number) => {
  //   if(this.yAxisSelectedDataOptions.includes(d)) {
  //     this.visibleYData.push(d);
  //   }
  // })
  // this.color.forEach((d: any, index: number) => {
  //   if(this.xAxisSelectedDataOptions.includes(d)) {
  //     this.visibleColor.push(d);
  //   }
  // })
  // this.updatePlot(this.visibleXData, this.visibleYData, this.visibleColor)
  // }


  xAxisDataOptions: any[] = [];
  xAxisSelectedDataOptions: any[] = [];
  yAxisDataOptions: any[] = [];
  yAxisSelectedDataOptions: any[] = [];


  xAxisOptions: any[] = [];
  yAxisOptions: any[] = [];
  xAxis: string = "Select Xaxis"

  // Store X-Axis Selections
  xAxisSelection: any = {};
  xAxisData: any[] = [];
  xAxisIds: any[] = [];
  xAxisDataSub: BehaviorSubject<any> = new BehaviorSubject([]);

  // Store Y-Axis Selections
  yAxisSelection: any = {};
  yAxisData: any[] = [];
  yAxisDataSub: BehaviorSubject<any> = new BehaviorSubject([]);

  num_colors: number = 1; // How many numbers ( = Clusters) do we actually have
  color: any[] = [];

  /**
   * Load the X-Data for the selected Column
   */
  getXData() {
    this.loading = true;
    this.dataService.getPlainData(this.xAxisSelection.parentName, this.xAxisSelection.name, this.xAxisSelection?.formula).subscribe((data: any) => {
      if (!data.results.length || data.results[0].result.components.length) {
        this.loading = false;
        return;
      }
      const res = data.results[0].result.components[0]?.results[0];
      const raw_data = this.dataService.convert_2d_to_1d_array(res.data);
      this.xAxisIds = this.dataService.convert_2d_to_1d_array(res.ids);
      this.xAxisData = raw_data;

      this.loading = false;
      this.xAxisDataOptions = this.dataService.getUniqueValues(raw_data);
      this.xAxisSelectedDataOptions = this.xAxisDataOptions;

      this.visibleXData = this.xAxisData;
      this.xAxisDataSub.next(raw_data);
    });
  }

  loading: boolean = false;


  /**
   * Load the Y-Data for the selected Column
   */
  getYData() {
    this.loading = true;
    this.dataService.getPlainData(this.yAxisSelection.parentName, this.yAxisSelection.name, this.yAxisSelection?.formula).subscribe((data: any) => {
      if (!data.results.length || data.results[0].result.components.length) {
        this.loading = false;
        return;
      }

      const res = data.results[0].result.components[0].results[0];
      const raw_data = this.dataService.convert_2d_to_1d_array(res.data);
      this.loading = false;
      this.yAxisDataOptions = this.dataService.getUniqueValues(raw_data);
      this.yAxisSelectedDataOptions = this.yAxisDataOptions;

      this.yAxisData = raw_data;
      this.visibleYData = this.yAxisData;
      this.yAxisDataSub.next(raw_data);
    });
  }

  constructor(private dataService: DataService) {
  }

  ngOnInit() {
    this.dataService.tableAndColSub.subscribe((data: any) => {
      this.xAxisOptions = data;
      this.yAxisOptions = data;
    })

    this.yAxisDataSub.subscribe((data: any) => {
      if (!data?.length) return;
      this.updatePlot(this.visibleXData, this.visibleYData, this.visibleColor)
    })

    this.xAxisDataSub.subscribe((data: any) => {
      if (!data?.length) return;
      this.updatePlot(this.visibleXData, this.visibleYData, this.visibleColor)
    })

    this.dataService.clusterSub.subscribe((data: any) => {
      if (!data?.data?.length) return;
      // Get the Number of Clusters
      this.num_colors = (this.dataService.getUniqueValues(
        this.dataService.convert_2d_to_1d_array(this.dataService.clusters?.data))?.length || 1)

      // Update Colors if we have Clusters
      this.color = this.dataService.convert_2d_to_1d_array(data.data).map((val: number) => val + 2);
      // this.color = this.dataService.convert_2d_to_1d_array(data.data, this.generateColorByIndex.bind(this));
      this.visibleColor = this.color;
      this.updatePlot(this.visibleXData, this.visibleYData, this.visibleColor)
    })
  }


  /**
   * Update the Plotly Plot
   * @param x X-Coordinates
   * @param y Y-Coordinates
   * @param color Color of the dots (optional)
   */
  updatePlot(x: any[], y: any[], color: any[] = []) {
    if(x.length > 1000) x = x.slice(0, 1000)
    if(y.length > 1000) y = y.slice(0, 1000)
    if(color.length > 1000) color = color.slice(0, 1000)

    const data = [
      {
        x: x,
        y: y,
        mode: 'markers',
        marker: {
          size: 10,
          color: this.visibleColor,
          colorscale: [
            ['0.0', 'rgb(165,0,38)'],
            ['0.111111111111', 'rgb(215,48,39)'],
            ['0.222222222222', 'rgb(244,109,67)'],
            ['0.333333333333', 'rgb(253,174,97)'],
            ['0.444444444444', 'rgb(254,224,144)'],
            ['0.555555555556', 'rgb(224,243,248)'],
            ['0.666666666667', 'rgb(171,217,233)'],
            ['0.777777777778', 'rgb(116,173,209)'],
            ['0.888888888889', 'rgb(69,117,180)'],
            ['1.0', 'rgb(49,54,149)']
          ],
        },
        type: 'scatter'
      }
    ];
    const layout = {
      font: {size: 12}
    }
    const config = {responsive: true}

    Plotly.newPlot('myDiv', data, layout, config);
  }


  // Trigger on X-Axis Changes
  xChange(event: any) {
    this.xAxisSelection = event.value;
    this.getXData();
  }

  // Trigger on Y-Axis Changes
  yChange(event: any) {
    this.yAxisSelection = event.value;
    this.getYData();
  }
}
