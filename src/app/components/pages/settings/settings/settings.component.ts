import { Component } from '@angular/core';
import { PreferencesServiceService } from '../../../../services/preferences-service.service';
import { Observable } from 'rxjs';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { State } from '../../../../reducers/index';
import { isEditMode } from '../../../../reducers/selectors/general.selector';
import { editModeSetDisabled, setLapseToRecord } from '../../../../reducers/actions/general.actions';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html'
})
export class SettingsComponent {

  SettingsGroup : FormGroup = new FormGroup({
    maxTimeToUpload: new FormControl(''),
    availableFicha: new FormControl(''),
    forCloseFicha: new FormControl('')
  });

  Types : string[];
  Sectors : string[];

  constructor(private preferencesService : PreferencesServiceService,
              private store : Store<State>,
              private router : Router) {
    this.preferencesService.getPreferencesLocal().subscribe(preferences => {
      this.Types = preferences.types;
      this.Sectors = preferences.sectors;
      this.SettingsGroup = new FormGroup({
        Fichas: new FormGroup({
          maxTimeToUpload: new FormControl(preferences.fichas.maxTimeToUpload,Validators.required)
        }),
        availableFicha: new FormControl(preferences.notifications.availableFicha,Validators.required),
        forCloseFicha: new FormControl(preferences.notifications.forCloseFicha,Validators.required)
      });
    });
  } 

  cancel(){
    if(confirm('Todos los cambios no guardados se perderán.\n\n¿Desea continuar?')) {
      this.router.navigateByUrl('main/dashboard');
    }
  }

  save(){
    if(this.SettingsGroup.valid){
      this.preferencesService.updatePreferencesSettings(this.SettingsGroup.value);
      this.store.dispatch(setLapseToRecord({numberOfDays: this.SettingsGroup.get('maxTimeToUpload').value}))
    }else alert('Todos los campos deben estar llenos!');
  }

}
