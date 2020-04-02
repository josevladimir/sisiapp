import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { HeadersGenerator } from './headersGenerator.service';

@Injectable({
  providedIn: 'root'
})
export class SisiDatewarehouseService {

  constructor(private http : HttpClient,
              private headersGenerator : HeadersGenerator) {  }

  getPartnersHistoryData (id : string) : Observable<any> {
    return this.http.get(`${environment.baseUrl}/Datawarehouse/partners/${id}`,{headers: this.headersGenerator.generateAuthHeader()});
  }

}
