import { createAction, props } from '@ngrx/store';

export const ACTIONS_KEYS = {
    AUTHENTICATE_KEY: '[Session] Autenticar en APP'
}

export const authenticate = createAction(ACTIONS_KEYS.AUTHENTICATE_KEY, props<{user : User}>());

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
}