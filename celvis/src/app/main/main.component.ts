import {Component, OnInit} from '@angular/core';
import {DataService} from "../api/data-service";

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  constructor(private dataService: DataService) {
  }

  collapsed: boolean = true;

  update() {
    this.collapsed = !this.collapsed;
  }

  ngOnInit(): void {
    this.dataService.clickedIdSub.subscribe((id: number) => {
      if(id > -3) this.collapsed = false;
    })
  }
}
