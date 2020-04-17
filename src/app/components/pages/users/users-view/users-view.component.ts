import { Component } from '@angular/core';
import { SisiCoreService } from '../../../../services/sisi-core.service';
import { ActivatedRoute, Params } from '@angular/router';
import { FormGroup, FormControl, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NewPasswordComponent } from '../../../dialogs/new-password/new-password.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { State } from '../../../../reducers/index';
import * as fromLoadingActions from '../../../../reducers/actions/loading.actions';
import { Observable } from 'rxjs';
import { isEditMode } from '../../../../reducers/selectors/general.selector';
import { editModeSetDisabled } from '../../../../reducers/actions/general.actions';
import { UsersServiceService } from '../../../../services/users-service.service';
import { FundersServiceService } from '../../../../services/funders-service.service';
import { MyValidators } from '../../../../models/Validators';

@Component({
  selector: 'app-users-view',
  templateUrl: './users-view.component.html'
})
export class UsersViewComponent {

  User : any;

  UserForm : FormGroup;

  isEditMode : Observable<boolean>;

  Funders : any[];

  constructor(private _userService : UsersServiceService,
              private _fundersService : FundersServiceService,
              private _ActivatedRoute : ActivatedRoute,
              private _snackBar : MatSnackBar,
              private dialog : MatDialog,
              private _store: Store<State>) {

    this.isEditMode = this._store.select(isEditMode);

    this._fundersService.getFundersOff().subscribe(funders => this.Funders = funders);

    this._ActivatedRoute.params.subscribe(
      (params : Params) => {
        this.User = this._userService.getUser().subscribe(users => {
          this.User =  users.filter(user => user._id == params.id)[0];
          this.getFormFromUser();
        });
      }
    );
    
    
  }

  updateUser(){
    this._store.dispatch(fromLoadingActions.initLoading({message: 'Actualizando usuario...'}));
    let body = this.UserForm.value;
    if(body.role == 'Financiador' && !body.funder) return alert('Es necesario que indique a que financiador representa este usuario.');
    else if(body.role != 'Financiador') delete body.funder;
    this._userService.updateOnlyUser(body,this.User._id).subscribe(
      result => {
        if(result.message == 'UPDATED'){
          this.User = result.user;
          this.getFormFromUser();
          this._store.dispatch(editModeSetDisabled());
          this._store.dispatch(fromLoadingActions.stopLoading());
          this._snackBar.open('Usuario actualizado correctamente.','ENTENDIDO',{duration: 3000});
          //this._service.updateUsersList(null);
        }
      },error => {
        this._store.dispatch(fromLoadingActions.stopLoading());
        this._snackBar.open('Ha ocurrido un error al guardar el usuario.','ENTENDIDO',{duration: 3000});
      }
    )
  }

  cancel(){
    if(confirm('Los cambios que no se han guardados se perderán.\n\n¿Desea continua?')) {
      this._store.dispatch(editModeSetDisabled());
      this.getFormFromUser();
    }
  }

  getFormFromUser(){
    let funder : string = '';
    if(this.User.funder) funder = this.User.funder._id;
    this.UserForm = new FormGroup({
      username: new FormControl(this.User.username,[Validators.required,MyValidators.isBlank]),
      name: new FormControl(this.User.name,[Validators.required,MyValidators.isBlank]),
      last_names: new FormControl(this.User.last_names,[Validators.required,MyValidators.isBlank]),
      email: new FormControl(this.User.email,[Validators.required,MyValidators.isBlank,Validators.pattern(new RegExp(/^[_a-z0-9-]+(.[_a-z0-9-]+)*@[a-z0-9-]+(.[a-z0-9-]+)*(.[a-z]{2,4})$/))]),
      position: new FormControl(this.User.position,[Validators.required,MyValidators.isBlank]),
      role:new FormControl(this.User.role,[Validators.required]),
      funder: new FormControl(funder)
    });
  }

  generateNewPassword(){
    const dialogRef = this.dialog.open(NewPasswordComponent, {
      width: '550px',
      data: {password: ''}
    });

    dialogRef.afterClosed().subscribe(passwords => {
      if(passwords){
        /**Actualizar Contraseña */
        this._store.dispatch(fromLoadingActions.initLoading({message: 'Guardando los cambios...'}));
        this._userService.updateUser({password: passwords.password},this.User._id);
      }
    });
  }

}
