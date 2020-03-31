import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthObject } from '../reducers/actions/session.actions';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { catchError } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { State } from '../reducers/index';
import { isAuth } from '../reducers/selectors/session.selector';

@Injectable({
  providedIn: 'root'
})
export class AuthServiceService {

  isAuth : boolean;

  constructor(private http : HttpClient,
              private store : Store<State>) {

                this.store.select(isAuth).subscribe(auth => this.isAuth = auth);
               }

  jsonHeader : HttpHeaders = new HttpHeaders({'Content-Type':'application/json'});

  Login (authObject : AuthObject) : Observable<any> {
    return this.http
               .post<any>(`${environment.baseUrl}/User/login`,authObject,{headers: this.jsonHeader})
               .pipe(catchError((error: any) => Observable.throw(error.json())));
  }

  isLogged() : boolean {
    return this.isAuth;
  }

}
