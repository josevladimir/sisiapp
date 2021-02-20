import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RelojSISIComponent } from './reloj-sisi.component';

describe('RelojSISIComponent', () => {
  let component: RelojSISIComponent;
  let fixture: ComponentFixture<RelojSISIComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RelojSISIComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RelojSISIComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
