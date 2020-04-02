import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { HeadersGenerator } from './headersGenerator.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { State } from '../reducers';
import { StorageMap } from '@ngx-pwa/local-storage';
import { Observable } from 'rxjs';
import { SocketioService } from './socketio.service';

@Injectable({
  providedIn: 'root'
})
export class PreferencesServiceService {

  constructor(private http : HttpClient,
              private sockets : SocketioService,
              private storage : StorageMap,
              private snackBar : MatSnackBar,
              private headersGenerator : HeadersGenerator) { }

  getPreferences (NoNotify? : boolean) : void {
    this.http
        .get(`${environment.baseUrl}/Preferences/`,{headers: this.headersGenerator.generateAuthHeader()})
        .subscribe((response : any) => {
          let preferencias = {
            sectors: response.preferences.Organizations.Sectors,
            types: response.preferences.Organizations.Types
          }
          this.storage.set('preferences',preferencias).subscribe(() => {
            if(!NoNotify) this.snackBar.open('Se han obtenido las preferencias de Usuario.','ENTENDIDO',{duration: 3000})
          });
        },error => this.snackBar.open('Ha ocurrido un error.','ENTENDIDO',{duration: 3000}));
  }

  getPreferencesLocal () : Observable<any> {
    return this.storage.watch('preferences');
  }

  addNewOrganizationPreference (preference : any) : void {
    this.http
        .put(`${environment.baseUrl}/Preferences/`,preference,{headers: this.headersGenerator.generateJsonHeader()})
        .subscribe((response : any) => {
          this.sockets.emit('preferencesWasUpdated', {});
          this.updatePreferencesOnStorage();
        },error => this.snackBar.open('Ha ocurrido un error.','ENTENDIDO',{duration: 3000}));
  }

  updatePreferencesOnStorage ( out? : boolean) {
    this.getPreferences(out);
    if(!out) {
      this.snackBar.open('Se ha actualizado las preferencias.','ENTENDIDO',{duration: 3000});
    }
  }

}
