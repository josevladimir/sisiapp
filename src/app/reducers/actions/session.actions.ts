import { createAction, props } from '@ngrx/store';
import { SessionState } from '../reducers/session.reducer';

export const ACTIONS_KEYS = {
    AUTHENTICATE_KEY: '[Session] Autenticar en APP',
    LOAD_SESSION_KEY: '[Session] Cargar Sesión',
    LOGOUT_KEY: '[Session] Cerrar Sesión'
}

export const authenticate = createAction(ACTIONS_KEYS.AUTHENTICATE_KEY, props<{user : User}>());
export const loadSession = createAction(ACTIONS_KEYS.LOAD_SESSION_KEY, props<{session : SessionState}>());
export const logout = createAction(ACTIONS_KEYS.LOGOUT_KEY);

export interface AuthObject {
    username: string;
    password: string;
}

export interface User {
    _id: string;
    token: string;
    username: string;
    name: string;
    last_names: string;
    role: string;
    position: string;
    email: string;
    funder?: any;
    organizations?: any[];
}