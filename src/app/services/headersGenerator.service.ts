import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { State } from '../reducers';
import { getUserToken } from '../reducers/selectors/session.selector';


@Injectable({
    providedIn: 'root'
  })
  export class HeadersGenerator {

    token : string;

    constructor(private store : Store<State>){
        this.store.select(getUserToken).subscribe((token : string) => this.token = token)
    }
  
    generateAuthHeader = () : HttpHeaders => {
        return new HttpHeaders({'Authorization': `Bearer ${this.token}`})
    }

    generateJsonHeader = () : HttpHeaders => {
        return new HttpHeaders({'Authorization': `Bearer ${this.token}`, 'Content-Type': 'application/json'});
    }
}

