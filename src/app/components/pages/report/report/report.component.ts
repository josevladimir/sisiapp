import { Component } from '@angular/core';
import { ProjectsServiceService } from '../../../../services/projects-service.service';
import { IndicatorsServiceService } from '../../../../services/indicators-service.service';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html'
})
export class ReportComponent {

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

  constructor(private _projectsService : ProjectsServiceService,
              private _indicatorsService : IndicatorsServiceService) {
    this._projectsService.getProjectsLocal().subscribe(projects => this.Projects = projects);
    this._indicatorsService.getIndicatorsLocal().subscribe(indicators => this.Indicators = indicators);
  }

  onProjectSelected : (seleccion : string) => void = (seleccion) => this.Project = this.Projects.filter(project => project._id == seleccion)[0];

  onIndicatorSelected(seleccion){
    this.PeriodSelectAvailable = false;
    this.Indicator = this.Indicators.filter(indicator => indicator._id == seleccion)[0];

    this.AvailablePeriods = [];

    for(let i = 0; i < this.Project.records.length; i++){

      //this.Project.records.forEach(record => {
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

    }
    
    this.PeriodSelectAvailable = true;
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

    this.Status = 'loading';
    let recordsWithIndicator = this.Project.records.filter(record => record.records.indicator == this.selectedIndicator);
    this.Schema = recordsWithIndicator.filter(record => record.period.period == seleccion)[0];

    this.IndicatorSchema = this.Project.full_schema.filter(indicator => indicator.id == this.selectedIndicator)[0];

    this.ReportSchema = this.Project.full_schema.filter(indicator => indicator.id == this.selectedIndicator)[0];
    /*this.generateTablesAndGraphicsData();

    this.Status = 'ready';*/
  }  

  setReady(){
    this.Status = 'ready';
    console.log('eso');
  }
}
