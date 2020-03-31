import { createAction } from '@ngrx/store';
export const ACTIONS_KEY = {
    EDIT_MODE_ENABLED: '[EditMode] Activar modo de Edición',
    EDIT_MODE_DISABLED: '[EditMode] Desactivar modo de Edición'
}

export const editModeSetEnabled = createAction(ACTIONS_KEY.EDIT_MODE_ENABLED);
export const editModeSetDisabled = createAction(ACTIONS_KEY.EDIT_MODE_DISABLED);