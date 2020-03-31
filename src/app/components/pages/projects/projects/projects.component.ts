import { Component } from '@angular/core';
import { ProjectsServiceService } from '../../../../services/projects-service.service';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html'
})
export class ProjectsComponent{

  userRole : string = localStorage.getItem('userRole');
  
  projects : any[] = [];

  List : any[] = [];

  constructor (private projectsService : ProjectsServiceService) { 
    /*if(this.userRole == 'Financiador'){
      let normalProjects : any[] = this._service.getProjectsOff();
      let userProjects = JSON.parse(localStorage.getItem('user')).funder.projects;
      userProjects.forEach(project => {
        normalProjects.forEach(projectito => {
          if(projectito._id == project) this.projects.push(projectito);
        });
      });
    }else this.projects  = this._service.getProjectsOff();
    this.List = this.projects;*/
    this.projectsService.getProjectsLocal().subscribe((data : any) => {
      this.projects = data.projects;
      this.List = data.projects;
    });
  }

  updateList(event){
    this.List = event;
  }

}
