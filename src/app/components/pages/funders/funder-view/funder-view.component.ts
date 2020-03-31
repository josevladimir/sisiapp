import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { State } from '../../../../reducers/index';
import { isAdmin } from 'src/app/reducers/selectors/session.selector';
import { Observable } from 'rxjs';
import * as fromLoadingActions from '../../../../reducers/actions/loading.actions';
import { ActivatedRoute, Params } from '@angular/router';
import { FundersServiceService, Funder } from '../../../../services/funders-service.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { isEditMode } from '../../../../reducers/selectors/general.selector';
import { editModeSetDisabled } from '../../../../reducers/actions/general.actions';

@Component({
  selector: 'app-funder-view',
  templateUrl: './funder-view.component.html'
})
export class FunderViewComponent implements OnInit{

  isAdmin : Observable<boolean>;
  editMode : Observable<boolean>;

  Funder : Funder = {name: '',projects: [],place: '',website: '',_id: '',coop_date: '',created_by: '',created_at: null, last_update: null};

  FunderFormGroup : FormGroup;

  DeleteBtn : () => void = ()=>{
      if(confirm('¿Está seguro que desea eliminar este Financiador?\n\nEsta acción no se puede deshacer.')){
        this._store.dispatch(fromLoadingActions.initLoading({message: 'Eliminando Financiador...'}));
        this._fundersService.deleteFunder(this.Funder._id);
      }
    }

  constructor(private _activatedRoute : ActivatedRoute,
              private _fundersService : FundersServiceService,
              private _store : Store<State>) { 
  
    this.editMode = this._store.select(isEditMode);
    this.isAdmin = this._store.select(isAdmin);
    this._activatedRoute.params.subscribe(
      (params : Params) => {
        this._fundersService.getFundersLocal().subscribe((funders : Funder[]) => this.Funder = funders.filter((funder : Funder) => funder._id == params.id)[0]);
      });


  }
  
  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.FunderFormGroup = new FormGroup({
      name: new FormControl(this.Funder.name,Validators.required),
      place: new FormControl(this.Funder.place,Validators.required),
      website: new FormControl(this.Funder.website),
      coop_date: new FormControl(this.Funder.coop_date,[Validators.required,Validators.pattern(new RegExp(/^\d{1,2}\/\d{4}$/))])
    });
  }

  save(){
    this._store.dispatch(fromLoadingActions.initLoading({message: 'Guardando cambios en el financiador...'}));
    this._fundersService.updateFunder(this.FunderFormGroup.value,this.Funder._id);
  }

  cancel(){
    this.FunderFormGroup.reset({
      name: this.Funder.name,
      place: this.Funder.place,
      website: this.Funder.website,
      coop_date: this.Funder.coop_date
    });
    this._store.dispatch(editModeSetDisabled())
  }

}
