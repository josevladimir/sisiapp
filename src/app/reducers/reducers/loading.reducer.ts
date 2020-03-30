import { ACTIONS_KEYS } from '../actions/loading.actions';

export const initialState : LoadingState = {
    isWorking: false,
    loadingMessage: ''
}

export interface LoadingState{
    isWorking: boolean;
    loadingMessage: string;
}

export function reducer (state : LoadingState = initialState, action) : LoadingState {
    switch(action.type){
        case ACTIONS_KEYS.INIT_LOADING: return {...state, isWorking: true, loadingMessage: action.message ? action.message : state.loadingMessage};

        case ACTIONS_KEYS.STOP_LOADING: return {...state, isWorking: false};

        case ACTIONS_KEYS.CHANGE_MESSAGE: return {...state, loadingMessage: action.message};

        default: return state;
    }
}