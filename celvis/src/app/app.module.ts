import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {MainComponent} from './main/main.component';
import {CascadeSelectModule} from "primeng/cascadeselect";
import {FormsModule} from "@angular/forms";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {PlotlyChartComponent} from './plotly-chart/plotly-chart.component';
import {HttpClientModule} from "@angular/common/http";
import {ApiHttpService} from "./api/ApiHttpService";
import {ApiEndpointsService} from "./api/api-endpoints.service";
import {Constants} from "./api/constants";
import {ListboxModule} from "primeng/listbox";
import {DataService} from "./api/data-service";
import {SettingsComponent} from './settings/settings.component';
import {SliderModule} from "primeng/slider";
import {HeaderComponent} from './header/header.component';
import {InputTextModule} from "primeng/inputtext";
import { CardComponent } from './card/card.component';

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    PlotlyChartComponent,
    SettingsComponent,
    HeaderComponent,
    CardComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    ListboxModule,
    CascadeSelectModule,
    FormsModule,
    SliderModule,
    InputTextModule
  ],
  providers: [ApiHttpService, ApiEndpointsService, Constants, DataService],
  bootstrap: [AppComponent]
})
export class AppModule {
}
