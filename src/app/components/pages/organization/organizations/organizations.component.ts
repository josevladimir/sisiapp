import { Component } from '@angular/core';
import { OrganizationsServiceService } from '../../../../services/organizations-service.service';

@Component({
  selector: 'app-organizations',
  templateUrl: './organizations.component.html'
})
export class OrganizationsComponent {

  Organizations : any[] = [];

  userRole : string = localStorage.getItem('userRole');

  List : any[] = [];

  constructor(private organizationsService : OrganizationsServiceService) {
    this.organizationsService.getOrganizationsLocal().subscribe(data => {
      this.Organizations = data.organizations;
      this.List = data.organizations;
    });
  }

  updateList(list){
    this.List = list;
  }

}
