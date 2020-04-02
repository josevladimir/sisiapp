import { Component } from '@angular/core';
import { ProjectsServiceService } from '../../../../services/projects-service.service';
import { isCoordinator, isAdmin } from '../../../../reducers/selectors/session.selector';
import { Store } from '@ngrx/store';
import { State } from '../../../../reducers/index';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html'
})
export class ProjectsComponent{

  //userRole : string = localStorage.getItem('userRole');
  
  Authorization : any = {
    isAdmin: false,
    isCoordinator: false
  }

  projects : any[] = [];

  List : any[] = [];

  constructor(private projectsService : ProjectsServiceService,
              private store : Store<State>) { 

    this.Authorization = {
      isAdmin: this.store.select(isAdmin),
      isCoordinator: this.store.select(isCoordinator)
    }
    
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
    this.projectsService.getProjectsLocal().subscribe((projects : any[]) => {
      this.projects = projects;
      this.List = projects;
    });
  }

  updateList(event){
    this.List = event;
  }

}
