import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { editModeSetEnabled, editModeSetDisabled } from '../../../reducers/actions/general.actions';
import { Store } from '@ngrx/store';
import { State } from 'src/app/reducers';
import { isEditMode } from '../../../reducers/selectors/general.selector';

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
  @Input() deleteButton : () => void;

  personalizedButtons : ToolbarButton[];

  isEdit : boolean;

  constructor(private _location : Location,
              private _store : Store<State>){
    this._store.select(isEditMode).subscribe(value => this.isEdit = value);
  }
  
  back(){
    if(this.isEdit){
      if(confirm('Todos los cambios no guardados se perderán.\n\n¿Desea continuar?')) {
        this._store.dispatch(editModeSetDisabled());
        this._location.back();
      }
    }else this._location.back();
  }
  
  setEditMode = () => this._store.dispatch(editModeSetEnabled());
  
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
