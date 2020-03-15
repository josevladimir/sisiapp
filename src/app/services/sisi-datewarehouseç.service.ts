import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SisiDatewarehouseService {

  URL : string = environment.baseUrl;

  headers : HttpHeaders = new HttpHeaders({'Authorization':`Bearer ${localStorage.token}`})

  constructor(private _httpClient : HttpClient) {  }

  getPartnersHistoryData (id : string) : Observable<any> {
    return this._httpClient.get(`${this.URL}/Datawarehouse/partners/${id}`,{headers: this.headers});
  }

}
