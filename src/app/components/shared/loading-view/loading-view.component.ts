import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { State } from '../../../reducers/index';
import { getLoaderMessage } from '../../../reducers/selectors/loading.selector';

@Component({
  selector: 'app-loading-view',
  templateUrl: './loading-view.component.html'
})
export class LoadingViewComponent{

  message$ : Observable<string>;

  constructor(private _store : Store<State>){
    this.message$ = this._store.select(getLoaderMessage);
  }

}
