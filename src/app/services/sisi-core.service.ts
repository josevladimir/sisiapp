import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FormControl } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class SisiCoreService {

  URL : string = 'http://localhost:3000';

  headers : HttpHeaders = new HttpHeaders({'Content-Type':'application/json'})

  constructor(private _httpClient : HttpClient) {  }

  /*Login*/
  authenticate (body) : Observable<any> {
    return this._httpClient.post(`${this.URL}/Users/login`,body,{headers: this.headers});
  }

  /*Financiadores*/
  getFunders () : Observable<any> {
    return this._httpClient.get(`${this.URL}/Funder/`);
  }
  getFundersOff () :any[] {
    if(localStorage.getItem('funders')) return JSON.parse(localStorage.getItem('funders'));
    return [];
  }
  getFunder (id : string) : any {
    let funders : any[] = JSON.parse(localStorage.getItem('funders'));
    return funders.filter(funder => funder._id == id)[0];
  }
  createFunder (funder : any) : Observable<any> {
    return this._httpClient.post(`${this.URL}/Funder/`,funder,{headers: this.headers});
  }
  updateFunder (funder : any,id : string) : Observable<any> {
    return this._httpClient.put(`${this.URL}/Funder/${id}`,funder,{headers: this.headers});
  }

  /*Organizaciones*/
  getOrganizations () : Observable<any> {
    return this._httpClient.get(`${this.URL}/Organization/`);
  }
  getOrganizationsOff () :any[] {
    if(localStorage.getItem('organizations')) return JSON.parse(localStorage.getItem('organizations'));
    return [];
  }
  getOrganization (id : string) : any {
    let organizations : any[] = JSON.parse(localStorage.getItem('organizations'));
    return organizations.filter(organization => organization._id == id)[0];
  }
  createOrganization (organization : any) : Observable<any> {
    return this._httpClient.post(`${this.URL}/Organization/`,organization,{headers: this.headers});
  }
  updateOrganization (organization : any,id : string) : Observable<any> {
    return this._httpClient.put(`${this.URL}/Organization/${id}`,organization,{headers: this.headers});
  }

  /*Proyectos*/
  getProjects () : Observable<any> {
    return this._httpClient.get(`${this.URL}/Project/`);
  }

  /*Indicadores*/
  getIndicators () : Observable<any> {
    return this._httpClient.get(`${this.URL}/Indicator/`);
  }
  getIndicatorsOff () :any[] {
    if(localStorage.getItem('indicators')) return JSON.parse(localStorage.getItem('indicators'));
    return [];
  }
  getIndicator (id : string) : any {
    let indicators : any[] = JSON.parse(localStorage.getItem('indicators'));
    return indicators.filter(indicator => indicator._id == id)[0];
  }
  createIndicator (indicator : any) : Observable<any> {
    return this._httpClient.post(`${this.URL}/Indicator/`,indicator,{headers: this.headers});
  }
  updateIndicator (indicator : any,id : string) : Observable<any> {
    return this._httpClient.put(`${this.URL}/Indicator/${id}`,indicator,{headers: this.headers});
  }

  /*Validaciones*/
  existFunder( control: FormControl ) : {[s:string]:boolean} {
    if(localStorage.getItem('funders')) {
      let funders = JSON.parse(localStorage.getItem('funders'));
      let result = funders.filter(funder => funder.name.toLowerCase() == control.value.toLowerCase());
      if(result.length) return {exist: true};
    }
    return null;
  }
  existOrganization( control: FormControl ) : {[s:string]:boolean} {
    if(localStorage.getItem('organizations')) {
      let organizations = JSON.parse(localStorage.getItem('organizations'));
      let result = organizations.filter(organization => organization.name.toLowerCase() == control.value.toLowerCase());
      if(result.length) return {exist: true};
    }
    return null;
  }

}
