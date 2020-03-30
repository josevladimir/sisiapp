import { Component } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { SisiCoreService } from '../../../../services/sisi-core.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { State } from '../../../../reducers/index';
import * as fromLoadingActions from '../../../../reducers/actions/loading.actions';
import { Observable } from 'rxjs';
import { FundersServiceService, Funder } from '../../../../services/funders-service.service';

@Component({
  selector: 'app-funders',
  templateUrl: './funders.component.html'
})
export class FundersComponent{
  
  funders : Observable<Funder[]>;
  
  userID : string = localStorage.getItem('userID');
  userRole : string = localStorage.getItem('userRole');
  
  fundersForm : FormGroup;
  nameCtrl : FormControl = new FormControl('',[Validators.required,this._service.existFunder]);
  ubicationCtrl : FormControl = new FormControl('',Validators.required);
  websiteCtrl : FormControl = new FormControl('');
  coop_dateCtrl : FormControl = new FormControl('',[Validators.required,Validators.pattern(new RegExp(/^\d{1,2}\/\d{4}$/))]);
  
  constructor(private _service : SisiCoreService,
    private _fundersService : FundersServiceService,
    private _snackBar : MatSnackBar,
    private _store : Store<State>) { 
      
      //this.funders = this._fundersService.getFundersLocal();

      //this._fundersService.getFundersLocal().subscribe((funders : any) => {this.funders = funders.funders; console.log(funders);});
      
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
    this._store.dispatch(fromLoadingActions.initLoading({message: 'Guardando el nuevo Financiador...'}));
    let body = this.fundersForm.value;
    this._service.createFunder(body).subscribe(
      result => {
        //this.funders.push(result.funder);
        this._service.updateFundersList(null);
        this.fundersForm.reset();
        this._store.dispatch(fromLoadingActions.stopLoading());
        this._snackBar.open('Se ha registrado el financiador correctamente.','ENTENDIDO',{duration: 3000});
      },error => {
        this._store.dispatch(fromLoadingActions.stopLoading());
        this._snackBar.open('Ha ocurrido un error al registrar el financiador.','ENTENDIDO',{duration: 3000})
      }
    );
  }

}
