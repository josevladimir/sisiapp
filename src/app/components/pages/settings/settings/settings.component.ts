import { Component } from '@angular/core';
import { PreferencesServiceService } from '../../../../services/preferences-service.service';
import { Observable } from 'rxjs';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html'
})
export class SettingsComponent {

  FichasGroup : FormGroup = new FormGroup({maxTimeToUpload: new FormControl('')});
  NotificationsGroup : FormGroup = new FormGroup({availableFicha: new FormControl(''),forCloseFicha: new FormControl('')});
  OrganizationsGroup : FormGroup = new FormGroup({});

  Types : string[];
  Sectors : string[];

  constructor(private preferencesService : PreferencesServiceService) {
    this.preferencesService.getPreferencesLocal().subscribe(preferences => {
      this.Types = preferences.types;
      this.Sectors = preferences.sectors;
      this.FichasGroup = new FormGroup({
        maxTimeToUpload: new FormControl(preferences.fichas.maxTimeToUpload)
      });
      this.NotificationsGroup = new FormGroup({
        availableFicha: new FormControl(preferences.notifications.availableFicha),
        forCloseFicha: new FormControl(preferences.notifications.forCloseFicha)
      });
    });
  }

}
