import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { State } from '../reducers/index';
import { StorageMap } from '@ngx-pwa/local-storage';
import * as fromSession from '../reducers/selectors/session.selector';
import { SessionState } from '../reducers/reducers/session.reducer';
import { loadSession } from '../reducers/actions/session.actions';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  constructor(private store : Store<State>,
              private storage : StorageMap,
              private Router : Router) { }

  initSession() : Observable<any>{
    return this.storage.get('session');
  }

  saveSession(){
    this.store.select(fromSession.getMainState).subscribe((state : SessionState) => {
      this.storage.set('session', state).subscribe(() => {});
      console.log(state);
    });
  }

  loadSession(session : SessionState){
    this.store.dispatch(loadSession({session}));
    this.saveSession();
    this.Router.navigateByUrl('/main/dashboard');
  }

}
