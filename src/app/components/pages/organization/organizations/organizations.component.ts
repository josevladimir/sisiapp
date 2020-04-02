import { Component } from '@angular/core';
import { OrganizationsServiceService } from '../../../../services/organizations-service.service';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { State } from '../../../../reducers/index';
import { isFunder } from 'src/app/reducers/selectors/session.selector';

@Component({
  selector: 'app-organizations',
  templateUrl: './organizations.component.html'
})
export class OrganizationsComponent {

  isFunder : Observable<boolean>;

  Organizations : any[] = [];

  List : any[] = [];

  constructor(private organizationsService : OrganizationsServiceService,
              private store : Store<State>) {
    this.isFunder = this.store.select(isFunder);
    this.organizationsService.getOrganizationsLocal().subscribe(organizations => {
      this.Organizations = organizations;
      this.List = organizations;
    });
  }

  updateList(list){
    this.List = list;
  }

}
