import { createFeatureSelector, createSelector } from '@ngrx/store';
import { LoadingState } from '../reducers/loading.reducer';

export const getMainState = createFeatureSelector<LoadingState>('loading');

export const getLoaderState = createSelector(getMainState, (state : LoadingState) : boolean =>  state.isWorking);

export const getLoaderMessage = createSelector(getMainState, (state : LoadingState) : string => state.loadingMessage);
