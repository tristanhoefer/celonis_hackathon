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
    this.dataService.getPlainData(this.xAxisSelection.parentName, this.xAxisSelection.name, this.xAxisSelection?.formula).subscribe((data: any) => {
      const res = data.results[0].result.components[0].results[0];
      const raw_data = this.dataService.convert_2d_to_1d_array(res.data);
      this.xAxisIds = this.dataService.convert_2d_to_1d_array(res.ids);
      this.xAxisData = raw_data;
      this.xAxisDataSub.next(raw_data);
    });
  }

  /**
   * Load the Y-Data for the selected Column
   */
  getYData() {
    this.dataService.getPlainData(this.yAxisSelection.parentName, this.yAxisSelection.name, this.yAxisSelection?.formula).subscribe((data: any) => {
      const res = data.results[0].result.components[0].results[0];
      const raw_data = this.dataService.convert_2d_to_1d_array(res.data);
      this.yAxisData = raw_data;
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
      this.updatePlot(this.xAxisData, this.yAxisData, this.color)
    })

    this.xAxisDataSub.subscribe((data: any) => {
      if (!data?.length) return;
      this.updatePlot(this.xAxisData, this.yAxisData, this.color)
    })

    this.dataService.clusterSub.subscribe((data: any) => {
      if (!data?.data?.length) return;
      // Get the Number of Clusters
      this.num_colors = (this.dataService.getUniqueValues(
        this.dataService.convert_2d_to_1d_array(this.dataService.clusters?.data))?.length || 1)

      console.log("CLUSTER DATA: ", data);

      // Update Colors if we have Clusters
      this.color = this.dataService.convert_2d_to_1d_array(data.data, this.generateColorByIndex.bind(this));
      this.updatePlot(this.xAxisData, this.yAxisData, this.color)
    })
  }

  // Create contrast-rich color...
  generateColorByIndex(idx: number) {
    const hue = Math.max(0, idx * (360 / this.num_colors) % 360); // use golden angle approximation
    return `hsl(${hue}, 100%, 50%)`;
  }

  /**
   * Update the Plotly Plot
   * @param x X-Coordinates
   * @param y Y-Coordinates
   * @param color Color of the dots (optional)
   */
  updatePlot(x: any[], y: any[], color: any[] = []) {
    if (x.length !== color.length) color = "0".repeat(x.length).split("");
    // console.log("DATA: ", x, y);

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
