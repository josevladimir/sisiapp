import { createAction, props } from '@ngrx/store';

export const ACTIONS_KEYS = {
    ADD_GLOBAL_CONNECTION: '[Sockets] Nueva Conexión Global',
    NEW_NMSPC_CONNECTION: '[Sockets] Subscribir a Namespace'
}

export const addGlobalConnection = createAction(ACTIONS_KEYS.ADD_GLOBAL_CONNECTION, props<{connection : SocketIOClient.Socket}>());
export const newNamespaceConnection = createAction(ACTIONS_KEYS.NEW_NMSPC_CONNECTION, props<{namespace : NamespaceConnection}>());

export interface NamespaceConnection {
    connection: SocketIOClient.Socket;
    path: string;
}
