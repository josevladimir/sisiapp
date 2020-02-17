import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FormControl } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class SisiDatewarehouseService {

  URL : string = 'http://localhost:3000/Datawarehouse';

  headers : HttpHeaders = new HttpHeaders({'Content-Type':'application/json'})

  constructor(private _httpClient : HttpClient) {  }

  getPartnersHistoryData (id : string) : Observable<any> {
    return this._httpClient.get(`${this.URL}/partners/${id}`);
  }

}
