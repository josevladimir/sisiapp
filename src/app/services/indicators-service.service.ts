import { Injectable } from '@angular/core';
import { HeadersGenerator } from './headersGenerator.service';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StorageMap } from '@ngx-pwa/local-storage';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
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
export class IndicatorsServiceService {

  constructor(private http : HttpClient,
              private store : Store<State>,
              private storage : StorageMap,
              private sockets : SocketioService,
              private projectsService : ProjectsServiceService,
              private location : Location,
              private snackBar : MatSnackBar,
              private headersGenerator : HeadersGenerator) { }

  getIndicators(NoNotify? : boolean) : void {
    this.http
        .get<any[]>(`${environment.baseUrl}/Indicator`,{headers: this.headersGenerator.generateAuthHeader()})
        .subscribe((indicators : any[]) => this.storage.set('indicators', indicators).subscribe(() => {
          if(!NoNotify) this.snackBar.open('Se han recuperado los Indicadores.','ENTENDIDO',{duration: 3000});
        }),
        error => this.snackBar.open('Ha ocurrido un error.','ENTENDIDO',{duration: 3000}));
  }

  getIndicatorsLocal() : Observable<any> {
    return this.storage.watch('indicators'); 
  }

  getIndicatorsUniqueLocal() : Observable<any> {
    return this.storage.get('indicators'); 
  }

  createIndicator (indicator : any) : void {
    this.http
        .post(`${environment.baseUrl}/Indicator/`,indicator,{headers: this.headersGenerator.generateJsonHeader()})
        .subscribe((response : any) => {
          this.sockets.emit('indicatorWasCreated',response.indicator);
          this.addToStorage(response.indicator);
        },error => {
          this.store.dispatch(fromLoadingActions.stopLoading());      
          this.snackBar.open('Ha ocurrido un error al guardar el nuevo Indicador.','ENTENDIDO',{duration: 3000});
        });
  }

  addToStorage(indicator : any, out? : boolean) : void {
    this.storage.get('indicators').subscribe((indicators : any[]) => {
      indicators.push(indicator);
      this.storage.set('indicators',indicators).subscribe(() => {});
      if(!out) {
        this.store.dispatch(fromLoadingActions.stopLoading());
        this.location.back();
        this.snackBar.open('Se ha guardado el Indicador.','ENTENDIDO',{duration: 3000});
      }
    });
  }

  updateIndicator (indicator : any, id : string) : void {
    this.http
        .put(`${environment.baseUrl}/Indicator/${id}`,indicator,{headers: this.headersGenerator.generateJsonHeader()})
        .subscribe((response : any) => {
          this.sockets.emit('indicatorWasUpdated', {});
          this.updateIndicatorsOnStorage();
        },error => {
          this.store.dispatch(fromLoadingActions.stopLoading());
          this.snackBar.open('Ha ocurrido un error.','ENTENDIDO',{duration: 3000});
        }
      );
    }
    
  updateIndicatorsOnStorage ( out? : boolean) {
    this.getIndicators(out);
    if(!out) {
      this.store.dispatch(editModeSetDisabled());
      this.store.dispatch(fromLoadingActions.stopLoading());
      this.snackBar.open('Se han guardado los cambios en el Indicador.','ENTENDIDO',{duration: 3000});
    }
  }

  deleteIndicator (id : string) : void {
    this.http
        .delete(`${environment.baseUrl}/Indicator/${id}`,{headers: this.headersGenerator.generateAuthHeader()})
        .subscribe((response : any) => {
          this.sockets.emit('indicatorWasDeleted',response.indicator._id);
          this.sockets.emit('projectWasUpdated',{});
          this.projectsService.getProjects(false,true);
          this.removeFromStorage(response.indicator._id);
        },
        error => {
          this.store.dispatch(fromLoadingActions.stopLoading());
          this.snackBar.open('Error al eliminar el indicador.','ENTENDIDO',{duration: 3000})
        });
  }

  removeFromStorage(_id : string, out? : boolean) : void {
    this.storage.get('indicators').subscribe((indicators : any[]) => {
      console.log(indicators);
      let index : number;
      indicators.forEach((funder : any, i : number) => {
        if(funder._id == _id) return index = i;
      });
      indicators.splice(index,1);
      this.storage.set('indicators',indicators).subscribe(() => {});
      if(!out) {
        this.location.back();
        this.store.dispatch(fromLoadingActions.stopLoading());
        this.snackBar.open('Se ha eliminado el Indicador.','ENTENDIDO',{duration: 3000});
      }
    });
  }

}
