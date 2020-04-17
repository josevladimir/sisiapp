import { ACTIONS_KEY } from '../actions/general.actions';

export interface GeneralState {
    editMode : boolean;
    lapseToRecord: number;
}

export const initialState : GeneralState = {
    editMode: false,
    lapseToRecord: 5
}

export function reducer(state : GeneralState = initialState, action) : GeneralState{
    switch(action.type){
        case ACTIONS_KEY.EDIT_MODE_ENABLED: return {...state, editMode: true};

        case ACTIONS_KEY.EDIT_MODE_DISABLED: return {...state, editMode: false};

        case ACTIONS_KEY.SET_LAPSE_TO_RECORD: return {...state, lapseToRecord: action.numberOfDays};

        default: return state;
    }
}