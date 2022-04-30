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
  // readonly KEY: string  = "99f38193-e510-4635-9f0a-c0b98b13b451"

  dataset_key: string = "";

  // Data object with current data queried from the API
  data: any = {};
  // BehaviourSubject watching the data (so we can subscribe to it and can react to changes properly)
  dataSub: BehaviorSubject<any> = new BehaviorSubject({});

  // Current URL (TODO: Maybe add some sort of object here later on so manage the states, depending on the API complexity)
  current_url: string = "";


  // Data object with current data queried from the API
  table: any = {};
  // BehaviourSubject watching the data (so we can subscribe to it and can react to changes properly)
  tableSub: BehaviorSubject<any> = new BehaviorSubject([]);


  // Colum Name
  colName: any = {};

  // Name of the selected Table
  tableName: any = {};

  // Data object with current data queried from the API
  tree: any = {};
  // BehaviourSubject watching the data (so we can subscribe to it and can react to changes properly)
  treeSub: BehaviorSubject<any> = new BehaviorSubject([]);


  constructor(private apiEndpoint: ApiEndpointsService, private apiHttpService: ApiHttpService) {
  }


  /**
   * Function which gets passed an URL. Afterwards it performs a http get request.
   * If the result has returned, we trigger a dataSub-Event so that other components can react to changes.
   * @param url URL to query
   * @param options Query Options
   */
  updateData(url: string, body: any, options?: any) {
    this.current_url = url;

    this.apiHttpService.post(url, body, options).subscribe((data: any) => {
      this.dataSub.next(data);
      this.data = data;
      console.log("FOUND: ", data);
    })
  }

  public getDataModelFromAPI = (): string => this.apiEndpoint.createUrl('analysis/' + this.dataset_key + '/data_model', false);

  getTables() {
    const url = this.getDataModelFromAPI()
    this.apiHttpService.get(url).subscribe((response: any) => {
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

      console.log(constructed_table);
      this.table = constructed_table;
      this.tableSub.next(constructed_table);
    })
  }

  getPackage() {
    const url =   "https://academic-henrik-falke-rwth-aachen-de.eu-2.celonis.cloud/package-manager//api/nodes/tree?spaceId=eb9a8418-c31c-4977-926e-925ec6147fca";

    this.apiHttpService.get(url).subscribe((response: any) => {
      let assets: any[] = [];
      let folders: any[] = [];
      let packages: any[] = [];
      response.forEach((r: any) => {
        switch(r.nodeType) {
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
        if(index === -1) return;
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
        if(index === -1) return;
        const correct_idx = tree_map[index].folders.findIndex((p: any) => p.key === as.parentNodeKey);
        if(correct_idx === -1) return;
        tree_map[index].folders[correct_idx].assets.push({
          "key": as.key,
          "name": as.name,
          "parentNodeKey": as.parentNodeKey,
          "id": as.id,
        });
      })


      this.tree = tree_map;
      this.treeSub.next(tree_map);
    });
  }

  convert_2d_to_1d_array(data: any, fn?: any) {
    let arr = [];
    for(let row of data) for (let e of row) arr.push((fn)? fn(e) : e);
    return arr;
  }

  getSelectedColData(tableName: string) {
    // const query = "TABLE (DISTINCT\n\"_CEL_P2P_ACTIVITIES_EN_parquet\".\"ACTIVITY_EN\"\n) ORDER BY \"_CEL_P2P_ACTIVITIES_EN_parquet\".\"ACTIVITY_EN\" ASC LIMIT 99999"
    const query =  "TABLE ( ESTIMATE_CLUSTER_PARAMS ( VARIANT(\"_CEL_P2P_ACTIVITIES_EN_parquet\".\"ACTIVITY_EN\"), 2, 20, 5 ) \nAS \"New Expression\") ORDER BY ESTIMATE_CLUSTER_PARAMS ( VARIANT(\"_CEL_P2P_ACTIVITIES_EN_parquet\".\"ACTIVITY_EN\"), 2, 20, 5 )\n DESC LIMIT 400 OFFSET 0"
    const body = this.apiEndpoint.createPQLQueryBody(query)

    console.log(this.data_service_batch());
    this.apiHttpService.post(this.data_service_batch(), body).subscribe((data: any) => {
      console.log("GOT DATA: ", data);
    })

  }


  // Data object with current data queried from the API
  clusters: any = {};
  // BehaviourSubject watching the data (so we can subscribe to it and can react to changes properly)
  clusterSub: BehaviorSubject<any> = new BehaviorSubject([]);

  getClusters(tableName: string, minPts: number, epsilon: number = 2) {
    console.log(tableName);
    const query = "CLUSTER_VARIANTS ( VARIANT(\"" + this.tableName + "\".\"" + this.colName + "\"), " + minPts + ", " + epsilon + ") \nAS \"New Expression\"\n"
    const body = this.apiEndpoint.createPQLQueryBody(query, this.LIMIT);

    this.apiHttpService.post(this.data_service_batch(), body).subscribe((data: any) => {
      this.clusters = data.results[0].result.components[0].results[0];
      this.color= this.convert_2d_to_1d_array(this.clusters.data, this.generateColorByIndex.bind(this));
      console.log("COLS: ", this.color);
      this.clusterSub.next(data.results[0].result.components[0].results[0]);
    })
  }

  getUniqueValues(data: any) {
    return ([... new Set(data)])
  }

  generateColorByIndex(idx: number) {
    const hue = Math.max(0, idx * (360 / (this.getUniqueValues(this.clusters?.data)?.length || 1)) % 360); // use golden angle approximation
    return `hsl(${hue}, 100%, 50%)`;
  }


  yAxisSelection: any = {};
  yAxisData: any[] = [];
  yAxisDataSub: BehaviorSubject<any> = new BehaviorSubject([]);

  xAxisSelection: any = {};
  xAxisData: any[] = [];
  xAxisIds: any[] = [];
  xAxisDataSub: BehaviorSubject<any> = new BehaviorSubject([]);

  color: any[] = [];

  readonly LIMIT = 1000;
  getYData() {
    const query = "\"" + this.yAxisSelection.parentName + "\".\"" + this.yAxisSelection.name + "\"";
    const body = this.apiEndpoint.createPQLQueryBody(query, this.LIMIT);

    console.log(query);
    this.apiHttpService.post(this.data_service_batch(), body).subscribe((data: any) => {
      const a = this.convert_2d_to_1d_array(data.results[0].result.components[0].results[0].data);
      this.xAxisIds = this.convert_2d_to_1d_array(data.results[0].result.components[0].results[0].ids);
      this.yAxisData = a;
      this.yAxisDataSub.next(a);
    })
  }

  getXData() {
    const query = "\"" + this.xAxisSelection.parentName + "\".\"" + this.xAxisSelection.name + "\"";
    const body = this.apiEndpoint.createPQLQueryBody(query, this.LIMIT);


    this.apiHttpService.post(this.data_service_batch(), body).subscribe((data: any) => {

      console.log(data.results[0].result.components[0].results[0]);
      const a = this.convert_2d_to_1d_array(data.results[0].result.components[0].results[0].data);
      this.xAxisData = a;
      this.xAxisDataSub.next(a);
    })
  }



  getSliderData(tableName: string) {
    // const query = "TABLE (DISTINCT\n\"_CEL_P2P_ACTIVITIES_EN_parquet\".\"ACTIVITY_EN\"\n) ORDER BY \"_CEL_P2P_ACTIVITIES_EN_parquet\".\"ACTIVITY_EN\" ASC LIMIT 99999"
    const query =  "ESTIMATE_CLUSTER_PARAMS ( VARIANT(\"tableName\".\"Action\"), 3, 20, 3 )"
    const body = this.apiEndpoint.createPQLQueryBody(query)

    console.log(this.data_service_batch());
    this.apiHttpService.post(this.data_service_batch(), body).subscribe((data: any) => {
      console.log("GOT DATA Tristan: ", data);
    })

  }



  public data_service_batch = (): string => this.apiEndpoint.createUrl('analysis/' + this.dataset_key + '/data_service_batch', false);





  /* CUSTOM (APPLICATION SPECIFIC) API CALLS GO HERE */
  /*
  * public a = (): string => XYU; is a one-line function.
  * It initializes getListboxData with the function that takes no input data and returns a string url
  */
  // Returns: https://mocki.io/v1/8701fbf3-a1eb-4735-945d-3fa2690dd184
  public getListboxData = (): string => this.apiEndpoint.createUrl('8701fbf3-a1eb-4735-945d-3fa2690dd184', true);

  /* #region EXAMPLES */
  // Returns https://mocki.io/v1/data/ID
  public getDataByIdEndpoint = (id: string): string => this.apiEndpoint.createUrlWithPathVariables('data', [id], true);

  // Returns https://mocki.io/v1/data/ID/CODE
  public getDataByIdAndCodeEndpoint = (id: string, code: number): string => this.apiEndpoint.createUrlWithPathVariables('data', [id, code], true);

  // Returns https://mocki.io/v1/data/ID/CODE?year=YEAR
  public getDataByIdCodeAndYearEndpoint(id: string, code: number, year: number): string {
    const queryString: QueryStringParameters = new QueryStringParameters();
    queryString.push('year', year);
    return `${this.apiEndpoint.createUrlWithPathVariables('data', [id, code], true)}?${queryString.toString()}`;
  }

  // Returns https://mocki.io/v1/productlist?countryCode=COUNTRYCODE
  public getProductListByCountryCodeEndpoint(countryCode: string): string {
    return this.apiEndpoint.createUrlWithQueryParameters('productlist', (qs: QueryStringParameters) => qs.push('countryCode', countryCode), true);
  }

  // Returns https://mocki.io/v1/productlist?countryCode=COUNTRYCODE&postalCode=POSTALCODE
  public getProductListByCountryAndPostalCodeEndpoint(countryCode: string, postalCode: string): string {
    return this.apiEndpoint.createUrlWithQueryParameters('productlist', (qs: QueryStringParameters) => {
      qs.push('countryCode', countryCode);
      qs.push('postalCode', postalCode);
    }, true);
  }

  /* End of the Testing */


}
