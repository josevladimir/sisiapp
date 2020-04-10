import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProjectsServiceService } from '../../../../services/projects-service.service';
import { UsersServiceService } from '../../../../services/users-service.service';
import { IndicatorsServiceService } from '../../../../services/indicators-service.service';

@Component({
  selector: 'app-fichas',
  templateUrl: './fichas.component.html'
})
export class FichasComponent {

  ProjectRecords : any[];
  Projects : any[];
  ProjectName : string;
  selectedProject : string;

  selectedIndicator : string;
  Indicator : any;
  Indicators : any[];

  Organizations : any[]; 

  fieldsSchema : any[];

  UserResponsable : any;

  SchemaForm : any; 

  Period : Date = new Date();

  Status : string = 'none';

  constructor(public _projectsService : ProjectsServiceService,
              private _usersService : UsersServiceService,
              private _indicatorsService : IndicatorsServiceService,
              private _snackBar : MatSnackBar) { 
    
    this._projectsService.getProjectsLocal().subscribe(projects => this.Projects = projects);

  }

  formatProjects(project : any){
    return {
      name: project.name,
      _id: project._id
    }
  }

  generateSchema(){
    this.Status = 'loading';
    setTimeout(this.makeSchema.bind(this),1500);
  }

  makeSchema(){
    this.SchemaForm = null;
    if(this.ProjectRecords.length){
      let now = new Date();
      for(let i = 0; i < this.ProjectRecords.length; i++){
        let record_date = new Date(this.ProjectRecords[i].period);
        if(this.ProjectRecords[i].records.indicator == this.selectedIndicator && now.getMonth() == record_date.getMonth() && now.getFullYear() == record_date.getFullYear()){
          this.SchemaForm = this.ProjectRecords[i];
          let user : any;
          this._usersService.getUser().subscribe(users => {
            user = users.filter(user => user._id == this.SchemaForm.created_by)[0];
            this.UserResponsable = `${user.name} ${user.last_names} - ${user.position}`;
          });
          this.Status = 'already-filled';
          break;
        }else{
          this.Status = 'ready';
        }
      }
      if(this.Status == 'ready') this.makeSchemaForm.call(this);
    }else{
      this.makeSchemaForm.call(this);
      this.Status = 'ready';
    }
  }

  makeSchemaForm(){
    if(this.Indicator.type == 'Simple'){
      this.fieldsSchema = this.Indicator.parameters_schema;
    }else{
      this.fieldsSchema = this.Indicator.record_schema;
    }

    this.SchemaForm = {
      period: this.Period,
      records: {
        indicator: this.selectedIndicator,
        rows: []
      }
    }

    this.Organizations.forEach((organization,index) => {
      this.SchemaForm.records.rows.push({
        organization: organization._id,
        fields: []
      });
      this.fieldsSchema.forEach(field => {
        this.SchemaForm.records.rows[index].fields.push({
          name: field.name,
          value: ''
        });
      });
    });
  }

  onProjectSelect(ev){
    this._projectsService.getProjectsLocal().subscribe(projects => {
      let project = projects.filter(project => ev == project._id)[0];
      this.ProjectRecords = project.records;
      this.ProjectName = project.name;
      this.Indicators = project.indicators;
      this.Organizations = project.organizations;
      this.Status = 'none';
    });
  }

  onIndicatorSelect(ev){
    this.Indicator = this._indicatorsService.getIndicatorsLocal().subscribe(indicators => this.Indicator = indicators.filter(indicator => indicator._id == ev)[0]);
    this.Status = 'none';
  }

  cancel(){

  }

  save(){
    let isValid = true;
    for(let i = 0; i < this.SchemaForm.records.rows.length; i++){
      for(let j = 0; j < this.SchemaForm.records.rows[i].fields.length; j++){
        if(this.SchemaForm.records.rows[i].fields[j].value == ''){
          isValid = false;
        }
      }
    }
    if(false) return alert('La Ficha debe estar llena completamente.');
    else{
      this._projectsService.updateProject({records: this.SchemaForm},this.selectedProject).subscribe(
        result => {
          if(result.message == 'UPDATED'){
            //this._service.updateProjectsList(null);
            this.Status = 'none';

            this.ProjectRecords = result.project.records;

            this.selectedIndicator = null;
            this._snackBar.open('Ficha guardada exitosamente.','ENTENDIDO',{duration:3000});
          }
        },error => this._snackBar.open('Ha ocurrido un error.','ENTENDIDO',{duration: 3000})
      )
    }
  }

}
