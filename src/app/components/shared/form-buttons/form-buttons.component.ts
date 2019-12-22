import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-form-buttons',
  templateUrl: './form-buttons.component.html'
})
export class FormButtonsComponent {

  @Input() formGroup : FormGroup;

  constructor(private _Router : Router) { }

  cancel(){
    if(confirm('Todos los cambios no guardados se perderán.\n\n¿Desea continuar?')) this._Router.navigate([document.location.pathname.split('/')[1]]);
  }

}
