import {Injectable} from '@angular/core';
import {ApiEndpointsService} from "./api-endpoints.service";
import {ApiHttpService} from "./ApiHttpService";
import {BehaviorSubject} from "rxjs";
import {AutoUnsubscribe} from "../utility/AutoUnsubscribe";

declare var PetriNetVanillaVisualizer: any;
declare var ProcessTreeToPetriNetConverter: any;
declare var ProcessTreeVanillaVisualizer: any;
declare var ProcessTree: any;
declare var ProcessTreeOperator: any;
declare var d3: any;


// @ts-ignore
// var graphviz = require('graphviz');

// Create digraph G
// var g = graphviz.digraph("G");


/**
 * Service which can Create API-Endpoints which then can be used inside the components
 */
@Injectable()
@AutoUnsubscribe()
export class DataService {
  readonly LIMIT = 1000000;

  // readonly KEY: string  = "99f38193-e510-4635-9f0a-c0b98b13b451"
  // Key of the Dataset we use
  dataset_key: string = "";

  // Data object with current data queried from the API
  tableAndCol: any = {};
  valid_variants: any = {};
  tableAndColSub: BehaviorSubject<any> = new BehaviorSubject([]);
  caseTableId: string = "";
  activityTableId: string = "";
  caseTableName: string = "";
  activityTableName: string = "";

  // Data object with current data queried from the API
  tree: any = {};
  treeSub: BehaviorSubject<any> = new BehaviorSubject([]);


  // Cluster object with current data queried from the API
  clusters: any = {};
  // BehaviourSubject watching the data (so we can subscribe to it and can react to changes properly)
  clusterSub: BehaviorSubject<any> = new BehaviorSubject([]);

  clusterEstimateSub: BehaviorSubject<any> = new BehaviorSubject([]);


  constructor(private apiEndpoint: ApiEndpointsService, private apiHttpService: ApiHttpService) {
  }


  // API URL ENDPOINTS
  public getDataModelFromAPI = (): string => this.apiEndpoint.createUrl('analysis/' + this.dataset_key + '/data_model', false);
  public data_service_batch = (): string => this.apiEndpoint.createUrl('analysis/' + this.dataset_key + '/data_service_batch', false);


  testMiner(selectedVar: any) {
    if (!selectedVar.isActivityColumn) return;
    const body = this.apiEndpoint.createInductiveMiner(selectedVar.parentName, selectedVar.name);

    this.apiHttpService.post(this.data_service_batch(), body).subscribe((data: any) => {
      const vertex_properties = data.results[0].result.components[0].results[0];
      const edge_properties = data.results[0].result.components[0].results[1];

      const vertex_data = vertex_properties.data; // first entry is number from 0 to 5, second is label => ProcessTree
      const edge_data = edge_properties.data; // first entry is "from" node, second entry is "to" node

      let tmp_map: Map<any, any> = new Map();
      vertex_data.forEach((value: any, index: number) => {
        let operator: any = undefined;
        switch (value[0]) {
          case 0:
            operator = "tau"
            break;
          case 1:
            operator = "";
            break;
          case 2:
            operator = ProcessTreeOperator.EXCLUSIVE_CHOICE;
            break;
          case 3:
            operator = ProcessTreeOperator.SEQUENCE;
            break;
          case 4:
            operator = ProcessTreeOperator.PARALLEL;
            break;
          case 5:
            operator = ProcessTreeOperator.REDO_LOOP;
            break;
        }
        tmp_map.set(index, new ProcessTree(null, operator, value[1]));
      })

      edge_data.slice().reverse().forEach((value: any, index: number) => {
        let test = tmp_map.get(value[1]);
        test.parentNode = tmp_map.get(value[0]);
        tmp_map.get(value[0]).children.push(test);
      });

      const final_tree = tmp_map.get(0);
      let processTree = ProcessTreeVanillaVisualizer.apply(final_tree);
      d3.select("#processTree").graphviz().renderDot(processTree, () => {
        const svg = document.getElementById('processTree')?.getElementsByTagName("svg");
        if (svg) {
          const svg_array = Array.from(svg);
          if (svg_array.length) {
            const svg_elem = svg_array[0];
            svg_elem.setAttribute("width", String((window.innerWidth - 120)));
            svg_elem.setAttribute("height", "400");
          }
        }
      });

      let acceptingPetriNet = ProcessTreeToPetriNetConverter.apply(final_tree);
      let petriNet = PetriNetVanillaVisualizer.apply(acceptingPetriNet)
      d3.select('#petriNet').graphviz().renderDot(petriNet, () => {
        const svg = document.getElementById('petriNet')?.getElementsByTagName("svg");
        if (svg) {
          const svg_array = Array.from(svg);
          if (svg_array.length) {
            const svg_elem = svg_array[0];
            svg_elem.setAttribute("width", String((window.innerWidth - 120)));
            svg_elem.setAttribute("height", "400");
          }
        }
      });
    })
  }


  /**
   * Get the Clustering for
   * @param tableName TableName to Query
   * @param columnName ColumnName to Query
   * @param formula
   * @param minPts
   * @param epsilon
   */
  getClusters(tableName: string, columnName: string, minPts: number, epsilon: number = 2) {
    const query = "CLUSTER_VARIANTS ( VARIANT(\"" + tableName + "\".\"" + columnName + "\"), " + minPts + ", " + epsilon + ") \nAS \"New Expression\"\n";
    const body = this.apiEndpoint.createPQLQueryBody(query, this.LIMIT);

    this.apiHttpService.post(this.data_service_batch(), body).subscribe((data: any) => {
      if (!data?.results?.length || !data.results[0]?.result?.components[0]?.results?.length) return;
      this.clusters = data.results[0].result.components[0].results[0];
      this.clusterSub.next(data.results[0].result.components[0].results[0]);

      if (!this.clusters.data.length) return;
      const arr = this.convert_2d_to_1d_array(this.clusters.data);
      let counts: any = [];
      for (let i = 0; i < arr.length; i++) {
        counts[arr[i]] = 1 + (counts[arr[i]] || 0);
      }

      this.clusterInformalData = counts;
      this.clusterInformalDataSub.next(counts);
    })
  }

  clusterInformalData: any[] = [];
  clusterInformalDataSub: BehaviorSubject<any> = new BehaviorSubject([]);


  getClustersEstimates(tableName: string, columnName: string, epsilon: number = 2, numberOfValues: number = 100, recursion_depth: number = 5) {
    const query = "ESTIMATE_CLUSTER_PARAMS ( VARIANT(\"" + tableName + "\".\"" + columnName + "\"), " + epsilon + ", " + numberOfValues + ", " + recursion_depth + ") \nAS \"New Expression\"\n"
    const body = this.apiEndpoint.createPQLQueryBody(query, this.LIMIT);

    this.apiHttpService.post(this.data_service_batch(), body).subscribe((data: any) => {
      const a = data.results[0].result.components[0].results[0];
      const content = this.convert_2d_to_1d_array(a.data);
      this.clusterEstimateSub.next(content);
    })
  }

  getPlainData(tableName: string, columnName: string, formula: string | undefined = undefined) {
    let query = "";

    if (formula) {
      query = formula;
    } else {
      query = "\"" + tableName + "\".\"" + columnName + "\"";
    }
    const body = this.apiEndpoint.createPQLQueryBody(query, this.LIMIT);
    return this.apiHttpService.post(this.data_service_batch(), body);
  }

  getVariantCount() {
    const query = "COUNT ( KPI(\"Process variants\"))"
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
      this.caseTableId = response.caseTableId;
      this.activityTableId = response.activityTableId;

      // If we got a response, process it accordingly
      const constructed_table: any = [];
      response.tables.forEach((table: any) => {
        if (table.id === this.caseTableId) this.caseTableName = table.name;
        if (table.id === this.activityTableId) this.activityTableName = table.name;
        const table_obj: any = {
          "name": table.name,
          "shortName": table.shortName,
          "id": table.id,
          "columns": []
        };

        const activityColumnId = table.tableConfiguration?.activityColumnId || ""
        table.columns.forEach((col: any) => {
          const col_obj: any = {
            "parentName": table.name,
            "name": col.name,
            "shortName": col.shortName,
            "id": col.id,
            "isActivityColumn": (col.id === activityColumnId)
          };
          table_obj.columns.push(col_obj);
        })

        constructed_table.push(table_obj);
      })

      // GET VALID VARIANTS:
      let reduced_options: any[] = [];
      constructed_table.forEach((o: any) => {
        o.columns.forEach((c: any) => {
          if (c.isActivityColumn) {

            const index = reduced_options.findIndex(e => e.id = c.parentName);
            if (index === -1) {
              reduced_options.push(o);
              o.columns = [];
            }
            o.columns.push(c);
          }
        })
      })
      this.valid_variants = reduced_options;

      // CREATE STANDARD PROCESS DIMENSIONS MANUALLY
      const standard_process_dims_table_name = "Standard Process Dimensions";
      const standard_process_dims_table: any = {
        "name": standard_process_dims_table_name,
        "shortName": standard_process_dims_table_name,
        "id": "standard_process_dimensions",
        "columns": [
          {
            "parentName": standard_process_dims_table_name,
            "name": "Eventtime in Years",
            "shortName": "Eventtime in Years",
            "formula": "ROUND_YEAR(\"" + this.activityTableName + "\".\"time:timestamp\")"
          },
          {
            "parentName": standard_process_dims_table_name,
            "name": "Eventtime in Months",
            "shortName": "Eventtime in Months",
            "formula": "ROUND_MONTH(\"" + this.activityTableName + "\".\"time:timestamp\")"
          },
          {
            "parentName": standard_process_dims_table_name,
            "name": "Timestamp of first activity",
            "shortName": "Timestamp of first activity",
            "formula": "ROUND_DAY (PU_FIRST(\"" + this.caseTableName + "\", \"" + this.activityTableName + "\".\"time:timestamp\"))"
          },
          {
            "parentName": standard_process_dims_table_name,
            "name": "Timestamp of last activity",
            "shortName": "Timestamp of last activity",
            "formula": "ROUND_DAY (PU_LAST(\"" + this.caseTableName + "\", \"" + this.activityTableName + "\".\"time:timestamp\"))"
          },
          {
            "parentName": standard_process_dims_table_name,
            "name": "Total Throughputtime in Days",
            "shortName": "Total Throughputtime in Days",
            "formula": "CALC_THROUGHPUT(ALL_OCCURRENCE['Process Start'] TO ALL_OCCURRENCE['Process End'], REMAP_TIMESTAMPS(\"" + this.activityTableName + "\".\"time:timestamp\", DAYS))"
          },
          {
            "parentName": standard_process_dims_table_name,
            "name": "Variants",
            "shortName": "Variants",
            "formula": "KPI(\"Process variants\")"
          },
        ]
      }

      constructed_table.unshift(standard_process_dims_table)

      // Trigger Table Changes
      this.tableAndCol = constructed_table;
      this.tableAndColSub.next(constructed_table);
    })
  }


  clickedIdSub: BehaviorSubject<any> = new BehaviorSubject(-5);

  setClickedId(id: number) {
    this.clickedIdSub.next(id)
  }


  clusterSizeSub: BehaviorSubject<any> = new BehaviorSubject(-5);

  setClusterSize(size: number) {
    this.clusterSizeSub.next(size)
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
