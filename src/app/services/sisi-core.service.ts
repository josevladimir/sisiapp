import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class SisiCoreService {

  URL : string = 'http://localhost:3000';

  headers : HttpHeaders = new HttpHeaders({'Content-Type':'application/json','Authorization':`Bearer ${localStorage.token}`});
  authHeader : HttpHeaders = new HttpHeaders({'Authorization':`Bearer ${localStorage.token}`});

  constructor(private _httpClient : HttpClient,
              private _snackBar : MatSnackBar) {  }

  /*Login*/
  authenticate (body) : Observable<any> {
    return this._httpClient.post(`${this.URL}/User/login`,body,{headers: new HttpHeaders({'Content-Type':'application/json'})});
  }

  /*Financiadores*/
  getFunders () : Observable<any> {
    return this._httpClient.get(`${this.URL}/Funder/`,{headers: this.authHeader});
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
  updateFundersList () {
    this._httpClient.get(`${this.URL}/Funder/`,{headers: this.authHeader}).subscribe(
      result => {
        if(result['message'] == 'OK'){
          localStorage.setItem('funders',JSON.stringify(result['funders']));
          this._snackBar.open('Actulizado exitosamente.','ENTENDIDO',{duration: 3000});
        }
      },
      error => this._snackBar.open('Ocurrió un error al actualizar los financiadores.','ENTENDIDO',{duration: 3000}));
  }

  /*Organizaciones*/
  getOrganizations () : Observable<any> {
    return this._httpClient.get(`${this.URL}/Organization/`,{headers: this.authHeader});
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
  updateOrganizationsList () {
    this._httpClient.get(`${this.URL}/Organization/`,{headers: this.authHeader}).subscribe(
      result => {
        if(result['message'] == 'OK'){
          localStorage.setItem('organizations',JSON.stringify(result['organizations']));
          this._snackBar.open('Actulizado exitosamente.','ENTENDIDO',{duration: 3000});
        }
      },
      error => this._snackBar.open('Ocurrió un error al actualizar las organizaciones.','ENTENDIDO',{duration: 3000}));
  }

  /*Proyectos*/
  getProjects () : Observable<any> {
    return this._httpClient.get(`${this.URL}/Project/`,{headers: this.authHeader});
  }
  getProjectsOff () :any[] {
    if(localStorage.getItem('projects')) return JSON.parse(localStorage.getItem('projects'));
    return [];
  }
  getProject (id : string) : any {
    let proojects : any[] = JSON.parse(localStorage.getItem('projects'));
    return proojects.filter(project => project._id == id)[0];
  }
  createProject (project : any) : Observable<any> {
    return this._httpClient.post(`${this.URL}/Project/`,project,{headers: this.headers});
  }
  updateProjectsList () {
    this._httpClient.get(`${this.URL}/Project/`,{headers: this.authHeader}).subscribe(
      result => {
        if(result['message'] == 'OK'){
          localStorage.setItem('projects',JSON.stringify(result['projects']));
          this._snackBar.open('Actulizado exitosamente.','ENTENDIDO',{duration: 3000});
        }
      },
      error => this._snackBar.open('Ocurrió un error al actualizar los financiadores.','ENTENDIDO',{duration: 3000}));
  }
  /*Indicadores*/
  getIndicators () : Observable<any> {
    return this._httpClient.get(`${this.URL}/Indicator/`,{headers: this.authHeader});
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
  updateIndicatorsList () {
    this._httpClient.get(`${this.URL}/Indicator/`,{headers: this.authHeader}).subscribe(
      result => {
        if(result['message'] == 'OK'){
          localStorage.setItem('indicators',JSON.stringify(result['indicators']));
          this._snackBar.open('Actulizado exitosamente.','ENTENDIDO',{duration: 3000});
        }
      },
      error => this._snackBar.open('Ocurrió un error al actualizar los financiadores.','ENTENDIDO',{duration: 3000}));
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
  existProject( control: FormControl ) : {[s:string]:boolean} {
    if(localStorage.getItem('projects')) {
      let projects = JSON.parse(localStorage.getItem('projects'));
      let result = projects.filter(project => project.name.toLowerCase() == control.value.toLowerCase());
      if(result.length) return {exist: true};
    }
    return null;
  }
  isBlank( control: FormControl ) : {[s:string]:boolean} {
    if(!(control.value.trim()).length) return {isBlank: true};
    return null;
  }

  /*Documentos*/
  uploadBeneficiaries (form : any) : Observable<any>{
    return this._httpClient.post(`${this.URL}/files/beneficiaries`,form,{headers: this.authHeader});
  }
  uploadFile (form : any) : Observable<any>{
    return this._httpClient.post(`${this.URL}/files/upload`,form,{headers: this.authHeader});
  }
  getBeneficiariesFile (id : string) : Observable<any> {
    return this._httpClient.get(`${this.URL}/files/beneficiaries/${id}`,{headers: this.authHeader});
  }
  deleteFile (id : string) : Observable<any>{
    return this._httpClient.delete(`${this.URL}/files/${id}`,{headers: this.authHeader});
  }

}
