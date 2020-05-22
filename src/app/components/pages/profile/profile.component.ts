import { Component } from '@angular/core';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { Store } from '@ngrx/store';
import { State } from 'src/app/reducers';
import { Observable } from 'rxjs';
import { isEditMode } from '../../../reducers/selectors/general.selector';
import { getUserData } from '../../../reducers/selectors/session.selector';
import { MyValidators } from '../../../models/Validators';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html'
})
export class ProfileComponent {

  isEdit : Observable<boolean> = this.store.select(isEditMode);
  user$ : Observable<any> = this.store.select(getUserData);
  user : any = this.user$.subscribe(user => this.user = user);

  profileForm : FormGroup = new FormGroup({
    name: new FormControl(this.user.name,[Validators.required,MyValidators.isBlank]),
    last_names: new FormControl(this.user.last_names,[Validators.required,MyValidators.isBlank]),
    username: new FormControl(this.user.username,[Validators.required,MyValidators.isBlank]),
    role: new FormControl(this.user.role,[Validators.required,MyValidators.isBlank]),
    position: new FormControl(this.user.position,[Validators.required,MyValidators.isBlank]),
    email: new FormControl(this.user.email,[Validators.required,MyValidators.isBlank])

  });

  constructor(private store : Store<State>) {}

}
