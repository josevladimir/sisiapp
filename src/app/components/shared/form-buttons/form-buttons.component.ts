import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Location } from '@angular/common';

@Component({
  selector: 'app-form-buttons',
  templateUrl: './form-buttons.component.html'
})
export class FormButtonsComponent {

  @Input() formGroup : FormGroup;

  constructor(private _location : Location) { }

  cancel(){
    if(confirm('Todos los cambios no guardados se perderán.\n\n¿Desea continuar?')) this._location.back();
  }

}
