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
import { editModeSetDisabled } from '../reducers/actions/general.actions';
 
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

  getProjects(isFunder : boolean, NoNotify? : boolean) {
    console.log('Lanzado obtener proyectos');
    if(isFunder) this.http
                     .get<any[]>(`${environment.baseUrl}/Project/`,{headers: this.headersGenerator.generateAuthHeader()})
                     .subscribe((projects : any[]) => this.storage.set('projects',projects).subscribe(() => this.snackBar.open('Se han recuperado los Proyectos.','ENTENDIDO',{duration: 3000})),
                     error => this.snackBar.open('Ha ocurrido un error.','ENTENDIDO',{duration: 3000}));
    else this.http
             .get<any[]>(`${environment.baseUrl}/Project`,{headers: this.headersGenerator.generateAuthHeader()})
             .subscribe((projects : any[]) => {
               this.storage.set('projects',projects).subscribe(() => {
                if(!NoNotify) this.snackBar.open('Se han recuperado los Proyectos.','ENTENDIDO',{duration: 3000})
               })
             },error => this.snackBar.open('Ha ocurrido un error.','ENTENDIDO',{duration: 3000}));
  }

  getProjectsLocal() : Observable<any>{
    return this.storage.watch('projects');
  }

  getProjectsUniqueLocal() : Observable<any>{
    return this.storage.get('projects');
  }

  createProject (project : any) : Observable<any> {
    return this.http
        .post<any>(`${environment.baseUrl}/Project/`,project,{headers: this.headersGenerator.generateJsonHeader()});
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

  updateProject(project: any, id : string) : Observable<any> {
      return this.http.put(`${environment.baseUrl}/Project/${id}`,project,{headers: this.headersGenerator.generateJsonHeader()});
  }

  updateProjectOnStorage ( out? : boolean) {
    console.log('lanzado actualización de projectos;');
    this.getProjects(false, out);
    if(!out) {
      this.store.dispatch(editModeSetDisabled());
      this.store.dispatch(fromLoadingActions.stopLoading());
      this.snackBar.open('Se han guardado los cambios en el Proyecto.','ENTENDIDO',{duration: 3000});
    }
  }

  deleteProject (id : string) : void {
    this.http
        .delete(`${environment.baseUrl}/Project/${id}`,{headers: this.headersGenerator.generateAuthHeader()})
        .subscribe((response : any) => {
          this.sockets.emit('projectWasDeleted',response.project._id);
          this.sockets.emit('funderWasUpdated',response.project._id);
          this.sockets.emit('documentWasUpdated',response.project._id);
          this.sockets.emit('organizationWasUpdated',response.project._id);
          this.removeFromStorage(response.project._id);
        },
        error => {
          this.store.dispatch(fromLoadingActions.stopLoading());
          this.snackBar.open('Error al eliminar el Proyecto.','ENTENDIDO',{duration: 3000})
        });
  }

  removeFromStorage(_id : string, out? : boolean) : void {
    this.storage.get('projects').subscribe((projects : any[]) => {
      let index : number;
      projects.forEach((funder : any, i : number) => {
        if(funder._id == _id) return index = i;
      });
      projects.splice(index,1);
      this.storage.set('projects',projects).subscribe(() => {});
      if(!out) {
        this.location.back();
        this.store.dispatch(fromLoadingActions.stopLoading());
        this.snackBar.open('Se ha eliminado el Proyecto.','ENTENDIDO',{duration: 3000});
      }
    });
  }

  delinkFunder(projectID : string, funderID : string) : Observable<any>{
    return this.http.put(`${environment.baseUrl}/Project/delinkFunder/${projectID}/`,{funderID},{headers: this.headersGenerator.generateJsonHeader()});
  }

  updateSchema(projectID : string, body : any) : Observable<any>{
    return this.http.put(`${environment.baseUrl}/Project/updateSchema/${projectID}/`,body,{headers: this.headersGenerator.generateJsonHeader()});
  }

}
