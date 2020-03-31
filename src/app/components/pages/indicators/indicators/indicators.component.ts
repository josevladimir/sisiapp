import { Component, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { State } from 'src/app/reducers';
import { IndicatorsServiceService } from '../../../../services/indicators-service.service';
import * as fromSessionSelectors from '../../../../reducers/selectors/session.selector';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-indicators',
  templateUrl: './indicators.component.html'
})
export class IndicatorsComponent implements OnDestroy{

  Authorization : any = {
    isAdmin: false,
    isCoordinator: false
  }

  subscription : Subscription;

  Indicators : any[] = [];

  search_term : string = '';

  filteredList : any[] = [];

  constructor(private indicatorsService : IndicatorsServiceService,
              private store : Store<State>) {
    
    this.Authorization = {
      isAdmin: this.store.select(fromSessionSelectors.isAdmin),
      isCoordinator: this.store.select(fromSessionSelectors.isCoordinator)
    }
    
    this.subscription = this.indicatorsService.getIndicatorsLocal().subscribe(indicators => {
      this.Indicators = indicators;
      this.filteredList = indicators; 
    });
  }

  filter(){
    if(!this.search_term.trim()) this.filteredList = this.Indicators;
    this.filteredList = this.Indicators.filter(indicator => indicator.name.toLowerCase().includes(this.search_term.trim().toLowerCase()));
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.subscription.unsubscribe();
  }

}
