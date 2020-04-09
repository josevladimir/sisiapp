import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Location } from '@angular/common';
import { Store } from '@ngrx/store';
import { State } from '../../../reducers/index';
import { editModeSetDisabled } from '../../../reducers/actions/general.actions';

@Component({
  selector: 'app-form-buttons',
  templateUrl: './form-buttons.component.html'
})
export class FormButtonsComponent {

  @Input() formGroup : FormGroup;
  @Input() isEditMode : boolean

  constructor(private _location : Location,
              private store : Store<State>) { }

  cancel(){
    if(confirm('Todos los cambios no guardados se perderán.\n\n¿Desea continuar?')) {
      if(this.isEditMode) return this.store.dispatch(editModeSetDisabled());
      this._location.back();
    }
  }

}
