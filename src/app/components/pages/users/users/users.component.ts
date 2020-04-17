import { Component, OnDestroy } from '@angular/core';
import { UsersServiceService } from '../../../../services/users-service.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html'
})
export class UsersComponent implements OnDestroy {

  subscription : Subscription;

  filter : string = "name";
  search_term : string = '';

  Users : any[] = [];
  filteredList : any[] = [];

  constructor(private userService : UsersServiceService) {
    this.subscription = this.userService.getUsersLocal().subscribe(users => {
      this.Users = users;
      this.filteredList = users;
    });
  }

  filterByTerm(){
    if(!this.search_term.trim()) return this.filteredList = this.Users;
    this.filteredList = this.Users.filter(user => user[this.filter].toLowerCase().includes(this.search_term.trim().toLowerCase()))
  }

  filterByRole(role){
    if(!role) return this.filteredList = this.Users;
    this.filteredList = this.Users.filter(user => user[this.filter] == role);
  }

  ngOnDestroy(){
    this.subscription.unsubscribe();
  }

}
