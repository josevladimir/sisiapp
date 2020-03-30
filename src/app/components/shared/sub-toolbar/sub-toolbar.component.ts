import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-sub-toolbar',
  templateUrl: './sub-toolbar.component.html',
  styles: ['mat-toolbar{background: #bbb;}']
})
export class SubToolbarComponent implements OnInit{

  @Input() title : string;
  @Input() backButton : boolean;
  @Input() addButton : boolean;
  @Input() editButton;
  @Input() buttons : ToolbarButton[];
  @Input() importantBack : boolean;

  @Output() editClick : EventEmitter<any> = new EventEmitter();

  personalizedButtons : ToolbarButton[];

  constructor(private _location : Location){
  }
  
  back(){
    if(this.importantBack){
      if(confirm('Todos los cambios no guardados se perderán.\n\n¿Desea continuar?')) this._location.back();
    }else this._location.back();
  }
  
  edit(){
    this.editClick.emit();
  }
  
  ngOnInit(): void {

    if(this.buttons && this.buttons.length) this.personalizedButtons = this.buttons;
    else this.personalizedButtons = [];
  }
}

 export interface ToolbarButton {
  hasIcon: boolean,
  message: string,
  handler: () => void,
  icon: string
}
