import { Component } from '@angular/core';
import { IndicatorsServiceService } from '../../../../services/indicators-service.service';

@Component({
  selector: 'app-indicators',
  templateUrl: './indicators.component.html'
})
export class IndicatorsComponent{

  Indicators : any[] = [];

  search_term : string = '';

  filteredList : any[] = [];

  userRole : string = localStorage.getItem('userRole');

  constructor(private indicatorsService : IndicatorsServiceService) {
    this.indicatorsService.getIndicatorsLocal().subscribe((data => {
      this.Indicators = data.indicators;
      this.filteredList = data.indicators;
    }));
  }

  filter(){
    if(!this.search_term.trim()) this.filteredList = this.Indicators;
    this.filteredList = this.Indicators.filter(indicator => indicator.name.toLowerCase().includes(this.search_term.trim().toLowerCase()));
  }

}
