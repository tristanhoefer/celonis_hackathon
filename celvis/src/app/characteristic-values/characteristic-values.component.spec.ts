import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CharacteristicValuesComponent } from './characteristic-values.component';

describe('CharacteristicValuesComponent', () => {
  let component: CharacteristicValuesComponent;
  let fixture: ComponentFixture<CharacteristicValuesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CharacteristicValuesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CharacteristicValuesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
