import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { StorageMap } from '@ngx-pwa/local-storage';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HeadersGenerator } from './headersGenerator.service';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { SocketioService } from './socketio.service';
import { Store } from '@ngrx/store';
import { State } from '../reducers';
import * as fromLoadingActions from '../reducers/actions/loading.actions';
import { Location } from '@angular/common';
 
@Injectable({
  providedIn: 'root'
})
export class ProjectsServiceService {

  constructor(private http : HttpClient,
              private store : Store<State>,
              private sockets : SocketioService,
              private storage : StorageMap,
              private location : Location,
              private snackBar : MatSnackBar,
              private headersGenerator : HeadersGenerator) { }

  getProjects(isFunder : boolean) {
    if(isFunder) this.http
                     .get<any[]>(`${environment.baseUrl}/Project/`,{headers: this.headersGenerator.generateAuthHeader()})
                     .subscribe((projects : any[]) => this.storage.set('projects',projects).subscribe(() => this.snackBar.open('Se han recuperado los Proyectos.','ENTENDIDO',{duration: 3000})),
                     error => this.snackBar.open('Ha ocurrido un error.','ENTENDIDO',{duration: 3000}));
    else this.http
             .get<any[]>(`${environment.baseUrl}/Project`,{headers: this.headersGenerator.generateAuthHeader()})
             .subscribe((projects : any[]) => this.storage.set('projects',projects).subscribe(() => this.snackBar.open('Se han recuperado los Proyectos.','ENTENDIDO',{duration: 3000})),
             error => this.snackBar.open('Ha ocurrido un error.','ENTENDIDO',{duration: 3000}));
  }

  getProjectsLocal() : Observable<any>{
    return this.storage.watch('projects');
  }

  /*.subscribe(
      result => {
        if(result.message == 'CREATED') {
          this.uploadBeneficiariesList(result.project._id);/*.subscribe(
            result => {
              if(result.message =="CREATED"){
                this._service.updateOrganizationsList(null);
                this._service.updateFundersList(null);
                this._service.updateProjectsList(true);
                this._store.dispatch(fromLoadingActions.stopLoading());
                this._snackbar.open('Proyecto Registrado correctamente.','ENTENDIDO',{duration: 3000});
              }
            },error => {
              this._store.dispatch(fromLoadingActions.stopLoading());
              this._snackbar.open('Ha ocurrido un error al subir el archivo de Beneficiarios.','ENTENDIDO',{duration: 3000})
            }
          );
        }
      },error => {
        this._store.dispatch(fromLoadingActions.stopLoading());
        this._snackbar.open('Ocurrió un error al guardar el nuevo proyecto.','ENTENDIDO',{duration: 3000})
      }
    )*/

  createProject (project : any) : void {
    this.http
        .post(`${environment.baseUrl}/Project/`,project,{headers: this.headersGenerator.generateJsonHeader()})
        .subscribe((response : any) => {
          this.sockets.emit('projectWasCreated',response.project);
          this.addToStorage(response.project);
        },error => {
          this.store.dispatch(fromLoadingActions.stopLoading());      
          this.snackBar.open('Ha ocurrido un error al guardar el nuevo Proyecto.','ENTENDIDO',{duration: 3000});
        });
  }

  addToStorage(project : any, out? : boolean) : void {
    this.storage.get('projects').subscribe((projects : any[]) => {
      projects.push(project);
      this.storage.set('projects',projects).subscribe(() => {});
      if(!out) {
        this.store.dispatch(fromLoadingActions.stopLoading());
        this.location.back();
        this.snackBar.open('Se ha guardado el Proyecto.','ENTENDIDO',{duration: 3000});
      }
    });
  }

}
