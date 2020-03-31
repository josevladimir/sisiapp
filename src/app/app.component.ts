import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { State } from './reducers/index';
import { Observable } from 'rxjs';
import { getLoaderState } from './reducers/selectors/loading.selector';
import { initLoading, stopLoading } from './reducers/actions/loading.actions';
import { SessionService } from './services/session.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})

export class AppComponent implements OnInit{
  
  title = 'SISI - CEFODI';
  
  //From Store
  isWorking : Observable<boolean>;

  constructor(private store : Store<State>,
              private sessionService : SessionService,
              private Router : Router){ 
    this.isWorking = this.store.select(getLoaderState);
  }
  
  ngOnInit(){
    this.store.dispatch(initLoading({message: 'Cargando...'}));
    this.sessionService.initSession().subscribe(session => {
      if(session) this.sessionService.loadSession(session);
      else {
        this.Router.navigateByUrl('/login');
        this.store.dispatch(stopLoading());
      }
    });
  }

}
