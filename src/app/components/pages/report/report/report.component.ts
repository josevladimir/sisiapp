import { Component } from '@angular/core';
import { SisiCoreService } from '../../../../services/sisi-core.service';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html'
})
export class ReportComponent {

  Project : any;
  Projects : any[] = [];
  Indicator : any;
  Indicators : any[];
  AvailablePeriods : any[];

  ProjectRecords : any[];
  ProjectGoals : any[];

  selectedProject : string;
  selectedIndicator : string;
  selectedPeriod : string;

  PeriodSelectAvailable : boolean;

  Status : string = 'none';

  Schema : any;

  BaselineSchema : any;

  SchemaTable : any;
  ParametersTable : any[];
  IndicatorTable : any[];

  ChartData : any[];

  userRole : string;

  constructor(private _service : SisiCoreService) {
    this.userRole = localStorage.getItem('userRole');
    if(this.userRole == 'Financiador'){
      let normalProjects : any[] = this._service.getProjectsOff();
      let userProjects = JSON.parse(localStorage.getItem('user')).funder.projects;
      userProjects.forEach(project => {
        normalProjects.forEach(projectito => {
          if(projectito._id == project) this.Projects.push(projectito);
        });
      });
    }else this.Projects  = this._service.getProjectsOff();
  }

  onProjectSelected(seleccion){
    this.Project = this.Projects.filter(project => project._id == seleccion)[0];
    this.Indicators = this.Project.indicators;
    this.ProjectRecords = this.Project.records;
    this.ProjectGoals = this.Project.goals;
  }

  onIndicatorSelected(seleccion){
    this.PeriodSelectAvailable = false;
    this.Indicator = this._service.getIndicator(seleccion);

    this.AvailablePeriods = [];

    this.ProjectRecords.forEach(record => {
      if(record.records.indicator == seleccion) this.AvailablePeriods.push(this.formatPeriod(new Date(record.period)));
    });
    
    this.PeriodSelectAvailable = true;
  }

  onPeriodSelected(seleccion){
    /*TODO*/
    /**
     * Generar la información para la gráfica y la Tabla
     */
    console.log(seleccion);
    if(seleccion == 'none') return null;

    this.Status = 'loading';

    let recordsWithIndicator = this.ProjectRecords.filter(record => record.records.indicator == this.selectedIndicator);
    this.Schema = recordsWithIndicator.filter(record => this.formatPeriod(new Date(record.period)) == seleccion)[0];

    this.BaselineSchema = this.ProjectGoals.filter(indicator => indicator.id == this.selectedIndicator)[0];
    this.generateTablesAndGraphicsData();

    this.Status = 'ready';
  }

  generateTablesAndGraphicsData(){
    this.ParametersTable = [];
    this.IndicatorTable = [];
    this.ChartData = [];

    if(this.Indicator.type == 'Simple') true;
    else {
      this.SchemaTable = {
        projectName: this.Project.name,
        technic: this.Schema.created_by,
        schema: []
      };

      this.Project.organizations.forEach((organization,i) => {
        
        /**
         * Ficha Esquema
         */
        this.SchemaTable.schema.push({
          name: organization.name,
          fields: []
        });
        this.Schema.records.rows[i].fields.forEach(field => this.SchemaTable.schema[i].fields.push(field));

        /**
         * Parámetros Esquema
         */
        let parameters = this.Indicator.parameters_schema;
        
        this.ParametersTable.push({
          name: organization.name,
          parameters:[]
        });

        parameters.forEach((parameter,j) => {
          //Cálculo de los parámetros
          this.ParametersTable[i].parameters.push({
            value: this.calculateParameter(parameter.definition,this.SchemaTable.schema[i].fields),
            definition: this.formatDefinition(parameter.definition),
            unit: parameter.unit,
            isAcum: parameter.isAcum,
            name: parameter.name
          });
        });
        
        /**
         * Indicador Esquema
         */
        this.IndicatorTable.push({
          name: organization.name,
          baseline: [],
          parameters: [],
          total_indicator_value: 0
        });
        parameters.forEach((parameter,j) => {
          //Añadiendo las líneabase y metas
          this.IndicatorTable[i].baseline.push({
            baseline: this.BaselineSchema.organizations[i].parameters[j].baseline,
            goal: this.BaselineSchema.organizations[i].parameters[j].goal
          });
          //Cálculo de % de los parámetros
          this.IndicatorTable[i].parameters.push({
            ponderacion: this.calculateWeighing(this.ParametersTable[i].parameters[j].value,parameter.weighing,this.IndicatorTable[i].baseline[j].goal,organization.isOlder,this.Indicator.antiquity_diff)
          });
          //Cálculo del Total del Indicador
          this.IndicatorTable[i].total_indicator_value += this.IndicatorTable[i].parameters[j].ponderacion.medido;
        });

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
          value: this.IndicatorTable[i].total_indicator_value
        });
      });

      this.ChartData.push(last);

    }

  }

  calculateWeighing(value : string, weighing : any, goal : string, isOlder : boolean, diff : boolean) : any{
    let calculated : any = {medido: 0, establecido: 0};
    if(diff){    //Se diferencia por Antiguedad
      if(!isOlder){ //Si la Org es nueva
        calculated.establecido = weighing[0].newer;
        calculated.medido = parseFloat(value) * weighing[0].newer / parseFloat(goal);
      }else{       //Si la Org es antigua
        calculated.establecido = weighing[0].older;
        calculated.medido = parseFloat(value) * weighing[0].older / parseFloat(goal);
      }
    }else{       //No se diferencia por Antiguedad
      calculated.establecido = weighing[0].weight;
      calculated.medido = parseFloat(value) * weighing[0].weight / parseFloat(goal);
    }
    calculated.medido = parseFloat(calculated.medido.toFixed(2));
    return calculated;
  }

  formatDefinition(definition : string[]) : string {
    let result = '';
    definition.forEach(operador => {
      if(operador == '+' || operador == '-' || operador == '*' || operador == '/') result += ` ${operador} `;
      else result += operador;
    });
    return result;
  }

  calculateParameter(definition : string[],fields : any[]) : number {
    let calculated : string = '';
    definition.forEach(operador => {
      if(operador == '+' || operador == '-' || operador == '*' || operador == '/' || operador == '(' || operador == ')' || operador == '*100%'){
        if(operador == '*100%') calculated += '*100';
        else calculated += operador;
      }else{
        calculated += (fields.filter(field => operador == field.name)[0]).value;
      }
    })
    return eval(calculated).toFixed(2);
  }

  formatPeriod(fecha : Date) : string{
    return `${this._service.getMonth(fecha.getMonth())} ${fecha.getFullYear()}`;
  }


  
}
