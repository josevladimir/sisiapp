import * as fromGeneral from './reducers/general.reducer';
import * as fromLoading from './reducers/loading.reducer';
import * as fromSession from './reducers/session.reducer';
import * as fromSockets from './reducers/sockets.reducer';

import {
  ActionReducerMap,
} from '@ngrx/store';

export interface State {
  general: fromGeneral.GeneralState;
  loading: fromLoading.LoadingState;
  session: fromSession.SessionState;
  sockets: fromSockets.SocketState;
}

export const reducers : ActionReducerMap<State> = {
  general: fromGeneral.reducer,
  loading: fromLoading.reducer,
  session: fromSession.reducer,
  sockets: fromSockets.reducer
}