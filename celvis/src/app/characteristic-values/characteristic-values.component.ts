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
  variantCluster: Map<number,number> = new Map();

  ngOnInit(): void {
    this.dataService.clickedIdSub.subscribe((id: number) => {
      this.clickedId = id;
      this.dataService?.clusters?.data?.forEach((data:any, index: number)=>{
        if(data[0]==this.clickedId){
          this.variantCluster.set(index,data[0]);
          //this.variantPath
        }
      })
      const query ="AVG (\r\n  CALC_THROUGHPUT (\r\n    ALL_OCCURRENCE [ 'Process Start' ]\r\n    TO\r\n    ALL_OCCURRENCE [ 'Process End' ] ,\r\n    REMAP_TIMESTAMPS ( \"BPI2017_application_xes\".\"time:timestamp\" , DAYS )\r\n  )\r\n) \nAS \"Total throughput time in days\", VARIANT ( \"BPI2017_application_xes\".\"concept:name\" )  \nAS \"#{Variantpath}\", Unique_ID(VARIANT ( \"BPI2017_application_xes\".\"concept:name\" )) \nAS \"#{Variant ID}\", MODE ( \"BPI2017_application_xes\".\"org:resource\" ) \nAS \"#{Most involved User}\", AVG (\r\n  CASE WHEN PU_FIRST ( \"BPI2017_application_xes_CASES\" , \"BPI2017_application_xes\".\"Selected\" ) = 1 THEN 1 ELSE 0 END\r\n) \nAS \"New Expression\"\nFORMAT \",.2f\")"
      const body = this.apiEndpoint.createPQLQueryBody(query, this.LIMIT);
    })

    this.dataService.clusterSizeSub.subscribe((id: number) => {
      this.clusterSize = id;
    })
  }

}
