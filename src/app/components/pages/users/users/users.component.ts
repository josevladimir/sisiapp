import { Component, OnDestroy } from '@angular/core';
import { UsersServiceService } from '../../../../services/users-service.service';
import { Subscription } from 'rxjs';
import * as fromLoadingActions from '../../../../reducers/actions/loading.actions';
import { Store } from '@ngrx/store';
import { State } from '../../../../reducers/index';

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

  deleteUser(id : string){
    if(confirm('¿Está seguro que desea eliminar este Usuario?\n\nEsta acción no se puede deshacer.')){
      this.store.dispatch(fromLoadingActions.initLoading({message: 'Eliminando el Usuario...'}));
      this.userService.deleteUser(id,false);
    }
  }

  constructor(private userService : UsersServiceService,
              private store : Store<State>) {
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
