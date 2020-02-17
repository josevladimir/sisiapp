import { Component, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators, } from '@angular/forms';
import { SisiCoreService } from '../../../services/sisi-core.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent{

  @Output() authentication : EventEmitter<void> = new EventEmitter();
  @Output() isWorking : EventEmitter<any> = new EventEmitter();

  LoginForm : FormGroup;

  constructor(private _service : SisiCoreService,
              private _snackBar : MatSnackBar) { 
    this.LoginForm = new FormGroup({
      'username': new FormControl('',Validators.required),
      'password': new FormControl('',[Validators.required,Validators.minLength(8)])
    });
  }

  login(){
    this.isWorking.emit({isWorking: true, message: 'Ingresando'});
    let body = this.LoginForm.value;
    body.last_login_date = new Date();

    this._service.authenticate(body).subscribe(
      result => {
        this._snackBar.open(result.message,'ENTENDIDO',{duration: 3000});
        if(result.message == 'Ingreso exitoso.'){
          localStorage.setItem('user',JSON.stringify(result.user));
          localStorage.setItem('token',result.token);
          this.authentication.emit();
        }
        this.isWorking.emit({isWorking: false});
      },
      error => {
        this.isWorking.emit({isWorking: false});
        this._snackBar.open('Ha ocurrido un error, intente nuevamente.','ENTENDIDO',{duration: 3000})
      }
    );
    

  }

}
