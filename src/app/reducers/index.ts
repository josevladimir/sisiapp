import * as fromLoading from './reducers/loading.reducer';
import * as fromSession from './reducers/session.reducer';

import { environment } from '../../environments/environment';
import { storeFreeze } from 'ngrx-store-freeze';
import {
  ActionReducerMap, MetaReducer,
} from '@ngrx/store';

export interface State {
  loading: fromLoading.LoadingState;
  session: fromSession.SessionState;
}

export const reducers : ActionReducerMap<State> = {
  loading: fromLoading.reducer,
  session: fromSession.reducer
}

export const metaReducers: MetaReducer<State>[] = !environment.production ? [storeFreeze]: [];