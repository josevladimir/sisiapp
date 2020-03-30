import { Component } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { SisiCoreService } from '../../../../services/sisi-core.service';
import { ToolbarButton } from '../../../shared/sub-toolbar/sub-toolbar.component';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { State } from 'src/app/reducers';
import * as fromLoadingActions from '../../../../reducers/actions/loading.actions';

@Component({
  selector: 'app-partners',
  templateUrl: './partners.component.html'
})
export class PartnersComponent {

  PartnerForm : FormGroup;

  Organization : any;

  ActualPartners : any;

  buttons : ToolbarButton[];

  mensCtrl : FormControl = new FormControl(null,[Validators.required]);
  womensCtrl : FormControl = new FormControl(null,[Validators.required]);

  LastPartnersForm : FormGroup;

  userRole : string = localStorage.getItem('userRole');

  editLastMode : boolean = false;

  constructor(private _ActivedRoute : ActivatedRoute,
              private _service : SisiCoreService,
              private _snackBar : MatSnackBar,
              private _Router : Router,
              private _store : Store<State>) { 
    
    this._ActivedRoute.params.subscribe(  
      (params: Params) => this.Organization = this._service.getOrganization(params.id)
    );

    this.PartnerForm = new FormGroup({
      mens: this.mensCtrl,
      womens: this.womensCtrl
    });
    if(this.Organization.historyPartners.length) {
      this.ActualPartners = {
        mens: this.Organization.historyPartners[this.Organization.historyPartners.length - 1].mens,
        womens: this.Organization.historyPartners[this.Organization.historyPartners.length - 1].womens,
        total: this.Organization.historyPartners[this.Organization.historyPartners.length - 1].mens + this.Organization.historyPartners[this.Organization.historyPartners.length - 1].womens
      }
    }else {
      this.ActualPartners = {
        mens: this.Organization.partners.mens,
        womens: this.Organization.partners.womens,
        total: this.Organization.partners.mens + this.Organization.partners.womens
      }
    }
    this.buttons = [
      {
        message: 'HISTÓRICO',
        hasIcon: true,
        icon: 'timeline',
        handler: () => {
          this._Router.navigate(['organizations',this.Organization._id,'partners','historic'])
        }
      }
    ];
  }

  editLast(){
    this.editLastMode = true;
    this.LastPartnersForm = new FormGroup({
      mens: new FormControl(this.ActualPartners.mens,Validators.required),
      womens: new FormControl(this.ActualPartners.womens,Validators.required)
    });
  }

  cancelLastPartners(){
    this.editLastMode = false;
    this.LastPartnersForm = null;
  }

  updateLastPartners(){
    this._store.dispatch(fromLoadingActions.initLoading({message: 'Guardando los cambios...'}));
    let history : any[];
    history = this.Organization.historyPartners;
    let registry = history.pop();
    registry.mens = this.LastPartnersForm.value.mens;
    registry.womens = this.LastPartnersForm.value.womens;
    history.push(registry);
    this._service.updateOrganization({historyPartners: history},this.Organization._id).subscribe(
      result => {
        this.Organization = result.organization;
        this.editLastMode = false;
        this.LastPartnersForm = null;
        this.ActualPartners.mens = registry.mens;
        this.ActualPartners.womens = registry.womens;
        this._store.dispatch(fromLoadingActions.stopLoading());
        this._service.updateOrganizationsList(null);
        this._snackBar.open('Se ha actualizado los socios correctamente.','ENTENDIDO',{duration: 3000});
      },
      error => {
        this._store.dispatch(fromLoadingActions.stopLoading());
        this._snackBar.open('Ha ocurrido un error.','ENTENDIDO',{duration: 3000});
      }
    )
  }

  cancel(){
    this.PartnerForm.reset();
  }

  toNumber ( number : string ) : number {
    return Number.parseInt(number);
  }

  save(){
    this._store.dispatch(fromLoadingActions.initLoading({message: 'Actualizando socios...'}));
    let history : any[];
    let registry : any = this.PartnerForm.value;
    registry.period = new Date(); 
    history = this.Organization.historyPartners;
    history.push(registry);
    this._service.updateOrganization({historyPartners: history},this.Organization._id).subscribe(
      result => {
        this.ActualPartners.mens = this.mensCtrl.value;
        this.ActualPartners.womens = this.womensCtrl.value;
        this._store.dispatch(fromLoadingActions.stopLoading());
        this._service.updateOrganizationsList(null);
        this.PartnerForm.reset();
        this._snackBar.open('Se ha actualizado los socios correctamente.','ENTENDIDO',{duration: 3000});
      },error => {
        this._store.dispatch(fromLoadingActions.stopLoading());
        this._snackBar.open('Ha ocurrido un error al actualizar los socios.','ENTENDIDO',{duration: 3000});
      }
    );
  }

}
