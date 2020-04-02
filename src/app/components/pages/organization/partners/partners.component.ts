import { Component } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { SisiCoreService } from '../../../../services/sisi-core.service';
import { ToolbarButton } from '../../../shared/sub-toolbar/sub-toolbar.component';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { State } from 'src/app/reducers';
import * as fromLoadingActions from '../../../../reducers/actions/loading.actions';
import { OrganizationsServiceService } from '../../../../services/organizations-service.service';
import { Observable } from 'rxjs';
import { isAdmin } from '../../../../reducers/selectors/session.selector';
import { SocketioService } from '../../../../services/socketio.service';
import { isEditMode } from '../../../../reducers/selectors/general.selector';
import { editModeSetEnabled, editModeSetDisabled } from '../../../../reducers/actions/general.actions';

@Component({
  selector: 'app-partners',
  templateUrl: './partners.component.html'
})
export class PartnersComponent {

  PartnerForm : FormGroup;
  LastPartnersForm : FormGroup;

  Organization : any;
  ActualPartners : any;

  isAdmin : Observable<boolean>;
  editLastMode : Observable<boolean>;
  
  buttons : ToolbarButton[];

  constructor(private _ActivedRoute : ActivatedRoute,
              private _organizationsService : OrganizationsServiceService,
              private _Router : Router,
              private _store : Store<State>) { 
    
    this.isAdmin = this._store.select(isAdmin);

    this.editLastMode = this._store.select(isEditMode);
    
    this._ActivedRoute.params.subscribe(  
      (params: Params) => this._organizationsService.getOrganizationsLocal().subscribe(organizations => {
        this.Organization = organizations.filter(organization => organization._id == params.id)[0];
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
      })
      );
      
      this.PartnerForm = new FormGroup({
        mens: new FormControl(null,[Validators.required]),
        womens: new FormControl(null,[Validators.required])
      });

    this.buttons = [
      {
        message: 'HISTÓRICO',
        hasIcon: true,
        icon: 'timeline',
        handler: () => this._Router.navigateByUrl(`/main/organizations/${this.Organization._id}/partners/historic`)
      }
    ];
  }

  editLast(){
    this._store.dispatch(editModeSetEnabled());
    this.LastPartnersForm = new FormGroup({
      mens: new FormControl(this.ActualPartners.mens,Validators.required),
      womens: new FormControl(this.ActualPartners.womens,Validators.required)
    });
  }

  cancelLastPartners(){
    this._store.dispatch(editModeSetDisabled());
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
    this._organizationsService
        .updateOrganization({historyPartners: history},this.Organization._id);
  }

  cancel(){
    this.PartnerForm.reset({
      mens: 0,
      womens: 0
    });
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
    this._organizationsService.updateOrganization({historyPartners: history},this.Organization._id);
    this.PartnerForm.reset({
      mens: 0,
      womens: 0
    });
  }

}
