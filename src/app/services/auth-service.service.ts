import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthObject } from '../reducers/actions/session.actions';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthServiceService {

  constructor(private http : HttpClient) { }

  jsonHeader : HttpHeaders = new HttpHeaders({'Content-Type':'application/json'});

  Login (authObject : AuthObject) : Observable<any> {
    return this.http
               .post<any>(`${environment.baseUrl}/User/login`,authObject,{headers: this.jsonHeader})
               .pipe(catchError((error: any) => Observable.throw(error.json())));
  }

}
