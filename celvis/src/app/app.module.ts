import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MainComponent } from './main/main.component';
import {CascadeSelectModule} from "primeng/cascadeselect";
import {FormsModule} from "@angular/forms";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import { PlotlyTestComponent } from './plotly-test/plotly-test.component';
import {HttpClientModule} from "@angular/common/http";
import { ApiTestComponent } from './api-test/api-test.component';
import {ApiHttpService} from "./api/ApiHttpService";
import {ApiEndpointsService} from "./api/api-endpoints.service";
import {Constants} from "./api/constants";
import {ListboxModule} from "primeng/listbox";
import {DataService} from "./api/data-service";
import { SettingsComponent } from './settings/settings.component';
import {SliderModule} from "primeng/slider";

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    PlotlyTestComponent,
    ApiTestComponent,
    SettingsComponent
  ],
    imports: [
        BrowserModule,
        HttpClientModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        ListboxModule,
        CascadeSelectModule,
        FormsModule,
        SliderModule
    ],
  providers: [ApiHttpService, ApiEndpointsService, Constants, DataService],
  bootstrap: [AppComponent]
})
export class AppModule { }
