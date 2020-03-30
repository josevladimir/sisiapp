import { createAction, props } from '@ngrx/store';

export const ACTIONS_KEYS = {
    INIT_LOADING: '[Loading] Init',
    STOP_LOADING: '[Loading] Stop',
    CHANGE_MESSAGE: '[Loading] Change Message'
}

export const initLoading = createAction(ACTIONS_KEYS.INIT_LOADING, props<{message: string}>());

export const stopLoading = createAction(ACTIONS_KEYS.STOP_LOADING);

export const changeMessage = createAction(ACTIONS_KEYS.CHANGE_MESSAGE, props<{message: string}>());
