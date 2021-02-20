import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LineSISIComponent } from './line-sisi.component';

describe('LineSISIComponent', () => {
  let component: LineSISIComponent;
  let fixture: ComponentFixture<LineSISIComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LineSISIComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LineSISIComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
