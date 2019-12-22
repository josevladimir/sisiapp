import { Component, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'app-button-group',
  templateUrl: './button-group.component.html'
})
export class ButtonGroupComponent{

  @Output() save : EventEmitter<void> = new EventEmitter();
  @Output() cancel : EventEmitter<void> = new EventEmitter();

  @Input() formStatus : boolean;

  onSave(){
    this.save.emit();
  }

  onCancel(ev){
    ev.preventDefault();
    this.cancel.emit();
  }

}
