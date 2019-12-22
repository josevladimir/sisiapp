import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sub-toolbar',
  templateUrl: './sub-toolbar.component.html',
  styles: ['mat-toolbar{background: #bbb;}']
})
export class SubToolbarComponent{

  @Input() title : string;
  @Input() backButton : boolean;
  @Input() addButton : boolean;
  @Input() editButton : boolean;

  @Output() editClick : EventEmitter<any> = new EventEmitter();

  constructor(private _Router : Router){

  }

  back(){
    if(confirm('Todos los cambios no guardados se perderán.\n\n¿Desea continuar?')) this._Router.navigate([document.location.pathname.split('/')[1]])
  }

  edit(){
    this.editClick.emit();
  }

}
