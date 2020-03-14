import { Component } from '@angular/core';
import { SisiCoreService } from '../../../../services/sisi-core.service';
import { ActivatedRoute, Params } from '@angular/router';
import { FormGroup, FormControl, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NewPasswordComponent } from '../../../dialogs/new-password/new-password.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-users-view',
  templateUrl: './users-view.component.html'
})
export class UsersViewComponent {

  User : any;

  UserForm : FormGroup;

  EditMode : boolean = false;

  Funders : any[] = this._service.getFundersOff();

  isWorking: boolean = false;

  loadingMessage : string;

  constructor(private _service : SisiCoreService,
              private _ActivatedRoute : ActivatedRoute,
              private _snackBar : MatSnackBar,
              private dialog : MatDialog) {

    this._ActivatedRoute.params.subscribe(
      (params : Params) => {
        this.User = this._service.getUser(params.id);
        this.getFormFromUser();
      }
    );
    
    
  }

  updateUser(){
    this.loadingMessage = 'Actualizando usuario...';
    this.isWorking = true;
    let body = this.UserForm.value;
    if(body.role == 'Financiador' && !body.funder) return alert('Es necesario que indique a que financiador representa este usuario.');
    else if(body.role != 'Financiador') delete body.funder;
    this._service.updateUser(body,this.User._id).subscribe(
      result => {
        if(result.message == 'UPDATED'){
          this.User = result.user;
          this.getFormFromUser();
          this.EditMode = false;
          this.UserForm.disable();
          this.isWorking = false;
          this._snackBar.open('Usuario actualizado correctamente.','ENTENDIDO',{duration: 3000});
          this._service.updateUsersList(null);
        }
      },error => {
        this.isWorking = false;
        this._snackBar.open('Ha ocurrido un error al guardar el usuario.','ENTENDIDO',{duration: 3000});
      }
    )
  }

  cancel(){
    if(confirm('Los cambios que no se han guardados se perderán.\n\n¿Desea continua?')) {
      this.EditMode = false;
      this.getFormFromUser();
      this.UserForm.disable();
    }
  }

  getFormFromUser(){
    let funder : string = '';
    if(this.User.role == 'Financiador') funder = this.User.funder._id;
    this.UserForm = new FormGroup({
      username: new FormControl({value: this.User.username, disabled: true},[Validators.required,this._service.isBlank]),
      name: new FormControl({value: this.User.name, disabled: true},[Validators.required,this._service.isBlank]),
      last_names: new FormControl({value: this.User.last_names, disabled: true},[Validators.required,this._service.isBlank]),
      email: new FormControl({value: this.User.email, disabled: true},[Validators.required,this._service.isBlank,Validators.pattern(new RegExp(/^[_a-z0-9-]+(.[_a-z0-9-]+)*@[a-z0-9-]+(.[a-z0-9-]+)*(.[a-z]{2,4})$/))]),
      position: new FormControl({value: this.User.position, disabled: true},[Validators.required,this._service.isBlank]),
      role:new FormControl({value: this.User.role, disabled: true},[Validators.required]),
      funder: new FormControl({value: funder, disabled: true}),
    });
  }

  turnToEditMode(){
    this.EditMode = true;
    this.UserForm.enable();
  }

  generateNewPassword(){
    const dialogRef = this.dialog.open(NewPasswordComponent, {
      width: '550px',
      data: {password: ''}
    });

    dialogRef.afterClosed().subscribe(passwords => {
      if(passwords){
        /**Actualizar Contraseña */
        this.loadingMessage = 'Guardando los cambios...';
        this.isWorking = true;
        this._service.updateUser({password: passwords.password},this.User._id).subscribe(
          result => {
            this.isWorking = false;
            this._snackBar.open('Se generó la contraseña correctamente.','ENTENDIDO',{duration: 3000});
          },error => {
            this.isWorking = false;
            this._snackBar.open('Ocurrió un error al generar la contraseña.','ENTENDIDO',{duration: 3000});
          }
        )
      }
    });
  }

}
