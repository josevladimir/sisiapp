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
export class ProjectsServiceService {

  constructor(private http : HttpClient,
              private storage : StorageMap,
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
}
