import { GeneralState } from '../reducers/general.reducer';
import { createFeatureSelector, createSelector } from '@ngrx/store';

export const getGeneralState = createFeatureSelector<GeneralState>('general');

export const isEditMode = createSelector(getGeneralState,(state : GeneralState) : boolean => state.editMode);