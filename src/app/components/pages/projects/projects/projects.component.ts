import { Component } from '@angular/core';
import { SisiCoreService } from '../../../../services/sisi-core.service';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html'
})
export class ProjectsComponent{

  projects : any[] = this._service.getProjectsOff();

  constructor (private _service : SisiCoreService) { 
    
  }

}
