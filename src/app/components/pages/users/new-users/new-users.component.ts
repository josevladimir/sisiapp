import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { State } from 'src/app/reducers';
import * as fromLoadingActions from '../../../../reducers/actions/loading.actions';
import { UsersServiceService } from '../../../../services/users-service.service';
import { MyValidators } from '../../../../models/Validators';
import { FundersServiceService } from '../../../../services/funders-service.service';

@Component({
  selector: 'app-new-users',
  templateUrl: './new-users.component.html'
})
export class NewUsersComponent {

  UserForm : FormGroup;
  Repassword : string = '';
  
  Funders : any[];

  constructor(private _usersService : UsersServiceService,
              private _fundersService : FundersServiceService,
              private _snackBar : MatSnackBar,
              private _store : Store<State>) { 
    this.UserForm = new FormGroup({
      username: new FormControl('',[Validators.required,MyValidators.isBlank/*,MyValidators.existUser*/]),
      name: new FormControl('',[Validators.required,MyValidators.isBlank]),
      last_names: new FormControl('',[Validators.required,MyValidators.isBlank]),
      email: new FormControl('',[Validators.required,MyValidators.isBlank,Validators.pattern(new RegExp(/^[_a-z0-9-]+(.[_a-z0-9-]+)*@[a-z0-9-]+(.[a-z0-9-]+)*(.[a-z]{2,4})$/))]),
      position: new FormControl('',[Validators.required,MyValidators.isBlank]),
      password: new FormControl('',[Validators.required,MyValidators.isBlank,Validators.minLength(10)]),
      funder: new FormControl(''),
      repassword: new FormControl(''),
      role:new FormControl('',[Validators.required]) 
    });
    this.UserForm.get('repassword').setValidators([Validators.required,MyValidators.isBlank,this.ComparePass(this.UserForm.get('password'))]);
    this._fundersService.getFundersOff().subscribe(funders => this.Funders = funders);
  }

  ComparePass(otherControl: AbstractControl): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} => {
      const value: any = control.value;
      const otherValue: any = otherControl.value;
      return otherValue === value ? null : { 'notMatch': { value, otherValue } };
    };
  }

  createUser(){
    this._store.dispatch(fromLoadingActions.initLoading({message: 'Guardando Usuario...'}));
    let body = this.UserForm.value;
    delete body.repassword;
    if(body.role == 'Financiador' && !body.funder) return alert('Es necesario que indique a que financiador representa este usuario.');
    else if(body.role != 'Financiador') delete body.funder;
    this._usersService.createUser(body);
  }

}
