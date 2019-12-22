import { Component } from '@angular/core';
import { SisiCoreService } from '../../../../services/sisi-core.service';

@Component({
  selector: 'app-indicators',
  templateUrl: './indicators.component.html'
})
export class IndicatorsComponent{

  Indicators : any[] = this._service.getIndicatorsOff();

  constructor(private _service : SisiCoreService) { 

  }

}
