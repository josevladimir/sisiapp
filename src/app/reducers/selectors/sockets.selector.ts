import { createFeatureSelector, createSelector } from '@ngrx/store';
import { SocketState } from '../reducers/sockets.reducer';
import { NamespaceConnection } from '../actions/sockets.action';

export const getSocketsState = createFeatureSelector<SocketState>('sockets');

export const getGlobalConnection = createSelector(getSocketsState,(state : SocketState) : SocketIOClient.Socket => state.globalConnection);
export const getNamespacesArray = createSelector(getSocketsState,(state : SocketState) : NamespaceConnection[] => state.namespaces);