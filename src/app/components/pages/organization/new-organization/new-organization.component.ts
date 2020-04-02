import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { State } from 'src/app/reducers';
import { MatSelect } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { MyValidators } from '../../../../models/Validators';
import * as fromLoadingActions from '../../../../reducers/actions/loading.actions';
import { PreferencesServiceService } from '../../../../services/preferences-service.service';
import { OrganizationsServiceService } from '../../../../services/organizations-service.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NewOrganizationPreferenceComponent } from '../../../dialogs/new-organization-preference/new-organization-preference.component';

@Component({
  selector: 'app-new-organization',
  templateUrl: './new-organization.component.html'
})
export class NewOrganizationComponent implements OnInit {

  organizationForm : FormGroup;

  OptionsOfSelects : any = {
    Sectors: [],
    Types: []
  }

  isOlder : boolean = false;

  newSector : boolean = false;

  subscription : Subscription;

  constructor(private _organizationsService : OrganizationsServiceService,
              private _preferencesService : PreferencesServiceService,
              private dialog : MatDialog,
              private _store : Store<State>) { 
  
    this.subscription = this._preferencesService.getPreferencesLocal().subscribe(preference => this.OptionsOfSelects = {Sectors: preference.sectors,Types: preference.types});

  }

  ngOnInit() {
    this.organizationForm = new FormGroup({
      name : new FormControl('',[Validators.required,MyValidators.existOrganization]),
      foundation_date : new FormControl('',[Validators.required]),
      sector: new FormControl('',Validators.required),
      type: new FormControl('',Validators.required),
      legalized: new FormControl('',Validators.required),
      partners: new FormGroup({
        mens: new FormControl('',[Validators.required,Validators.pattern(new RegExp(/^\d{1,8}$/))]),
        womens: new FormControl('',[Validators.required,Validators.pattern(new RegExp(/^\d{1,8}$/))])
      }),
      beneficiaries: new FormControl('',[Validators.required,Validators.pattern(new RegExp(/^\d{1,8}$/))]),
      ubication: new FormGroup({
        canton: new FormControl('',Validators.required),
        recinto: new FormControl('',Validators.required),
        parroquia: new FormControl('',Validators.required)
      })
    });
  }

  setOlder(event){
    let anio : number = event.value.getFullYear();
    if(anio >= 2019) this.isOlder = false;
    else this.isOlder = true;
  }

  saveOrganization(){
    this._store.dispatch(fromLoadingActions.initLoading({message: 'Guardando nueva organización...'}));
    let organization = this.organizationForm.value;
    organization.created_by = localStorage.getItem('userID');
    organization.isOlder = this.isOlder;

    this._organizationsService.createOrganization(organization);
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
