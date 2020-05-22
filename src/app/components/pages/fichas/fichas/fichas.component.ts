import { Store } from '@ngrx/store';
import { State } from '../../../../reducers/index';
import * as moment from 'moment';
import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SocketioService } from '../../../../services/socketio.service';
import { UsersServiceService } from '../../../../services/users-service.service';
import { ProjectsServiceService } from '../../../../services/projects-service.service';
import { IndicatorsServiceService } from '../../../../services/indicators-service.service';
import { initLoading, stopLoading } from '../../../../reducers/actions/loading.actions';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { getDaysOfLapse } from '../../../../reducers/selectors/general.selector';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-fichas',
  templateUrl: './fichas.component.html'
})
export class FichasComponent {

  assetsUrl : string = environment.assetsUrl;

  Projects : any[];
  Project : any;
  selectedProject : string;

  selectedIndicator : string;
  Indicator : any;
  Indicators : any[] = [];

  fieldsSchema : any[];

  UserResponsable : any;

  SchemaForm : any; 

  Period : any;

  periodText : string;

  Status : string = 'none';

  daysOfLapse : number;

  constructor(public _projectsService : ProjectsServiceService,
              private _usersService : UsersServiceService,
              private _indicatorsService : IndicatorsServiceService,
              private _store : Store<State>,
              private _sockets : SocketioService,
              private _snackBar : MatSnackBar) { 
    
    this._projectsService.getProjectsLocal().subscribe(projects => this.Projects = projects);
    this._indicatorsService.getIndicatorsLocal().subscribe(indicators => this.Indicators = indicators);
    this._store.select(getDaysOfLapse).subscribe((days : number) => this.daysOfLapse = days);

  }

  formatProjects(project : any){
    return {
      name: project.name,
      _id: project._id,
      duration: project.duration,
      start_date: project.start_date,
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
    if(moment(new Date()).isAfter(moment(moment(this.Project.start_date).add(this.Project.duration,'months').add(this.daysOfLapse,'days').format()))) return this.Status = 'outDateProject';
    this.SchemaForm = null;
    let startDate = moment(this.Project.start_date);
    let diferencia = moment(new Date()).diff(startDate,'months');
    if(this.Indicator.frequency == 'Mensual'){
      this.Period = {
        period: `${Math.trunc(diferencia)}º Mes`,
        date: {
          to: new Date(startDate.add(diferencia,'months').format()),
          from: new Date(startDate.subtract(1,'months').format())
        }
      }
      let fechaLimite = moment(startDate.add(diferencia,'months').add(this.daysOfLapse,'days').format());
      if(moment(new Date).isSameOrBefore(fechaLimite)) this.comprobarDisponibilidad();
      else{ 
        this.Status = 'noPeriod';
        this.periodText = 'Mensual';
      }
    }else{
      if(this.Indicator.frequency == 'Trimestral'){
        if(!(diferencia % 3)){
          this.Period = {
            period: `${Math.trunc(diferencia / 3)}º Trimestre`,
            date: {
              to: new Date(startDate.add(diferencia,'months').format()),
              from: new Date(startDate.subtract(3,'months').format())
            }
          }
          this.comprobarDentroDelPlazo(startDate,diferencia,'Trimestralmente');
        }else{
          this.Status = 'noPeriod';
          this.periodText = 'Trimestralmente';
        }
      }else if(this.Indicator.frequency == 'Semestral'){
        if(!(diferencia % 6)){
          this.Period = {
            period: `${Math.trunc(diferencia / 6)}º Semestre`,
            date: {
              to: new Date(startDate.add(diferencia,'months').format()),
              from: new Date(startDate.subtract(6,'months').format())
            }
          }
          this.comprobarDentroDelPlazo(startDate,diferencia,'Semestralmente');
        }else{
          this.Status = 'noPeriod';
          this.periodText = 'Semestralmente';
        }
      }else if(this.Indicator.frequency == 'Anual'){
        if(!(diferencia % 12)){
          this.Period = {
            period: `${diferencia / 12}º Año`,
            date: {
              to: new Date(startDate.add(diferencia,'months').format()),
              from: new Date(startDate.subtract(12,'months').format())
            }
          }
          this.comprobarDentroDelPlazo(startDate,diferencia,'Anualmente');
        }else{
          this.Status = 'noPeriod';
          this.periodText = 'Anualmente';   
        }
      }
    }
  }

  comprobarDentroDelPlazo(startDate, diferencia, periodText) : void{
    let fechaLimite = moment(startDate.add(diferencia,'months').add(this.daysOfLapse,'days').format());
    if(moment(new Date).isSameOrBefore(fechaLimite)) this.comprobarDisponibilidad();
    else{ 
      this.Status = 'noPeriod';
      this.periodText = periodText;
    }
  }

  comprobarDisponibilidad(){
    if(this.Project.records.length){
      for(let i = 0; i < this.Project.records.length; i++){
        if(this.Project.records[i].records.indicator == this.selectedIndicator && this.Period.period == this.Project.records[i].period.period){
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
    if(this.Indicator.type == 'Simple' || this.Indicator.type == 'Grupo'){
      this.fieldsSchema = this.Indicator.parameters_schema;
    }else if(this.Indicator.type == 'Compuesto'){
      this.fieldsSchema = this.Indicator.record_schema;
    }
    this.SchemaForm = new FormGroup({
      period: new FormGroup({
        date: new FormGroup({
          to: new FormControl(this.Period.date.to),
          from: new FormControl(this.Period.date.from)
        }),
        period: new FormControl(this.Period.period)
      }),
      records: new FormGroup({
        indicator: new FormControl(this.selectedIndicator),
        rows: new FormArray([])
      })
    });

    this.Project.organizations.forEach((organization) => {
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
    if(confirm('La Ficha no será guardada. Esta acción no se puede deshacer.\n\n¿Está seguro que desea cancelar?')){
      this.SchemaForm.reset();
      this.Status = 'none'
    }
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
}
