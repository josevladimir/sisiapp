import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { StorageMap } from '@ngx-pwa/local-storage';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HeadersGenerator } from './headersGenerator.service';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsersServiceService {

  constructor(private http : HttpClient,
              private storage : StorageMap,
              private snackBar : MatSnackBar,
              private headersGenerator : HeadersGenerator) { }

  getUsers () : void {
    this.http
        .get(`${environment.baseUrl}/User/`,{headers: this.headersGenerator.generateAuthHeader()})
        .subscribe((users : any) => this.storage.set('users',users).subscribe(() => this.snackBar.open('Se han recuperado los Usuarios.','ENTENDIDO',{duration: 3000})),
        error => this.snackBar.open('Ha ocurrido un error.','ENTENDIDO',{duration: 3000}));
  }

  getUsersLocal () : Observable<any>{
    return this.storage.watch('users');
  }

}
