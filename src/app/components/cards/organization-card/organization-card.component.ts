import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-organization-card',
  templateUrl: './organization-card.component.html'
})
export class OrganizationCardComponent implements OnInit {

  @Input() organization;

  constructor() { }

  ngOnInit(): void {
  }

}
