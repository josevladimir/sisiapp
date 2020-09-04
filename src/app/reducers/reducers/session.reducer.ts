import { User, ACTIONS_KEYS } from '../actions/session.actions';
export interface SessionState {
    isAuth: boolean;
    user: User | undefined;
    isAdmin: boolean;
    isFunder: boolean;
    isCoordinator: boolean;
}

export const initialState : SessionState = {
    isAuth: JSON.parse(localStorage.getItem('authenticated')) ? true : false,
    user: {
        _id: '',
        token: '',
        username: '',
        name: '',
        last_names: '',
        role: '',
        position: '',
        email: '',
        organizations: {}
    },
    isAdmin: false,
    isFunder: false,
    isCoordinator: false
}

export function reducer (state : SessionState = initialState, action) : SessionState{
    switch(action.type){
        case ACTIONS_KEYS.AUTHENTICATE_KEY: return ({
            ...state, user: action.user,
            isAuth: true,
            isCoordinator: action.user.role == 'Coordinador' ? true : false,
            isFunder: action.user.role == 'Financiador' ? true : false,
            isAdmin: action.user.role == 'Administrador' ? true : false
        });

        case ACTIONS_KEYS.LOGOUT_KEY: return initialState;

        case ACTIONS_KEYS.LOAD_SESSION_KEY: return action.session;

        default: return state;
    }
}
