import { Injectable, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { State } from '../reducers';
import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StorageMap } from '@ngx-pwa/local-storage';
import { environment } from 'src/environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HeadersGenerator } from './headersGenerator.service';
import { SocketioService } from './socketio.service';
import * as fromLoadingActions from '../reducers/actions/loading.actions';
import { editModeSetDisabled } from '../reducers/actions/general.actions';

@Injectable({
  providedIn: 'root'
})
export class FundersServiceService implements OnInit{

  userToken : string;
  
  constructor(private http : HttpClient,
              private store : Store<State>,
              private location : Location,
              private storage : StorageMap,
              private snackBar : MatSnackBar,
              private sockets : SocketioService,
              private headersGenerator : HeadersGenerator) { }
              
  ngOnInit(){ }
    
  getFunders ( NoNotify? : boolean) : void{
    this.http
        .get<Funder[]>(`${environment.baseUrl}/Funder/`,{headers: this.headersGenerator.generateAuthHeader()})
        .subscribe((funders : Funder[]) => this.storage.set('funders',funders).subscribe(() => {
          if(!NoNotify) this.snackBar.open('Se han recuperado los Financiadores.','ENTENDIDO',{duration: 3000})
        }),error => this.snackBar.open('Ha ocurrido un error al obtener los financiadores.','ENTENDIDO',{duration: 3000}));
  }
    
  getFundersLocal () : Observable<any> {
    return this.storage.watch('funders');
  }
    
  createFunder (funder : any) : void {
    this.http
        .post(`${environment.baseUrl}/Funder/`,funder,{headers: this.headersGenerator.generateJsonHeader()})
        .subscribe((response : any) => {
          this.sockets.emit('funderWasCreated',response.funder);
          this.addToStorage(response.funder);
        },error => {
          this.store.dispatch(fromLoadingActions.stopLoading());      
          this.snackBar.open('Ha ocurrido un error al guardar el nuevo Financiador.','ENTENDIDO',{duration: 3000});
        });
  }

  addToStorage(funder : Funder, out? : boolean) : void {
    this.storage.get('funders').subscribe((funders : Funder[]) => {
      funders.push(funder);
      this.storage.set('funders',funders).subscribe(() => {});
      if(!out) {
        this.store.dispatch(fromLoadingActions.stopLoading());
        this.snackBar.open('Se ha guardado el Financiador.','ENTENDIDO',{duration: 3000});
      }
    });
  }
    
  updateFunder (funder : any, id : string) : void {
    this.http
        .put(`${environment.baseUrl}/Funder/${id}`,funder,{headers: this.headersGenerator.generateJsonHeader()})
        .subscribe((response : any) => {
          this.sockets.emit('funderWasUpdated', null);
          this.updateFundersOnStorage();
        },error => {
          this.store.dispatch(fromLoadingActions.stopLoading());
          this.snackBar.open('Ha ocurrido un error.','ENTENDIDO',{duration: 3000});
        }
      );
    }
    
  updateFundersOnStorage ( out? : boolean) {
    this.getFunders(out);
    if(!out) {
      this.store.dispatch(editModeSetDisabled());
      this.store.dispatch(fromLoadingActions.stopLoading());
      this.snackBar.open('Se han guardado los cambios en el Financiador.','ENTENDIDO',{duration: 3000});
    }
  }
      
  deleteFunder (id : string) : void {
    this.http
        .delete(`${environment.baseUrl}/Funder/${id}`,{headers: this.headersGenerator.generateAuthHeader()})
        .subscribe((response : any) => {
          this.sockets.emit('funderWasDeleted',response.funder._id);
          this.removeFromStorage(response.funder._id);
        },
        error => {
          this.store.dispatch(fromLoadingActions.stopLoading());
          this.snackBar.open('Error al eliminar el financiador.','ENTENDIDO',{duration: 3000})
        });
  }


  removeFromStorage(_id : string, out? : boolean) : void {
    this.storage.get('funders').subscribe((funders : Funder[]) => {
      console.log(funders);
      let index : number;
      funders.forEach((funder : Funder, i : number) => {
        if(funder._id == _id) return index = i;
      });
      funders.splice(index,1);
      this.storage.set('funders',funders).subscribe(() => {});
      if(!out) {
        this.location.back();
        this.store.dispatch(fromLoadingActions.stopLoading());
        this.snackBar.open('Se ha eliminado el Financiador.','ENTENDIDO',{duration: 3000});
      }
    });
  }

}
    
export interface Funder{
  _id: string;
  name: string;
  website: string | null;
  place: string;
  coop_date: string;
  projects: any[]; //TODO: Make Project Interface
  created_by: any; //TODO: Make user simplified Interface
  created_at: Date;
  last_update: Date;
}