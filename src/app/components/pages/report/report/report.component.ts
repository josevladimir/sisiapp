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

  ReportSchema : any;

  SchemaTable : any;
  ParametersTable : any[];
  IndicatorTable : any[];

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

    this.Project.records.forEach(record => {
      if(record.records.indicator == seleccion) this.AvailablePeriods.push(new Date(record.period));
    });
    
    this.PeriodSelectAvailable = true;
  }

  onPeriodSelected(seleccion){
    /*TODO*/
    /**
     * Generar la información para la gráfica y la Tabla
     */
    
    if(seleccion == 'none') return null;

    this.Status = 'loading';
    let recordsWithIndicator = this.Project.records.filter(record => record.records.indicator == this.selectedIndicator);
    this.Schema = recordsWithIndicator.filter(record => new Date(record.period).toString() == new Date(seleccion).toString())[0];

    this.IndicatorSchema = this.Project.full_schema.filter(indicator => indicator.id == this.selectedIndicator)[0];

    this.ReportSchema = this.Project.full_schema.filter(indicator => indicator.id == this.selectedIndicator)[0];
    this.generateTablesAndGraphicsData();

    this.Status = 'ready';
  }

  generateTablesAndGraphicsData(){
    this.ParametersTable = [];
    this.IndicatorTable = [];
    this.ChartData = [];

    if(this.Indicator.type == 'Simple'){

    }else {
      this.SchemaTable = {
        projectName: this.Project.name,
        technic: this.Schema.created_by,
        schema: this.Schema.records.rows
      };

      let parameters : any[] = this.Indicator.parameters_schema;

      this.Project.organizations.forEach((organization,i) => {
        
        /**
         * Tabla de Cálculo de Parámetros
         */

        let parameterItem = {
          name: organization.name,
          id: organization._id,
          parameters: []
        };
        
        parameters.forEach(parameter => {
          parameterItem.parameters.push({
            value: this.calculateParameter(parameter.definition,(this.SchemaTable.schema.filter(row => row.organization == organization._id)[0]).fields),
            definition: this.formatDefinition(parameter.definition),
            unit: parameter.unit,
            isAcum: parameter.isAcum,
            name: parameter.name
          });
        });
        
        this.ParametersTable.push(parameterItem);

        /**
         * Tabla del Indicador Calculado
         */

        let indicadorItem = {
          name: organization.name,
          id: organization._id,
          isOlder: (this.Project.organizations_diff.filter(org => organization._id == org.id)[0]).isOlder,
          goals: this.ReportSchema.goal,
          parameters: [],
          total_indicator: {
            value: 0,
            details: {}
          }
        };

        parameters.forEach((parameter,j) => {
          let goal : any;
          if(this.Indicator.antiquity_diff) goal = indicadorItem.goals[0].parameters[j].goals;
          else goal = indicadorItem.goals[0].parameters[j].goals;
          indicadorItem.parameters.push({
            ponderacion: this.calculateWeighing(this.ParametersTable[i].parameters[j].value,parameter.weighing,goal,(this.Project.organizations_diff.filter(org => organization._id == org.id)[0]).isOlder,this.Indicator.antiquity_diff)
          });
          //Cálculo del Total del Indicador
          indicadorItem.total_indicator.value += indicadorItem.parameters[j].ponderacion.medido;
        });

        indicadorItem.total_indicator.details = this.getCalification(indicadorItem.total_indicator.value);

        this.IndicatorTable.push(indicadorItem);


        /**
         * Graficos Data
         */
        this.ChartData.push({
          name: organization.name,
          multi: [],
        });

        parameters.forEach((parameter,j) => {
          console.log(this.ChartData);
          this.ChartData[i].multi.push({
            name: parameter.name,
            series: [
              {
                name: 'Meta',
                value: this.IndicatorTable[i].parameters[j].ponderacion.establecido
              },
              {
                name: 'Valor Medido',
                value: this.IndicatorTable[i].parameters[j].ponderacion.medido
              }
            ]
          })
        });

      });

      let last : any = {
        single: []
      };

      this.Project.organizations.forEach((organization,i) => {
        last.single.push({
          name: organization.name,
          value: this.IndicatorTable[i].total_indicator.value
        });
      });

      this.ChartData.push(last);
    
    }
  
  }


  calculateWeighing(value : string, weighing : any, goal : any, isOlder : string, diff : boolean) : any{
    let calculated : any = {medido: 0, establecido: 0};
    if(diff){    //Se diferencia por Antiguedad
      if(isOlder == 'newer'){ //Si la Org es nueva
        calculated.establecido = weighing[0].newer;
        calculated.medido = parseFloat(value) * weighing[0].newer / parseFloat(goal.newer);
      }else{       //Si la Org es antigua
        calculated.establecido = weighing[0].older;
        calculated.medido = parseFloat(value) * weighing[0].older / parseFloat(goal.older);
      }
    }else{       //No se diferencia por Antiguedad
      calculated.establecido = weighing[0].weight;
      calculated.medido = parseFloat(value) * weighing[0].weight / parseFloat(goal.goal);
    }
    calculated.medido = Math.round(calculated.medido);
    return calculated;
  }

  formatDefinition(definition : any[]) : string {
    let result = '';
    definition.forEach(operador => {
      if(operador.type == 'normal') result += ` ${operador.value} `;
      else result += operador.value;
    });
    return result;
  }

  calculateParameter(definition : string[],fields : any[]) : number {
    let calculated : string = '';
    definition.forEach((operador : any) => {
      if(operador.type == 'normal'){
        if(operador.value == '*100%') calculated += '*100';
        else calculated += operador.value;
      }else if(operador.type == 'field'){
        calculated += (fields.filter(field => operador.value == field.name)[0]).value;
      }
    })
    return Math.round(eval(calculated));
  }

  /*formatPeriod(fecha : Date) : string{
    return `${this._service.getMonth(fecha.getMonth())} ${fecha.getFullYear()}`;
  }*/

  getCalification(Promedio : number){
    if(Promedio >= 80) return {letter: 'A',message:'Optimo!',description:'Requiere seguimiento periodico'};
    else if(Promedio < 80 && Promedio >= 60) return {letter: 'B',message:'Bueno!',description:'Requiere seguimiento y apoyo técnico puntual'};
    else if(Promedio < 60 && Promedio >= 40) return {letter: 'C',message:'Satisfactorio!',description:'Requiere seguimiento y apoyo técnico sistemático (períodico/minimo bimensual)'};
    else if(Promedio < 40 && Promedio >= 20) return {letter: 'D',message:'Deficiente!',description:'Requiere seguimiento y apoyo técnico cercano y frecuente(mínimo mensual)'};
    else if(Promedio < 20) return {letter: 'E',message:'Muy deficiente!',description:'En peligro de desaparecer, se debe valorar si se continua apoyo'};
  }
  
}
