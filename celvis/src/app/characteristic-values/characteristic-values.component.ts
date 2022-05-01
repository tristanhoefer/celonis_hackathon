import {Component, OnInit} from '@angular/core';
import {DataService} from "../api/data-service";
import {AutoUnsubscribe} from "../utility/AutoUnsubscribe";
import {ApiEndpointsService} from "../api/api-endpoints.service";
import {ApiHttpService} from "../api/ApiHttpService";

@Component({
  selector: 'characteristic-values',
  templateUrl: './characteristic-values.component.html',
  styleUrls: ['./characteristic-values.component.scss']
})
@AutoUnsubscribe()
export class CharacteristicValuesComponent implements OnInit {
  constructor(private dataService: DataService, private apiEndpoint: ApiEndpointsService, private apiHttpService: ApiHttpService) {
  }

  activities: any = [];
  selectedActivity: string = "";

  clickedId: number = -5;
  clusterSize: number = 0;

  numberDistinctTraces: number = 0;
  averageActionsPerTrace: number = 0;
  customers: any[] = [];

  averageThroughputTime: number = 0;
  averateCompletionRate: number = 0;

  loading: boolean = false;

  shouldBeVisible() {
    return (this.dataService.activityTableName === "BPI2017_application_xes")
  }

  ngOnInit(): void {
    this.dataService.clickedIdSub.subscribe((id: number) => {
      this.loading = true;
      this.clickedId = id;

      const cluster_query = "CLUSTER_VARIANTS ( VARIANT(\"" + this.dataService.tableClusters + "\".\"" + this.dataService.columnClusterName + "\"), " + this.dataService.minPts + ", " + this.dataService.epsilon + ") \nAS \"Cluster\"\n";
      const query = "AVG (\r\n  CALC_THROUGHPUT (\r\n    ALL_OCCURRENCE [ 'Process Start' ]\r\n    TO\r\n    ALL_OCCURRENCE [ 'Process End' ] ,\r\n    REMAP_TIMESTAMPS ( \"BPI2017_application_xes\".\"time:timestamp\" , DAYS )\r\n  )\r\n) \nAS \"Total throughput time in days\", VARIANT ( \"BPI2017_application_xes\".\"concept:name\" )  \nAS \"#{Variantpath}\", Unique_ID(VARIANT ( \"BPI2017_application_xes\".\"concept:name\" )) \nAS \"#{Variant ID}\", MODE ( \"BPI2017_application_xes\".\"org:resource\" ) \nAS \"#{Most involved User}\", AVG (\r\n  CASE WHEN PU_FIRST ( \"BPI2017_application_xes_CASES\" , \"BPI2017_application_xes\".\"Selected\" ) = 1 THEN 1 ELSE 0 END\r\n) \nAS \"New Expression\"\n FORMAT \",.2f\", " + cluster_query + "";
      const body = this.apiEndpoint.createPQLQueryBody(query, this.dataService.LIMIT);
      this.apiHttpService.post(this.dataService.data_service_batch(), body).subscribe((data: any) => {
        if (!data?.results?.length || !data.results[0]?.result?.components[0]?.results?.length) return;
        const tmp_data = data.results[0].result.components[0].results[0].data;
        const real_data = tmp_data.filter((d: any) => d[5] == this.clickedId);
        const transposed_data = this.transpose(real_data);

        // Get number of distinct traces & average no of actions per trace
        this.numberDistinctTraces = transposed_data[1].length;
        this.averageActionsPerTrace = 0;
        transposed_data[1].forEach((d: any) => {
          this.averageActionsPerTrace += d.split(", ").length;
        })
        this.averageActionsPerTrace = Math.round(this.averageActionsPerTrace / this.numberDistinctTraces);


        const val1: any = transposed_data[3].reduce(function (acc: any, curr: any) {
          return acc[curr] ? ++acc[curr] : acc[curr] = 1, acc
        }, {});

        this.customers = [];
        Object.keys(val1).forEach(key => {
          this.customers.push({"name": key, "amount": val1[key]});
        });

        this.averageThroughputTime = Math.round(transposed_data[0].reduce((pv: any, cv: any) => pv + cv, 0) / transposed_data[0].length * 100) / 100;
        this.averateCompletionRate = Math.round(transposed_data[4].reduce((pv: any, cv: any) => pv + cv, 0) / transposed_data[4].length * 100) / 100;

        this.loading = false;
      })
    })

    this.dataService.clusterSizeSub.subscribe((id: number) => {
      this.clusterSize = id;
    })
    this.dataService.activityValSub.subscribe((data: any) => {
      this.activities = data;
    })
    this.dataService.clusterSizeSub.subscribe((id: number) => {
      this.clusterSize = id;
    });

  }

  numVariant: any = 0;
  loadVariantProperties() {
    this.dataService.getVariant(this.selectedActivity);
    this.dataService.getVariantSub.subscribe((data: any) => {
      this.numVariant = data.reduce((pv: any, cv: any) => pv + cv, 0);
    })
  }

  transpose(array: any[]) {
    return array[0].map((_: any, colIndex: number) => array.map(row => row[colIndex]));
  }
}
