import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { StorageMap } from '@ngx-pwa/local-storage';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HeadersGenerator } from './headersGenerator.service';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import * as fromLoadingActions from '../reducers/actions/loading.actions';
import { Location } from '@angular/common';
import { Store } from '@ngrx/store';
import { State } from '../reducers';
import { SocketioService } from './socketio.service';

@Injectable({
  providedIn: 'root'
})
export class UsersServiceService {

  constructor(private http : HttpClient,
              private store : Store<State>,
              private sockets : SocketioService,
              private location : Location,
              private storage : StorageMap,
              private snackBar : MatSnackBar,
              private headersGenerator : HeadersGenerator) { }

  getUsers () : void {
    this.http
        .get(`${environment.baseUrl}/User/`,{headers: this.headersGenerator.generateAuthHeader()})
        .subscribe((users : any) => this.storage.set('users',users.users).subscribe(() => this.snackBar.open('Se han recuperado los Usuarios.','ENTENDIDO',{duration: 3000})),
        error => this.snackBar.open('Ha ocurrido un error.','ENTENDIDO',{duration: 3000}));
  }

  getUsersLocal () : Observable<any>{
    return this.storage.watch('users');
  }

  getUser () : Observable<any>{
    return this.storage.get('users');
  }

  createUser (user : any) : void {
    this.http
        .post(`${environment.baseUrl}/User/`,user,{headers: this.headersGenerator.generateJsonHeader()})
        .subscribe((response : any) => {
          this.sockets.emit('userWasCreated',response.user);
          this.addToStorage(response.user);
        },error => {
          this.store.dispatch(fromLoadingActions.stopLoading());      
          this.snackBar.open('Ha ocurrido un error al guardar el nuevo Usuario.','ENTENDIDO',{duration: 3000});
        });
  }

  addToStorage(user : any, out? : boolean) : void {
    this.storage.get('users').subscribe((users : any[]) => {
      users.push(user);
      this.storage.set('users',users).subscribe(() => {});
      if(!out) {
        this.store.dispatch(fromLoadingActions.stopLoading());
        this.location.back();
        this.snackBar.open('Usuario registrado correctamente.','ENTENDIDO',{duration: 3000});
      }
    });
  }

  initializateOnlineUsersList ( onlineUsersList : any[]){
    this.getUser().subscribe(users => {
      for(let i = 0; i < onlineUsersList.length; i++){
        for(let j = 0; j < users.length; j++){
          if(onlineUsersList[i]._id == users[j]._id) {
            users[j].online = true;
            break;
          }
        }
      }
      this.storage.set('users',users).subscribe(() => {});
    });
  }

  updateOnlineUsersList (user : any) {
    this.getUser().subscribe(users => {
      for(let i = 0; i < users.length; i++){
        if(users[i]._id == user.user._id) {
          if(user.action == 'join') users[i].online = true;
          else if(user.action == 'left') delete users[i].online;
          break;
        }
      }
      this.storage.set('users',users).subscribe(() => {});
    });
  }

  updateUser (user : any,id : string) : void {
    this.http.put(`${environment.baseUrl}/User/${id}`,user,{headers: this.headersGenerator.generateJsonHeader()})
             .subscribe(
              result => {
                this.store.dispatch(fromLoadingActions.stopLoading());
                this.snackBar.open('Se han guardado los cambios.','ENTENDIDO',{duration: 3000});
              },error => {
                this.store.dispatch(fromLoadingActions.stopLoading());
                this.snackBar.open('Ocurrió un error al guardar los cambios.','ENTENDIDO',{duration: 3000});
              }
            )
  }

  updateOnlyUser (user : any,id : string) : Observable<any> {
    return this.http.put(`${environment.baseUrl}/User/${id}`,user,{headers: this.headersGenerator.generateJsonHeader()});
  }

}
