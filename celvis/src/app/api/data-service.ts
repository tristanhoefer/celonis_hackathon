import {Injectable} from '@angular/core';
import {QueryStringParameters} from "./query-string-parameters";
import {ApiEndpointsService} from "./api-endpoints.service";
import {ApiHttpService} from "./ApiHttpService";
import {BehaviorSubject} from "rxjs";
import {AutoUnsubscribe} from "../utility/AutoUnsubscribe";

/**
 * Service which can Create API-Endpoints which then can be used inside the components
 */
@Injectable()
@AutoUnsubscribe()
export class DataService {
  readonly LIMIT = 1000;

  // readonly KEY: string  = "99f38193-e510-4635-9f0a-c0b98b13b451"
  // Key of the Dataset we use
  dataset_key: string = "";

  // Data object with current data queried from the API
  tableAndCol: any = {};
  tableAndColSub: BehaviorSubject<any> = new BehaviorSubject([]);

  // Data object with current data queried from the API
  tree: any = {};
  treeSub: BehaviorSubject<any> = new BehaviorSubject([]);


  // Cluster object with current data queried from the API
  clusters: any = {};
  // BehaviourSubject watching the data (so we can subscribe to it and can react to changes properly)
  clusterSub: BehaviorSubject<any> = new BehaviorSubject([]);


  constructor(private apiEndpoint: ApiEndpointsService, private apiHttpService: ApiHttpService) {
  }


  // API URL ENDPOINTS
  public getDataModelFromAPI = (): string => this.apiEndpoint.createUrl('analysis/' + this.dataset_key + '/data_model', false);
  public data_service_batch = (): string => this.apiEndpoint.createUrl('analysis/' + this.dataset_key + '/data_service_batch', false);




  /**
   * Get the Clustering for
   * @param tableName TableName to Query
   * @param columnName ColumnName to Query
   * @param minPts
   * @param epsilon
   */
  getClusters(tableName: string, columnName: string, minPts: number, epsilon: number = 2) {
    const query = "CLUSTER_VARIANTS ( VARIANT(\"" + tableName + "\".\"" + columnName + "\"), " + minPts + ", " + epsilon + ") \nAS \"New Expression\"\n"
    const body = this.apiEndpoint.createPQLQueryBody(query, this.LIMIT);

    this.apiHttpService.post(this.data_service_batch(), body).subscribe((data: any) => {
      this.clusters = data.results[0].result.components[0].results[0];
      this.clusterSub.next(data.results[0].result.components[0].results[0]);
    })
  }

  getPlainData(tableName: string, columnName: string) {
    const query = "\"" + tableName + "\".\"" + columnName + "\"";
    const body = this.apiEndpoint.createPQLQueryBody(query, this.LIMIT);


    return this.apiHttpService.post(this.data_service_batch(), body);
  }

  // Get an Array of Unique Values from an Array of Values
  getUniqueValues(data: any) {
    return ([...new Set(data)])
  }

  // Convert a 2D-Array (Celonis Answers are 2D...) into 1D Array
  convert_2d_to_1d_array(data: any, fn?: any) {
    let arr = [];
    for (let row of data) for (let e of row) arr.push((fn) ? fn(e) : e);
    return arr;
  }


  // SOME HELPER FUNCTIONS AFTER THAT

  // Get the available Tables from a previously selected dataset
  getTablesAndColumns() {
    const url = this.getDataModelFromAPI()
    this.apiHttpService.get(url).subscribe((response: any) => {
      // If we got a response, process it accordingly
      const constructed_table: any = [];
      response.tables.forEach((table: any) => {
        const table_obj: any = {
          "name": table.name,
          "shortName": table.shortName,
          "id": table.id
        };

        table_obj.columns = [];
        table.columns.forEach((col: any) => {
          const col_obj: any = {
            "parentName": table.name,
            "name": col.name,
            "shortName": col.shortName,
            "id": col.id
          };
          table_obj.columns.push(col_obj);
        })

        constructed_table.push(table_obj);
      })

      // Trigger Table Changes
      this.tableAndCol = constructed_table;
      this.tableAndColSub.next(constructed_table);
    })
  }

  // Get the available Tree-Options
  getPackage() {
    // Url (static here...)
    const url = "https://academic-henrik-falke-rwth-aachen-de.eu-2.celonis.cloud/package-manager//api/nodes/tree?spaceId=eb9a8418-c31c-4977-926e-925ec6147fca";

    this.apiHttpService.get(url).subscribe((response: any) => {
      // If we have a result, create a proper data structure
      let assets: any[] = [];
      let folders: any[] = [];
      let packages: any[] = [];
      response.forEach((r: any) => {
        switch (r.nodeType) {
          case "ASSET":
            assets.push(r)
            break;
          case "FOLDER":
            folders.push(r);
            break;
          case "PACKAGE":
            packages.push(r);
            break;
        }
      })

      const tree_map: any[] = [];
      packages.forEach((p: any) => {
        tree_map.push({
          "key": p.key,
          "name": p.name,
          "parentNodeKey": p.parentNodeKey,
          "id": p.id,
          "folders": []
        });
      });

      folders.forEach((f: any) => {
        const index = tree_map.findIndex((p) => p.key === f.parentNodeKey);
        if (index === -1) return;
        tree_map[index].folders.push({
          "key": f.key,
          "name": f.name,
          "parentNodeKey": f.parentNodeKey,
          "id": f.id,
          "assets": []
        });
      })

      assets.forEach((as: any) => {
        const index = tree_map.findIndex((p: any) => p.key === as.rootNodeKey);
        if (index === -1) return;
        const correct_idx = tree_map[index].folders.findIndex((p: any) => p.key === as.parentNodeKey);
        if (correct_idx === -1) return;
        tree_map[index].folders[correct_idx].assets.push({
          "key": as.key,
          "name": as.name,
          "parentNodeKey": as.parentNodeKey,
          "id": as.id,
        });
      })

      // Set the variables accordingly
      this.tree = tree_map;
      this.treeSub.next(tree_map);
    });
  }
}
