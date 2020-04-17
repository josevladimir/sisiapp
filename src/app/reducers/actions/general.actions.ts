import { createAction, props } from '@ngrx/store';
export const ACTIONS_KEY = {
    EDIT_MODE_ENABLED: '[EditMode] Activar modo de Edición',
    EDIT_MODE_DISABLED: '[EditMode] Desactivar modo de Edición',
    SET_LAPSE_TO_RECORD: '[Lapse Record] Setear los dias de lapso para subir las fichas'
}

export const setLapseToRecord = createAction(ACTIONS_KEY.SET_LAPSE_TO_RECORD, props<{numberOfDays: number}>());
export const editModeSetEnabled = createAction(ACTIONS_KEY.EDIT_MODE_ENABLED);
export const editModeSetDisabled = createAction(ACTIONS_KEY.EDIT_MODE_DISABLED);