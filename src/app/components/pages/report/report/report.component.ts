import { Component } from '@angular/core';
import { ProjectsServiceService } from '../../../../services/projects-service.service';
import { IndicatorsServiceService } from '../../../../services/indicators-service.service';
import { environment } from '../../../../../environments/environment';
import { FichasServiceService } from '../../../../services/fichas-service.service';
import { Store } from '@ngrx/store';
import { State } from 'src/app/reducers';
import { initLoading, stopLoading } from '../../../../reducers/actions/loading.actions';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html'
})
export class ReportComponent {

  assetsUrl : string = environment.assetsUrl;

  Project : any;
  Projects : any[] = [];
  Indicator : any;
  IndicatorSchema: any;
  Indicators : any[];
  AvailablePeriods : any[];

  selectedProject : string;
  selectedIndicator : string;
  selectedPeriod : string;

  PeriodSelectAvailable : boolean;

  Status : string = 'none';

  Schema : any;
  Period : any;

  ReportSchema : any;

  SchemaTable : any;
  ParametersTable : any[];
  IndicatorTable : any[];

  Parameters : any[];

  ChartData : any[];

  FichasList : any[];

  constructor(private _projectsService : ProjectsServiceService,
              private _fichaService : FichasServiceService,
              private store : Store<State>) {
    this._projectsService.getProjectsLocal().subscribe(projects => this.Projects = projects);
  }

  onProjectSelected : (seleccion : string) => void = (seleccion) => this.Project = this.Projects.filter(project => project._id == seleccion)[0];

  onIndicatorSelected(seleccion){
    this.PeriodSelectAvailable = false;
    //this.Indicator = this.Indicators.filter(indicator => indicator._id == seleccion)[0];

    this.AvailablePeriods = [];

    this.store.dispatch(initLoading({message: 'Cargando...'}));
    console.log(this.Project._id);
    this._fichaService
        .findFichas('of_project',this.Project._id)
        .subscribe(fichas => {
          this.FichasList = [];
          console.log(fichas);
          for(let i = 0; i < fichas.fichas.length; i++){
            if(fichas.fichas[i].indicator._id == seleccion){
              this.Indicator = fichas.fichas[i].indicator;
              delete fichas.fichas[i].indicator;
              this.FichasList.push(fichas.fichas[i]);
            }
          }


          this.FichasList.forEach(record => {
              this.AvailablePeriods.push({
                date: {
                  from: new Date(record.lapse.from),
                  to: new Date(record.lapse.to)
                },
                period: record.period
              });
            });
          //});

          this.selectedPeriod = null;
          this.ReportSchema = null;
          this.Status = 'none';
          
          this.PeriodSelectAvailable = true;
          this.store.dispatch(stopLoading());
        });

    /*for(let i = 0; i < this.Project.records.length; i++){

      /*this.Project.records.forEach(record => {
        if(this.Project.records[i].records.indicator == seleccion) {
          this.AvailablePeriods.push({
            date: {
              from: new Date(this.Project.records[i].period.date.from),
              to: new Date(this.Project.records[i].period.date.to)
            },
            period: this.Project.records[i].period.period
          });
        }
      //});

    }*/

  }

  onPeriodSelected(seleccion){
    /*TODO*/
    /**
     * Generar la información para la gráfica y la Tabla
     */

    
    if(seleccion == 'none') return null;
    
    for(let i = 0; i < this.AvailablePeriods.length; i++){
      console.log(this.AvailablePeriods[i].period, ' = ', seleccion);
      console.log(this.AvailablePeriods[i].period == seleccion);
      
      if(this.AvailablePeriods[i].period == seleccion){
        this.Period = this.AvailablePeriods[i];
        break;
      }
    }

    this.selectedPeriod = seleccion;

    
    /*this.generateTablesAndGraphicsData();

    this.Status = 'ready';*/ 
  } 
  
  generateReport(){
    this.Status = 'loading';
    this.Schema = this.FichasList.filter(record => record.period == this.selectedPeriod)[0];

    this.IndicatorSchema = this.Indicator;

    this.ReportSchema = this.Project.full_schema.filter(indicator => indicator.id == this.selectedIndicator)[0];
  }

  setReady(){
    this.Status = 'ready';
    console.log('eso');
  }
}
