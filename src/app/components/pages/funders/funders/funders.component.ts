import { Component, OnDestroy } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { SisiCoreService } from '../../../../services/sisi-core.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { State } from '../../../../reducers/index';
import * as fromLoadingActions from '../../../../reducers/actions/loading.actions';
import { Observable, Subscription } from 'rxjs';
import { FundersServiceService, Funder } from '../../../../services/funders-service.service';
import { SocketioService } from '../../../../services/socketio.service';
import { isAdmin } from '../../../../reducers/selectors/session.selector';

@Component({
  selector: 'app-funders',
  templateUrl: './funders.component.html'
})
export class FundersComponent implements OnDestroy{
  
  funders : Funder[] = [];

  subscription : Subscription;
  
  isAdmin : Observable<boolean>;
  
  fundersForm : FormGroup;
  
  constructor(private _service : SisiCoreService,
              private _fundersService : FundersServiceService,
              private _socketsService : SocketioService,
              private _snackBar : MatSnackBar,
              private _store : Store<State>) { 
      
      this.subscription = this._fundersService.getFundersLocal().subscribe((funders : Funder[]) => {console.log('Actualizacion',funders);this.funders = funders});

      this.isAdmin = this._store.select(isAdmin);

      this.fundersForm = new FormGroup({
      name: new FormControl('',[Validators.required,this._service.existFunder]),
      place: new FormControl('',Validators.required),
      website: new FormControl(''),
      coop_date: new FormControl('',[Validators.required,Validators.pattern(new RegExp(/^\d{1,2}\/\d{4}$/))])
    });
  }

  reset(){
    this.fundersForm.reset();
  }

  saveFunder(){
    this._store.dispatch(fromLoadingActions.initLoading({message: 'Guardando el nuevo Financiador...'}));
    let body = this.fundersForm.value;
    this._fundersService.createFunder(body);
    /*this._service.createFunder(body).subscribe(
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
    );*/
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.subscription.unsubscribe();
  }

}
