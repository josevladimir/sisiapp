import { Injectable } from '@angular/core';
import { HeadersGenerator } from './headersGenerator.service';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StorageMap } from '@ngx-pwa/local-storage';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IndicatorsServiceService {

  constructor(private http : HttpClient,
              private storage : StorageMap,
              private snackBar : MatSnackBar,
              private headersGenerator : HeadersGenerator) { }

  getIndicators() : void {
    this.http
        .get<any[]>(`${environment.baseUrl}/Indicator`,{headers: this.headersGenerator.generateAuthHeader()})
        .subscribe((indicators : any[]) => this.storage.set('indicators', indicators).subscribe(() => this.snackBar.open('Se han recuperado los Financiadores.','ENTENDIDO',{duration: 3000})),
        error => this.snackBar.open('Ha ocurrido un error.','ENTENDIDO',{duration: 3000}));
  }

  getIndicatorsLocal() : Observable<any> {
    return this.storage.watch('indicators');
  }
}
