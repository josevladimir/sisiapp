import { ACTIONS_KEY } from '../actions/general.actions';

export interface GeneralState {
    editMode : boolean;
}

export const initialState : GeneralState = {
    editMode: false
}

export function reducer(state : GeneralState = initialState, action) : GeneralState{
    switch(action.type){
        case ACTIONS_KEY.EDIT_MODE_ENABLED: return {...state, editMode: true};

        case ACTIONS_KEY.EDIT_MODE_DISABLED: return {...state, editMode: false};

        default: return state;
    }
}