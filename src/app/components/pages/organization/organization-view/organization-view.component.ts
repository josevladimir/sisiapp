import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormGroup,FormControl,Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ToolbarButton } from '../../../shared/sub-toolbar/sub-toolbar.component';
import { Store } from '@ngrx/store';
import { State } from 'src/app/reducers';
import * as fromLoadingActions from '../../../../reducers/actions/loading.actions';
import { isCoordinator, isAdmin } from '../../../../reducers/selectors/session.selector';
import { OrganizationsServiceService } from '../../../../services/organizations-service.service';
import { Subscription, Observable } from 'rxjs';
import { MyValidators } from '../../../../models/Validators';
import { isEditMode } from '../../../../reducers/selectors/general.selector';
import { editModeSetDisabled } from '../../../../reducers/actions/general.actions';
import { PreferencesServiceService } from '../../../../services/preferences-service.service';
import { MatSelect } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';
import { NewOrganizationPreferenceComponent } from '../../../dialogs/new-organization-preference/new-organization-preference.component';

@Component({
  selector: 'app-organization-view',
  templateUrl: './organization-view.component.html'
})
export class OrganizationViewComponent implements OnInit{

  buttons : ToolbarButton[];

  Organization : any;

  organizationForm : FormGroup;

  
  isAdmin : Observable<boolean>;
  isCoordinator : Observable<boolean>;

  editMode : Observable<boolean>;

  isOlder : boolean = false;

  subscription : Subscription;

  OptionsOfSelects : any = {
    Sectors: [],
    Types: []
  }

  DeleteButton : () => void = () => {
      if(confirm('¿Está seguro que desea eliminar esta Organización?\n\nEsta acción no se puede deshacer.')) {
        this._store.dispatch(fromLoadingActions.initLoading({message: 'Elimimnando la Organización...'}));
        this._organizationsService.deleteOrganization(this.Organization._id);
      }
    }

  constructor(private _ActivatedRoute : ActivatedRoute,
              private _preferencesService : PreferencesServiceService,
              private _organizationsService : OrganizationsServiceService,
              private _Router : Router,
              private dialog : MatDialog,
              private _store : Store<State>) {

    this.isAdmin = this._store.select(isAdmin);
    this.isCoordinator = this._store.select(isCoordinator);
    this.editMode = this._store.select(isEditMode);
    
    this._preferencesService.getPreferencesLocal().subscribe(preferences => this.OptionsOfSelects = {
      Sectors: preferences.sectors,
      Types: preferences.types
    });

    this._ActivatedRoute.params.subscribe(
      (params : Params) => {
        this._organizationsService.getOrganizationsLocal().subscribe(organizations => this.Organization = organizations.filter(organization => organization._id == params.id)[0]);
      }
    );

    this.buttons  = [
      {
        message: 'SOCIOS',
        hasIcon: true,
        icon: 'people',
        handler: () => {
          this._Router.navigate(['organizations',this.Organization._id,'partners']);
        }
      }
    ];
    
  }

  ngOnInit(){
    this.organizationForm = new FormGroup({
      name : new FormControl(this.Organization.name,[Validators.required,MyValidators.existOrganization]),
      foundation_date : new FormControl(this.Organization.foundation_date,[Validators.required]),
      sector: new FormControl(this.Organization.sector,Validators.required),
      type: new FormControl(this.Organization.type,Validators.required),
      legalized: new FormControl(this.Organization.legalized,Validators.required),
      beneficiaries: new FormControl(this.Organization.beneficiaries,[Validators.required,Validators.pattern(new RegExp(/^\d{1,8}$/))]),
      ubication: new FormGroup({
        canton: new FormControl(this.Organization.ubication.canton,Validators.required),
        recinto: new FormControl(this.Organization.ubication.recinto,Validators.required),
        parroquia: new FormControl(this.Organization.ubication.parroquia,Validators.required)
      })
    });
  } 

  setOlder(event){
    let anio : number = event.value.getFullYear();
    if(anio >= 2019) this.isOlder = false;
    else this.isOlder = true;
  }

  updateOrganization(){
    this._store.dispatch(fromLoadingActions.initLoading({message: 'Guardando los cambios...'}));
    let body : any = this.organizationForm.value;
    body.isOlder = this.isOlder;
    this._organizationsService.updateOrganization(body,this.Organization._id);
  }

  onCancel(){
    if(confirm('Todos los cambios no guardados se perderán.\n\n¿Desea continuar?')){
      this.organizationForm.reset({
        name : this.Organization.name,
        foundation_date : this.Organization.foundation_date,
        sector: this.Organization.sector,
        type: this.Organization.type,
        legalized: this.Organization.legalized,
        beneficiaries: this.Organization.beneficiaries,
        ubication: {
          canton: this.Organization.ubication.canton,
          recinto: this.Organization.ubication.recinto,
          parroquia: this.Organization.ubication.parroquia
        }
      });
      this._store.dispatch(editModeSetDisabled());
    }
  }

  /**
   * Sectors
   */
  addNewSector(SelectSectors : MatSelect){
    const dialogRef = this.dialog.open(NewOrganizationPreferenceComponent, {
      width: '550px',
      data: {preference: 'sectors'}
    });

    SelectSectors.close();

    dialogRef.afterClosed().subscribe(sector => {
      if(sector){
        /**Actualizar Preferencias*/
        this._preferencesService.addNewOrganizationPreference({sector});
      }
    });
  }

  addNewType(TypesSelect : MatSelect){
    const dialogRef = this.dialog.open(NewOrganizationPreferenceComponent, {
      width: '550px',
      data: {preference: 'types'}
    });

    TypesSelect.close();

    dialogRef.afterClosed().subscribe(type => {
      if(type){
        /**Actualizar Preferencias */
        this._preferencesService.addNewOrganizationPreference({type});
      }
    });
  }

}
