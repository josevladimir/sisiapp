import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProjectsServiceService } from '../../../../services/projects-service.service';
import { UsersServiceService } from '../../../../services/users-service.service';
import { IndicatorsServiceService } from '../../../../services/indicators-service.service';
import { Store } from '@ngrx/store';
import { State } from '../../../../reducers/index';
import { initLoading, stopLoading } from '../../../../reducers/actions/loading.actions';
import { SocketioService } from '../../../../services/socketio.service';

@Component({
  selector: 'app-fichas',
  templateUrl: './fichas.component.html'
})
export class FichasComponent {

  Projects : any[];
  Project : any;
  selectedProject : string;

  selectedIndicator : string;
  Indicator : any;
  Indicators : any[] = [];

  fieldsSchema : any[];

  UserResponsable : any;

  SchemaForm : any; 

  Period : Date = new Date();

  Status : string = 'none';

  constructor(public _projectsService : ProjectsServiceService,
              private _usersService : UsersServiceService,
              private _indicatorsService : IndicatorsServiceService,
              private _store : Store<State>,
              private _sockets : SocketioService,
              private _snackBar : MatSnackBar) { 
    
    this._projectsService.getProjectsLocal().subscribe(projects => this.Projects = projects);
    this._indicatorsService.getIndicatorsLocal().subscribe(indicators => this.Indicators = indicators);

  }

  formatProjects(project : any){
    return {
      name: project.name,
      _id: project._id,
      indicators: project.indicators,
      organizations: project.organizations,
      records: project.records
    }
  }

  generateSchema(){
    this.Status = 'loading';
    setTimeout(this.makeSchema.bind(this),1500);
  }

  makeSchema(){
    console.log(this.Projects,this.Indicators);
    this.SchemaForm = null;
    if(this.Project.records.length){
      let now = new Date();
      for(let i = 0; i < this.Project.records.length; i++){
        let record_date = new Date(this.Project.records[i].period);
        if(this.Project.records[i].records.indicator == this.selectedIndicator && now.getMonth() == record_date.getMonth() && now.getFullYear() == record_date.getFullYear()){
          this.SchemaForm = this.Project.records[i];
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
    console.log('Indicador',this.Indicator);
    if(this.Indicator.type == 'Simple'){
      this.fieldsSchema = this.Indicator.parameters_schema;
    }else{
      this.fieldsSchema = this.Indicator.record_schema;
    }

    console.log(this);

    this.SchemaForm = new FormGroup({
      period: new FormControl(this.Period),
      records: new FormGroup({
        indicator: new FormControl(this.selectedIndicator),
        rows: new FormArray([])
      })
    });

    this.Project.organizations.forEach((organization,index) => {
      let fieldsCtrl : FormGroup = new FormGroup({
        organization: new FormControl(organization._id),
        name: new FormControl(organization.name),
        fields: new FormArray([])
      });
      this.fieldsSchema.forEach(field => {
        (<FormArray> fieldsCtrl.get('fields')).push(new FormGroup({
          name: new FormControl(field.name),
          value: new FormControl('',Validators.required)
        }));
      });
      (<FormArray> this.SchemaForm.get('records').get('rows')).push(fieldsCtrl);
    });

  }

  onProjectSelect(ev){
      this.Project = this.formatProjects(this.Projects.filter(project => ev == project._id)[0]);
      this.Status = 'none';
  }

  onIndicatorSelect(ev){
    this.Indicator = this.Indicators.filter(indicator => indicator._id == ev)[0] ;
    this.Status = 'none';
  }

  cancel(){

  }

  save(){
    console.log(this.SchemaForm.value);
    this._store.dispatch(initLoading({message: 'Guardando Ficha...'}));
    this._projectsService.updateProject({records: this.SchemaForm.value},this.selectedProject).subscribe(
      result => {
        this._projectsService.updateProjectOnStorage(true);
        this._sockets.emit('projectWasUpdated',{});
        this.Status = 'none';

        this.Project.records = result.project.records;

        this.selectedIndicator = null;
        this._store.dispatch(stopLoading());
        this._snackBar.open('Ficha guardada exitosamente.','ENTENDIDO',{duration:3000});
      },error =>{
        this._store.dispatch(stopLoading());
        this._snackBar.open('Ha ocurrido un error.','ENTENDIDO',{duration: 3000});
      }
    )
  }

  getMonth(month : number){
    let period : string;
    switch(month){
      case 0:
        period = 'Enero'
        break;
      case 1:
        period = 'Febrero'
        break;
      case 2:
        period = 'Marzo'
        break;
      case 3:
        period = 'Abril'
        break;
      case 4:
        period = 'Mayo'
        break;
      case 5:
        period = 'Junio'
        break;
      case 6:
        period = 'Julio'
        break;
      case 7:
        period = 'Agosto'
        break;
      case 8:
        period = 'Septiembre'
        break;
      case 9:
        period = 'Octubre'
        break;
      case 10:
        period = 'Noviembre'
        break;
      case 11:
        period = 'Diciembre'
        break;
      default:
        break;
    }

    return period;
  }

}
