import { Component } from '@angular/core';
import { SisiCoreService } from '../../../../services/sisi-core.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html'
})
export class UsersComponent {

  filter : string = "name";
  search_term : string = '';

  Users : any[];
  filteredList : any[];

  constructor(private _service : SisiCoreService) {
    this.Users = this._service.getUsersOff();
    this.filteredList = this.Users;
  }

  filterByTerm(){
    if(!this.search_term.trim()) return this.filteredList = this.Users;
    this.filteredList = this.Users.filter(user => user[this.filter].toLowerCase().includes(this.search_term.trim().toLowerCase()))
  }

  filterByRole(role){
    if(!role) return this.filteredList = this.Users;
    this.filteredList = this.Users.filter(user => user[this.filter] == role);
  }

}
