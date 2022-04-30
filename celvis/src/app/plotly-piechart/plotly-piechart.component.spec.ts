import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlotlyPiechartComponent } from './plotly-piechart.component';

describe('PiechartComponent', () => {
  let component: PlotlyPiechartComponent;
  let fixture: ComponentFixture<PlotlyPiechartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlotlyPiechartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlotlyPiechartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
