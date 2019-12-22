import { Component, Input } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { SisiCoreService } from '../../../../services/sisi-core.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-funders',
  templateUrl: './funders.component.html'
})
export class FundersComponent{

  funders : any[] = this._service.getFundersOff();

  userID : string = localStorage.getItem('userID');

  fundersForm : FormGroup;
  nameCtrl : FormControl = new FormControl('',[Validators.required,this._service.existFunder]);
  ubicationCtrl : FormControl = new FormControl('',Validators.required);
  websiteCtrl : FormControl = new FormControl('');
  coop_dateCtrl : FormControl = new FormControl('',[Validators.required,Validators.pattern(new RegExp(/^\d{1,2}\/\d{4}$/))]);

  constructor(private _service : SisiCoreService,
              private _snackBar : MatSnackBar) { 
    this.fundersForm = new FormGroup({
      name: this.nameCtrl,
      place: this.ubicationCtrl,
      website: this.websiteCtrl,
      coop_date: this.coop_dateCtrl
    });
  }

  reset(){
    this.fundersForm.reset();
  }

  saveFunder(){
    let body = this.fundersForm.value;
    body.created_by = this.userID;
    this._service.createFunder(body).subscribe(
      result => {
        this.funders.push(result.funder);
        localStorage.setItem('funders',JSON.stringify(this.funders));
        this.fundersForm.reset({
          name: ''
        });
        this._snackBar.open('Se ha registrado el financiador correctamente.','ENTENDIDO',{duration: 3000});
      },error => this._snackBar.open('Ha ocurrido un error al registrar el financiador.','ENTENDIDO',{duration: 3000})
    );
  }

}
