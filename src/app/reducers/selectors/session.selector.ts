import { SessionState } from '../reducers/session.reducer';
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { User } from '../actions/session.actions';

const getMainState = createFeatureSelector<SessionState>('session');

export const isAuth = createSelector(getMainState, (state : SessionState) : boolean => state.isAuth);
export const isAdmin = createSelector(getMainState, (state : SessionState) : boolean => state.isAdmin);
export const isFunder = createSelector(getMainState, (state : SessionState) : boolean => state.isFunder);
export const isCoordinator = createSelector(getMainState, (state : SessionState) : boolean => state.isCoordinator);

export const getUserData = createSelector(getMainState, (state : SessionState) : User => state.user);

export const getUserToken = createSelector(getUserData, (state : User) : string => state.token);