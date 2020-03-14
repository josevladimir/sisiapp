import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FormControl } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class SisiDatewarehouseService {

  URL : string = 'http://64.227.8.162:3000/Datawarehouse';

  headers : HttpHeaders = new HttpHeaders({'Authorization':`Bearer ${localStorage.token}`})

  constructor(private _httpClient : HttpClient) {  }

  getPartnersHistoryData (id : string) : Observable<any> {
    return this._httpClient.get(`${this.URL}/partners/${id}`,{headers: this.headers});
  }

}
