import { NamespaceConnection, addGlobalConnection, newNamespaceConnection, ACTIONS_KEYS } from '../actions/sockets.action';
import { Action, on, createReducer } from '@ngrx/store';

export interface SocketState {
    globalConnection: SocketIOClient.Socket;
    namespaces: NamespaceConnection[];
}

export const initialState : SocketState = {
    globalConnection: null,
    namespaces: []
}


export function reducer(state : SocketState = initialState, action) : SocketState{
    switch(action.type){
        case ACTIONS_KEYS.ADD_GLOBAL_CONNECTION: return {...state, globalConnection: action.connection};

        case ACTIONS_KEYS.NEW_NMSPC_CONNECTION: 
            let namespaces = state.namespaces;
            namespaces.push(action.namespace);
            return {...state, namespaces};

        default: return state;
    }
}