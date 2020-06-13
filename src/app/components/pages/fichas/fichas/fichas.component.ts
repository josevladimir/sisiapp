import { Store } from '@ngrx/store';
import { State } from '../../../../reducers/index';
import * as moment from 'moment';
import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SocketioService } from '../../../../services/socketio.service';
import { ProjectsServiceService } from '../../../../services/projects-service.service';
import { IndicatorsServiceService } from '../../../../services/indicators-service.service';
import { initLoading, stopLoading } from '../../../../reducers/actions/loading.actions';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { getDaysOfLapse } from '../../../../reducers/selectors/general.selector';
import { environment } from '../../../../../environments/environment';
import { FichasServiceService } from '../../../../services/fichas-service.service';
import { getUserData } from '../../../../reducers/selectors/session.selector';

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

  Schema : any;
  SchemaForm : FormGroup; 

  Period : any;

  periodText : string;

  Status : string = 'none';

  daysOfLapse : number;

  User : any;

  constructor(public _projectsService : ProjectsServiceService,
              private fichaService : FichasServiceService,
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
      schema: project.full_schema
    }
  }

  generateSchema(){
    this.Status = 'loading';
    this.makeSchema();
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
    this.fichaService
        .existFicha(this.Project._id,this.Indicator._id,this.Period.period)
        .subscribe((ficha : any) => {
          console.log(ficha);
          if(ficha.exist){
            console.log('existe');
            this._store.select(getUserData).subscribe(user => {
              this.Schema = ficha.ficha;
              this.User = {organizations: user.organizations ? user.organizations : null,role: user.role};
              this.makeSchemaForm(ficha.exist);
            }); 
          }else{
            console.log('no existe');
            this._store.select(getUserData).subscribe(user => {
              this.User = {organizations: user.organizations ? user.organizations : null,role: user.role};
              this.makeSchemaForm(ficha.exist);
            }); 
          }
        });
  }

  makeSchemaForm(exist : boolean){
    if(this.Indicator.type == 'Simple'){
      if(this.Indicator.parameters_schema[0].haveSchema) this.fieldsSchema = this.Indicator.parameters_schema[0].record_schema;
      else this.fieldsSchema = this.Indicator.parameters_schema;
    }else if(this.Indicator.type == 'Grupo'){
      this.fieldsSchema = this.Indicator.parameters_schema;
    }else if(this.Indicator.type == 'Compuesto'){
      this.fieldsSchema = this.Indicator.record_schema;
    }
    this.SchemaForm = new FormGroup({
      lapse: new FormGroup({
        to: new FormControl(this.Period.date.to),
        from: new FormControl(this.Period.date.from)
      }),
      period: new FormControl(this.Period.period),
      indicator: new FormControl(this.selectedIndicator),
      rows: new FormArray([])
    });

    this.Project.organizations.forEach((organization,i) => {
      let fieldsCtrl : FormGroup = new FormGroup({
        organization: new FormControl(organization._id),
        name: new FormControl(organization.name),
        fields: new FormArray([])
      });
      this.fieldsSchema.forEach((field,j) => {
      if(exist) (<FormArray> fieldsCtrl.get('fields')).push(new FormGroup({
          name: new FormControl(field.name),
          value: new FormControl(this.Schema.rows[i].fields[j].value,Validators.required),
          unit: new FormControl(field.unit)
        }));
      else (<FormArray> fieldsCtrl.get('fields')).push(new FormGroup({
          name: new FormControl(field.name),
          value: new FormControl('',Validators.required),
          unit: new FormControl(field.unit)
        }));
      });
      (<FormArray> this.SchemaForm.get('rows')).push(fieldsCtrl);
    });
    if(exist) return this.Status = 'already-filled';
    return this.Status = 'ready';

  }

  verifyOrganization(id) : boolean {
    if(this.User.role == 'Técnico'){
      let allowed : boolean = false;
      for(let i = 0; i < this.User.organizations.length; i++){
        if(id == this.User.organizations[i].id){
          allowed = true;
          break;
        }
      }
      return allowed;
    }else return true;
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
    if(confirm('¿Seguro que ya desea guardar la ficha?')){
      this._store.dispatch(initLoading({message: 'Guardando Ficha...'}));
      this.fichaService.saveFicha(this.SchemaForm.value).subscribe(
        result => {
          this.Status = 'none';
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
}
