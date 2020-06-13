import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HeadersGenerator } from './headersGenerator.service';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FichasServiceService {

  constructor(private http : HttpClient,
              private headersGenerator : HeadersGenerator) { }

  getFichas() : Observable<any>{
    return this.http.get(`${environment.baseUrl}/Ficha`,{headers: this.headersGenerator.generateAuthHeader()});
  }

  findFichas(key : string, value : string) : Observable<any>{
    return this.http.get(`${environment.baseUrl}/Ficha/${key}/${value}`,{headers: this.headersGenerator.generateAuthHeader()});
  }

  existFicha(project : string, indicator : string, period : string) : Observable<any>{
    period = period.replace(/ /g,'-');
    return this.http.get(`${environment.baseUrl}/Ficha/if/${project}/${indicator}/${period}`,{headers: this.headersGenerator.generateAuthHeader()});
  }

  saveFicha(body : any) : Observable<any>{
    return this.http.post(`${environment.baseUrl}/Ficha`,body,{headers: this.headersGenerator.generateJsonHeader()});
  }

  updateFicha(id : string, body : any) : Observable<any>{
    return this.http.put(`${environment.baseUrl}/Ficha/${id}`,body,{headers: this.headersGenerator.generateJsonHeader()});
  }

  deleteFicha(id : string) : Observable<any>{
    return this.http.delete(`${environment.baseUrl}/Ficha/${id}`,{headers: this.headersGenerator.generateAuthHeader()});
  }

}
