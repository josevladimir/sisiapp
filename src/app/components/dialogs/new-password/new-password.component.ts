import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormGroup, FormControl, Validators, AbstractControl, ValidatorFn } from '@angular/forms';

@Component({
  selector: 'app-new-password',
  templateUrl: './new-password.component.html'
})
export class NewPasswordComponent {

  repassword : string = '';

  PasswordForm : FormGroup;

  constructor(public dialogRef: MatDialogRef<NewPasswordComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {

    this.PasswordForm = new FormGroup({
      password: new FormControl('',[Validators.required,Validators.minLength(10)]),
      repassword: new FormControl('')
    });

    this.PasswordForm.get('repassword').setValidators([Validators.required,this.ComparePass(this.PasswordForm.get('password'))]);
  
  }

  ComparePass(otherControl: AbstractControl): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} => {
      const value: any = control.value;
      const otherValue: any = otherControl.value;
      return otherValue === value ? null : { 'notMatch': { value, otherValue } };
    };
  }

  onNoClick(msg : string) : void {
    this.dialogRef.close(msg);
  }
}
