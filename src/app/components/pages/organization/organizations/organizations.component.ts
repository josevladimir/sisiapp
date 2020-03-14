import { Component } from '@angular/core';
import { SisiCoreService } from '../../../../services/sisi-core.service';

@Component({
  selector: 'app-organizations',
  templateUrl: './organizations.component.html'
})
export class OrganizationsComponent {

  Organizations : any[] = this._service.getOrganizationsOff();

  userRole : string = localStorage.getItem('userRole');

  constructor(private _service : SisiCoreService) {
    
  }

}
