import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { State } from 'src/app/reducers';
import * as fromLoadingActions from '../../../reducers/actions/loading.actions';
import { AuthServiceService } from '../../../services/auth-service.service';
import { AuthObject } from 'src/app/reducers/actions/session.actions';
import * as fromSessionActions from '../../../reducers/actions/session.actions';
import { Router } from '@angular/router';
import { SessionService } from 'src/app/services/session.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent{

  LoginForm : FormGroup;

  assetsUrl : string = environment.assetsUrl;

  constructor(private service : AuthServiceService,
              private sessionService : SessionService,
              private _snackBar : MatSnackBar,
              private _store : Store<State>,
              private _Router : Router) { 
    this.LoginForm = new FormGroup({
      'username': new FormControl('',Validators.required),
      'password': new FormControl('',[Validators.required,Validators.minLength(8)])
    });
  }

  login(){
    this._store.dispatch(fromLoadingActions.initLoading({message: 'Ingresando...'}));

    let authObject : AuthObject = this.LoginForm.value;
    
    this.service.Login(authObject).subscribe(
      result => {
        if(result.message == 'Ingreso exitoso.'){
          let user : fromSessionActions.User = {
            token: result.token,
            username: result.user.username,
            name: result.user.name,
            last_names: result.user.last_names,
            email: result.user.email,
            role: result.user.role,
            position: result.user.position,
            _id: result.user._id,
            funder: result.user.funder ? result.user.funder : null,
            organizations: result.user.organizations ? result.user.organizations.organizations : null
          }
          this._store.dispatch(fromSessionActions.authenticate({user}));
        }
        this._store.dispatch(fromLoadingActions.stopLoading());
        this.sessionService.saveSession();
        this._snackBar.open(result.message,'ENTENDIDO',{duration: 3000});
        this._Router.navigateByUrl('/main/dashboard');
      },
      error => {
        this._store.dispatch(fromLoadingActions.stopLoading());
        this._snackBar.open('Ha ocurrido un error, intente nuevamente.','ENTENDIDO',{duration: 3000})
      }
    );
    

  }

}
