import { Component } from '@angular/core';
import { SisiCoreService } from '../../../../services/sisi-core.service';

@Component({
  selector: 'app-indicators',
  templateUrl: './indicators.component.html'
})
export class IndicatorsComponent{

  Indicators : any[] = this._service.getIndicatorsOff();

  search_term : string = '';

  filteredList : any[] = this.Indicators;

  userRole : string = localStorage.getItem('userRole');

  constructor(private _service : SisiCoreService) { 

  }

  filter(){
    if(!this.search_term.trim()) this.filteredList = this.Indicators;
    this.filteredList = this.Indicators.filter(indicator => indicator.name.toLowerCase().includes(this.search_term.trim().toLowerCase()));
  }

}
