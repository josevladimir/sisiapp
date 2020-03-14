import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class SisiCoreService {

  URL : string = 'http://64.227.8.162:3000';

  headers : HttpHeaders = new HttpHeaders({'Content-Type':'application/json','Authorization':`Bearer ${localStorage.token}`});
  authHeader : HttpHeaders = new HttpHeaders({'Authorization':`Bearer ${localStorage.token}`});

  constructor(private _httpClient : HttpClient,
              private _snackBar : MatSnackBar,
              private _Router : Router) {  }

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
  updateFundersList (redirect) {
    this._httpClient.get(`${this.URL}/Funder/`,{headers: this.authHeader}).subscribe(
      result => {
        if(result['message'] == 'OK'){
          localStorage.setItem('funders',JSON.stringify(result['funders']));
        }else{
          localStorage.setItem('funders','[]');
        }
        if(redirect) this._Router.navigate(['/funders']);
      },
      error => this._snackBar.open('Ocurrió un error al actualizar los financiadores.','ENTENDIDO',{duration: 3000}));
  }
  deleteFunder (id : string) : Observable <any> {
    return this._httpClient.delete(`${this.URL}/Funder/${id}`,{headers: this.authHeader});
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
  updateOrganizationsList (redirect) {
    this._httpClient.get(`${this.URL}/Organization/`,{headers: this.authHeader}).subscribe(
      result => {
        if(result['message'] == 'OK'){
          localStorage.setItem('organizations',JSON.stringify(result['organizations']));
        }else{
          localStorage.setItem('organizations','[]');
        }
        if(redirect) this._Router.navigate(['/organizations']);
      },
      error => this._snackBar.open('Ocurrió un error al actualizar las organizaciones.','ENTENDIDO',{duration: 3000}));
  }
  deleteOrganization (id : string) : Observable <any> {
    return this._httpClient.delete(`${this.URL}/Organization/${id}`,{headers: this.authHeader});
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
  updateProject (project: any, id : string) : Observable<any> {
    return this._httpClient.put(`${this.URL}/Project/${id}`,project,{headers: this.headers});
  }
  updateProjectsList (redirect) {
    this._httpClient.get(`${this.URL}/Project/`,{headers: this.authHeader}).subscribe(
      result => {
          localStorage.setItem('projects',JSON.stringify(result['projects']));
          if(redirect) this._Router.navigate(['/projects'])
      },
      error => this._snackBar.open('Ocurrió un error al actualizar los Proyectos.','ENTENDIDO',{duration: 3000}));
  }
  deleteProject (id : string) : Observable <any> {
    return this._httpClient.delete(`${this.URL}/Project/${id}`,{headers: this.authHeader});
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
  updateIndicatorsList (redirect) {
    this._httpClient.get(`${this.URL}/Indicator/`,{headers: this.authHeader}).subscribe(
      result => {
        if(result['message'] == 'OK'){
          localStorage.setItem('indicators',JSON.stringify(result['indicators']));
        }else{
          localStorage.setItem('indicators','[]');
        }
        if(redirect) this._Router.navigate(['/indicators']);
      },
      error => this._snackBar.open('Ocurrió un error al actualizar los Indicadores.','ENTENDIDO',{duration: 3000}));
  }
  deleteIndicator (id : string) : Observable <any> {
    return this._httpClient.delete(`${this.URL}/Indicator/${id}`,{headers: this.authHeader});
  }

  /*Validaciones*/
  existFunder( control: FormControl ) : {[s:string]:boolean} {
    if(!control.value) return null;
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
  existUser( control: FormControl ) : {[s:string]:boolean} {
    if(localStorage.getItem('users')) {
      let users = JSON.parse(localStorage.getItem('users'));
      let result = users.filter(user => user.username.toLowerCase() == control.value.toLowerCase());
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

  /*Users*/
  getUsers () : Observable<any> {
    return this._httpClient.get(`${this.URL}/User/`,{headers: this.authHeader});
  }
  getUsersOff () :any[] {
    if(localStorage.getItem('users')) return JSON.parse(localStorage.getItem('users'));
    return [];
  }
  getUser (id : string) : any {
    let users : any[] = JSON.parse(localStorage.getItem('users'));
    return users.filter(user => user._id == id)[0];
  }
  createUser (user : any) : Observable<any> {
    return this._httpClient.post(`${this.URL}/User/`,user,{headers: this.headers});
  }
  updateUser (user : any,id : string) : Observable<any> {
    return this._httpClient.put(`${this.URL}/User/${id}`,user,{headers: this.headers});
  }
  updateUsersList (redirect) {
    this._httpClient.get(`${this.URL}/User/`,{headers: this.authHeader}).subscribe(
      result => {
        if(result['message'] == 'OK'){
          localStorage.setItem('users',JSON.stringify(result['users']));
        }else localStorage.setItem('users','[]');
        if(redirect) this._Router.navigate(['/users']);
      },
      error => this._snackBar.open('Ocurrió un error al actualizar los usuarios.','ENTENDIDO',{duration: 3000}));
  }

  /*GlobalPreferences*/
  getPreferences () : Observable<any> {
    return this._httpClient.get(`${this.URL}/Preferences/`,{headers: this.authHeader});
  }
  getSectorsOff () : any[] {
    if(localStorage.getItem('sectors')) return JSON.parse(localStorage.getItem('sectors'));
    return [];
  }
  getTypesOff () : any[] {
    if(localStorage.getItem('types')) return JSON.parse(localStorage.getItem('types'));
    return [];
  }
  updatePreferencesList () {
    this._httpClient.get(`${this.URL}/Preferences/`,{headers: this.authHeader}).subscribe(
      result => {
        if(result['message'] == 'OK'){
          localStorage.setItem('sectors',JSON.stringify(result['preferences'].Organizations.Sectors));
          localStorage.setItem('types',JSON.stringify(result['preferences'].Organizations.Types));
        }else{
          localStorage.setItem('sectors','[]');
          localStorage.setItem('types','[]');
        }
      },
      error => this._snackBar.open('Ocurrió un error al actualizar los usuarios.','ENTENDIDO',{duration: 3000}));
  }
  addNewOrganizationPreference (preference : any) : Observable<any> {
    return this._httpClient.put(`${this.URL}/Preferences/`,preference,{headers: this.headers});
  }

  /*Extras*/
  getMonth(month : number){
    let period : string;
    switch(month){
      case 0:
        period = 'Enero'
        break;
      case 1:
        period = 'Febrero'
        break;
      case 2:
        period = 'Marzo'
        break;
      case 3:
        period = 'Abril'
        break;
      case 4:
        period = 'Mayo'
        break;
      case 5:
        period = 'Junio'
        break;
      case 6:
        period = 'Julio'
        break;
      case 7:
        period = 'Agosto'
        break;
      case 8:
        period = 'Septiembre'
        break;
      case 9:
        period = 'Octubre'
        break;
      case 10:
        period = 'Noviembre'
        break;
      case 11:
        period = 'Diciembre'
        break;
      default:
        break;
    }

    return period;
  }

}
