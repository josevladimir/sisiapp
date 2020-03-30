import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Store } from '@ngrx/store';
import { getUserToken } from '../reducers/selectors/session.selector';
import { State } from '../reducers';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { StorageMap } from '@ngx-pwa/local-storage';

@Injectable({
  providedIn: 'root'
})
export class FundersServiceService {

  userToken : string;
  
  constructor(private http : HttpClient,
    private Router : Router,
    private storage : StorageMap,
    private snackBar : MatSnackBar,
    private store : Store<State>) {
      
      this.store.select(getUserToken).subscribe((token : string) => this.userToken = token);
      
    }
    
    getFunders () : void{
      this.http
      .get<Funder[]>(`${environment.baseUrl}/Funder/`,{headers: this.generateAuthHeader()})
      .subscribe((funders : Funder[]) => this.storage.set('funders',funders).subscribe(() => this.snackBar.open('Listo.','ENTENDIDO',{duration: 3000})),
      error => this.snackBar.open('Ha ocurrido un error al obtener los financiadores.','ENTENDIDO',{duration: 3000}));
    }
    
    /*getFundersLocal () : Observable<Funder[]> {
      this.storage.watch()
    }
    */
    getFunder (id : string) : any {
      let funders : any[] = JSON.parse(localStorage.getItem('funders'));
      return funders.filter(funder => funder._id == id)[0];
    }
    
    createFunder (funder : any) : Observable<any> {
      return this.http.post(`${environment.baseUrl}/Funder/`,funder,{headers: this.generateJSONHeader()});
    }
    
    updateFunder (funder : any, id : string) : Observable<any> {
      return this.http.put(`${environment.baseUrl}/Funder/${id}`,funder,{headers: this.generateJSONHeader()});
    }
    
    updateFundersList (redirect) {
      this.http.get(`${environment.baseUrl}/Funder/`,{headers: this.generateJSONHeader()}).subscribe(
        result => {
          if(result['message'] == 'OK'){
            localStorage.setItem('funders',JSON.stringify(result['funders']));
          }else{
            localStorage.setItem('funders','[]');
          }
          if(redirect) this.Router.navigate(['/funders']);
        },
        error => this.snackBar.open('Ocurrió un error al actualizar los financiadores.','ENTENDIDO',{duration: 3000}));
      }
      
      deleteFunder (id : string) : Observable <any> {
        return this.http.delete(`${environment.baseUrl}/Funder/${id}`,{headers: this.generateAuthHeader()});
      }

      generateAuthHeader = () : HttpHeaders => new HttpHeaders({'Authorization': `Bearer ${this.userToken}`});
      generateJSONHeader = () : HttpHeaders => new HttpHeaders({'Authorization': `Bearer ${this.userToken}`, 'Content-Type': 'application/json'});
      
    }
    
    export interface Funder{
      name: string;
      website: string | null;
      place: string;
      coop_date: string;
      projects: any[]; //TODO: Make Project Interface
      created_by: any; //TODO: Make user simplified Interface
      created_at: Date;
      last_update: Date;
    }
    
   