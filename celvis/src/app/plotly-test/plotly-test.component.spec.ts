import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlotlyTestComponent } from './plotly-test.component';

describe('PlotlyTestComponent', () => {
  let component: PlotlyTestComponent;
  let fixture: ComponentFixture<PlotlyTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlotlyTestComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlotlyTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
