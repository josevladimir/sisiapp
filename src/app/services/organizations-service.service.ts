import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { StorageMap } from '@ngx-pwa/local-storage';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { HeadersGenerator } from './headersGenerator.service';
import { SocketioService } from './socketio.service';
import { Store } from '@ngrx/store';
import { State } from '../reducers';
import * as fromLoadingActions from '../reducers/actions/loading.actions';
import { Location } from '@angular/common';
import { editModeSetDisabled } from '../reducers/actions/general.actions';
import { ProjectsServiceService } from './projects-service.service';

@Injectable({
  providedIn: 'root'
})
export class OrganizationsServiceService {

  constructor(private http : HttpClient,
              private store : Store<State>,
              private storage : StorageMap,
              private sockets : SocketioService,
              private projectsService : ProjectsServiceService,
              private location : Location,
              private snackBar : MatSnackBar,
              private headersGenerator : HeadersGenerator) { }


  getOrganizations (NoNotify? : boolean) : void {
    this.http
        .get(`${environment.baseUrl}/Organization`,{headers: this.headersGenerator.generateAuthHeader()})
        .subscribe((organizations : any[]) => this.storage.set('organizations',organizations).subscribe(() => {
          if(!NoNotify) this.snackBar.open('Se han recuperado las organizaciones.','ENTENDIDO',{duration: 3000});
        }),
        error => this.snackBar.open('Ha ocurrido un error.','ENTENDIDO',{duration: 3000}));//TODO: defina an interface for Organization's model.
  }

  getOrganizationsLocal () : Observable<any> {
    return this.storage.watch('organizations');
  }

  createOrganization (organization : any) : void {
    this.http
        .post(`${environment.baseUrl}/Organization/`,organization,{headers: this.headersGenerator.generateJsonHeader()})
        .subscribe((response : any) => {
          this.sockets.emit('organizationWasCreated',response.organization);
          this.addToStorage(response.organization);
        },error => {
          this.store.dispatch(fromLoadingActions.stopLoading());      
          this.snackBar.open('Ha ocurrido un error al guardar la organización.','ENTENDIDO',{duration: 3000});
        });
  }

  addToStorage(organization : any, out? : boolean) : void {
    this.storage.get('organizations').subscribe((organizations : any[]) => {
      organizations.push(organization);
      this.storage.set('organizations',organizations).subscribe(() => {});
      if(!out) {
        this.store.dispatch(fromLoadingActions.stopLoading());
        this.location.back();
        this.snackBar.open('Se ha guardado la organización.','ENTENDIDO',{duration: 3000});
      }
    });
  }

  updateOrganization (organization : any, id : string) : void {
    this.http
        .put(`${environment.baseUrl}/Organization/${id}`,organization,{headers: this.headersGenerator.generateJsonHeader()})
        .subscribe((response : any) => {
          this.sockets.emit('organizationWasUpdated', {});
          this.updateOrganizationsOnStorage();
        },error => {
          this.store.dispatch(fromLoadingActions.stopLoading());
          this.snackBar.open('Ha ocurrido un error.','ENTENDIDO',{duration: 3000});
        }
      );
    }
    
  updateOrganizationsOnStorage ( out? : boolean) {
    this.getOrganizations(out);
    if(!out) {
      this.store.dispatch(editModeSetDisabled());
      this.store.dispatch(fromLoadingActions.stopLoading());
      this.snackBar.open('Se han guardado los cambios en la Organización.','ENTENDIDO',{duration: 3000});
    }
  }

  deleteOrganization (id : string) : void {
    this.http
        .delete(`${environment.baseUrl}/Organization/${id}`,{headers: this.headersGenerator.generateAuthHeader()})
        .subscribe((response : any) => {
          this.sockets.emit('organizationWasDeleted',response.organization._id);
          this.removeFromStorage(response.organization._id);
        },
        error => {
          this.store.dispatch(fromLoadingActions.stopLoading());
          this.snackBar.open('Error al eliminar la organización.','ENTENDIDO',{duration: 3000})
        });
  }

  removeFromStorage(_id : string, out? : boolean) : void {
    this.storage.get('organizations').subscribe((organizations : any[]) => {
      let index : number;
      organizations.forEach((funder : any, i : number) => {
        if(funder._id == _id) return index = i;
      });
      organizations.splice(index,1);
      this.storage.set('organizations',organizations).subscribe(() => {});
      this.sockets.emit('projectWasUpdated',{});
      this.projectsService.getProjects(false,true);
      if(!out) {
        this.location.back();
        this.store.dispatch(fromLoadingActions.stopLoading());
        this.snackBar.open('Se ha eliminado la organización.','ENTENDIDO',{duration: 3000});
      }
    });
  }

}
