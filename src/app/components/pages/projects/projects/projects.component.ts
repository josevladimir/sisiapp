import { Component } from '@angular/core';
import { SisiCoreService } from '../../../../services/sisi-core.service';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html'
})
export class ProjectsComponent{

  userRole : string = localStorage.getItem('userRole');
  
  projects : any[] = [];

  constructor (private _service : SisiCoreService) { 
    if(this.userRole == 'Financiador'){
      let normalProjects : any[] = this._service.getProjectsOff();
      let userProjects = JSON.parse(localStorage.getItem('user')).funder.projects;
      userProjects.forEach(project => {
        normalProjects.forEach(projectito => {
          if(projectito._id == project) this.projects.push(projectito);
        });
      });
    }else this.projects  = this._service.getProjectsOff();
  }

}
