import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HeadersGenerator } from './headersGenerator.service';
import { environment } from 'src/environments/environment';
import { StorageMap } from '@ngx-pwa/local-storage';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DocumentsServiceService {

  constructor(private http : HttpClient,
              private storage : StorageMap,
              private snackBar : MatSnackBar,
              private headersGenerator : HeadersGenerator) { }

  getDocuments () : void {
    this.http
        .get(`${environment.baseUrl}/files`,{headers: this.headersGenerator.generateAuthHeader()})
        .subscribe(documents => this.storage.set('documents',documents).subscribe(() => this.snackBar.open('Se han recuperado los archivos.','ENTENDIDO',{duration: 3000})),
        error => this.snackBar.open('Ha ocurrido un error.','ENTENDIDO',{duration: 3000}));
  }

  getDocumentsLocal () : Observable<any> {
    return this.storage.watch('documents');
  }

}
