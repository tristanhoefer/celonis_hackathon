import {Injectable} from '@angular/core';
import {ApiEndpointsService} from "./api-endpoints.service";
import {ApiHttpService} from "./ApiHttpService";
import {BehaviorSubject, forkJoin, Observable} from "rxjs";
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
  // readonly LIMIT = 1000000;
  readonly LIMIT = 50000;


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

  //save variants from pql call
  variants: any = {};

  //save distinct activity values
  activityValSub: BehaviorSubject<any> = new BehaviorSubject([]);
  getVariantSub: BehaviorSubject<any> = new BehaviorSubject([]);


  clusterEstimateSub: BehaviorSubject<any> = new BehaviorSubject([]);


  constructor(private apiEndpoint: ApiEndpointsService, private apiHttpService: ApiHttpService) {
    window.addEventListener('resize', () => {
      this.resizeSvg('petriNet');
      this.resizeSvg('processTree');
    }, true);
  }


  // API URL ENDPOINTS
  public getDataModelFromAPI = (): string => this.apiEndpoint.createUrl('analysis/' + this.dataset_key + '/data_model', false);
  public data_service_batch = (): string => this.apiEndpoint.createUrl('analysis/' + this.dataset_key + '/data_service_batch', false);


  testMiner(selectedVar: any, id?: any) {
    if (!selectedVar.isActivityColumn) return;
    const query_filter = (!id || isNaN(id)) ? "" : "FILTER " + this.getClusterQuery() + " = " + id + "; ";
    const body = this.apiEndpoint.createInductiveMiner(selectedVar.parentName, selectedVar.name, query_filter);

    const get_count_query = "variants_count as TABLE(VARIANT(\"" + selectedVar.parentName + "\".\"" + selectedVar.name + "\"),COUNT_TABLE(CASE_TABLE(\"" + selectedVar.parentName + "\".\"" + selectedVar.name + "\"))) ORDER BY COUNT_TABLE(CASE_TABLE(\"" + selectedVar.parentName + "\".\"" + selectedVar.name + "\")) DESC; GRAPH(REF_RESULT(variants_count, 0), REF_RESULT(variants_count, 1), \"" + selectedVar.parentName + "\".\"" + selectedVar.name + "\"); "
    const secondBody = this.apiEndpoint.createPQLQueryBodyWithoutTable(get_count_query);


    forkJoin([this.apiHttpService.post(this.data_service_batch(), body), this.apiHttpService.post(this.data_service_batch(), secondBody)]).subscribe((data: any) => {
      // Create Threshold Map to check whether we meet the specified number of activities
      let count_map: Map<string, number> = new Map();
      let threshold_map: Map<string, boolean> = new Map();
      let activitiy_count_threshold = 30000;
      data[1].results[0].result.components[0].results[0].data.forEach((d: any) => {
        const count = d[4];
        count_map.set(d[0], count);
        threshold_map.set(d[0], count > this.number_of_activities_range[0] && count < this.number_of_activities_range[1]);
      });


    // this.apiHttpService.post(this.data_service_batch(), body).subscribe((data: any) => {
      const vertex_properties = data[0].results[0].result.components[0].results[0];
      const edge_properties = data[0].results[0].result.components[0].results[1];

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

      let empty_parent_redirect: Map<any, any> = new Map();

      edge_data.forEach((value: any, index: number) => {
        const parent = tmp_map.get(value[0]);
        let test = tmp_map.get(value[1]);
        // Return if the Activity Threshold is not met!
        if(test.label && !threshold_map.get(test.label)) return;
        if(!this.showTau && test.operator === "tau") return; // Hide if we said to do so
        if(!test.label && !test.operator) {
          if(empty_parent_redirect.has(parent.id)) {
            empty_parent_redirect.set(test.id, empty_parent_redirect.get(parent.id));
          } else {
            empty_parent_redirect.set(test.id, value[0]);
          }
          return;
        }
        if(empty_parent_redirect.has(parent.id)) {
          test.parentNode = tmp_map.get(empty_parent_redirect.get(parent.id));
          tmp_map.get(empty_parent_redirect.get(parent.id)).children.push(test);
        } else {
          test.parentNode = tmp_map.get(value[0]);
          tmp_map.get(value[0]).children.push(test);
        }
      });

      const final_tree = tmp_map.get(0);
      let processTree = ProcessTreeVanillaVisualizer.apply(final_tree);
      d3.select("#processTree").graphviz().renderDot(processTree, () => {
        this.resizeSvg('processTree');
      });

      let acceptingPetriNet = ProcessTreeToPetriNetConverter.apply(final_tree);
      let petriNet = PetriNetVanillaVisualizer.apply(acceptingPetriNet)
      d3.select('#petriNet').graphviz().renderDot(petriNet, () => {
        this.resizeSvg('petriNet');
      });
    })
  }

  resizeSvg(id: string) {
    const svg = document.getElementById(id)?.getElementsByTagName("svg");
    if (svg) {
      const svg_array = Array.from(svg);
      const ref_elem = document.getElementById("ref_size");
      if (svg_array.length && ref_elem) {
        const svg_elem = svg_array[0];
        const w = (ref_elem?.getBoundingClientRect().width || 1000) - 22 - 26;  //  -  Margins & Paddings
        const h = ref_elem?.getBoundingClientRect().height || 600;
        svg_elem.setAttribute("width", String(w));
        svg_elem.setAttribute("height", String(h));
      }
    }
  }


  number_of_activities_range: number[] = [0, 10000000];
  showTau: boolean = false;

  updateMiner() {
    this.testMiner(this.selectedVariant, (this.clickedId > -3) ? this.clickedId : null);
  }

  tableClusters: string = ""
  columnClusterName: string = ""
  minPts: number = 0
  epsilon: number = 0

  /**
   * Get the Clustering for
   * @param tableName TableName to Query
   * @param columnName ColumnName to Query
   * @param formula
   * @param minPts
   * @param epsilon
   */
  getClusters(tableName: string, columnName: string, minPts: number, epsilon: number = 2) {
    this.tableClusters = tableName;
    this.columnClusterName = columnName;
    this.minPts = minPts;
    this.epsilon = epsilon;
    const body = this.apiEndpoint.createPQLQueryBody(this.getClusterQuery(), this.LIMIT);

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

  getClusterQuery() {
    return "CLUSTER_VARIANTS ( VARIANT(\"" + this.tableClusters + "\".\"" + this.columnClusterName + "\"), " + this.minPts + ", " + this.epsilon + ") \nAS \"Cluster\"\n";
  }

  getVariant(variantName: string) {
    const query = "MATCH_ACTIVITIES(\"" + this.tableClusters + "\".\"" + this.columnClusterName + "\", NODE [\'" + variantName + "\'] ), " + this.getClusterQuery();
    const body = this.apiEndpoint.createPQLQueryBody(query, this.LIMIT);
    this.apiHttpService.post(this.data_service_batch(), body).subscribe((data: any) => {
      if (!data?.results?.length || !data.results[0]?.result?.components[0]?.results?.length) return;
      const a = data.results[0].result.components[0].results[0].data;
      // const content = this.convert_2d_to_1d_array(a.data);
      this.getVariantSub.next(a);
    })
  }

  getDistinctActivities(tableName: string, columnName: string) {
    const query = "DISTINCT \"" + tableName + "\".\"" + columnName + "\", " + this.getClusterQuery();
    const body = this.apiEndpoint.createPQLQueryBody(query, this.LIMIT);
    this.apiHttpService.post(this.data_service_batch(), body).subscribe((data: any) => {
      if (!data?.results?.length || !data.results[0]?.result?.components[0]?.results?.length) return;
      const a = data.results[0].result.components[0].results[0].data;
      // const content = this.convert_2d_to_1d_array(a.data);
      this.activityValSub.next(a);
    })
  }

  clusterInformalData: any[] = [];
  clusterInformalDataSub: BehaviorSubject<any> = new BehaviorSubject([]);

  totalNumberOfVariantsSub: BehaviorSubject<any> = new BehaviorSubject(-5);

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
  clickedId: number = -5;
  selectedVariant: any = {};


  setClickedId(id: number) {
    this.clickedIdSub.next(id)
    this.clickedId = id;

    // Update Miner...
    this.testMiner(this.selectedVariant, id);
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
