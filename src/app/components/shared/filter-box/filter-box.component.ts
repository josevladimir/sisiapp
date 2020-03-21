import { Component, Output, EventEmitter, Input, OnInit } from '@angular/core';
import { SisiCoreService } from '../../../services/sisi-core.service';

@Component({
  selector: 'app-filter-box',
  templateUrl: './filter-box.component.html'
})
export class FilterBoxComponent implements OnInit{

  @Input() list : any[];
  @Input() type : string;
  @Output() changeList : EventEmitter<any[]> = new EventEmitter(false);

  SearchParameters : any[] = [];
  ParameterSelected : string = 'name';
  SearchTerm : string = '';

  constructor(public _service : SisiCoreService) {

  }

  ngOnInit(){
    if(this.type == 'Organizations') this.SearchParameters = [
      {value: 'name', text: 'Nombre'},
      {value: 'type', text: 'Tipo'},
      {value: 'sector', text: 'Sector'},
      {value: 'canton', text: 'Cantón'},
      {value: 'legalized', text: 'Legalizada'}
    ];
    else this.SearchParameters = [
      {value: 'name', text: 'Nombre'},
      {value: 'ubication', text: 'Ubicación'},
      {value: 'date', text: 'Año de Inicio'}
    ];
  }

  onOptionSelect(event){
    if(this.type == 'Organizations'){
      if(this.ParameterSelected != 'name' && this.ParameterSelected != 'canton'){
        let result = this.list.filter(item => item[this.ParameterSelected] == event);
        this.changeList.emit(result);
      }
    }
  }

  SearchByTerm(){
    if(!this.SearchTerm || !this.SearchTerm.trim()) return this.changeList.emit(this.list);
    let result : any[];
    if(this.ParameterSelected == 'canton'){
      result = this.list.filter(item => (item.ubication.canton.trim().toLowerCase()).includes(this.SearchTerm.trim().toLowerCase()));
      return this.changeList.emit(result);
    }
    if(this.ParameterSelected == 'date'){
      result = this.list.filter(item => (new Date(item.start_date)).getFullYear().toString() == this.SearchTerm.trim());
      return this.changeList.emit(result);
    }
    result = this.list.filter(item => (item[this.ParameterSelected].trim().toLowerCase()).includes(this.SearchTerm.trim().toLowerCase()));
    this.changeList.emit(result);
  }

}
