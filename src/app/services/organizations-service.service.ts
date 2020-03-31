import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { StorageMap } from '@ngx-pwa/local-storage';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { HeadersGenerator } from './headersGenerator.service';

@Injectable({
  providedIn: 'root'
})
export class OrganizationsServiceService {

  constructor(private http : HttpClient,
              private Router : Router,
              private storage : StorageMap,
              private snackBar : MatSnackBar,
              private headersGenrator : HeadersGenerator) { }


  getOrganizations () : void {
    this.http
        .get(`${environment.baseUrl}/Organization`,{headers: this.headersGenrator.generateAuthHeader()})
        .subscribe((organizations : any[]) => this.storage.set('organizations',organizations).subscribe(() => {this.snackBar.open('Se han recuperado las organizaciones.','ENTENDIDO',{duration: 3000})}),
        error => this.snackBar.open('Ha ocurrido un error.','ENTENDIDO',{duration: 3000}));//TODO: defina an interface for Organization's model.
  }

  getOrganizationsLocal () : Observable<any> {
    return this.storage.watch('organizations');
  }

}
