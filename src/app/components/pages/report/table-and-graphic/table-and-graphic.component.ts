import { Component, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import * as moment from 'moment';
import { UsersServiceService } from '../../../../services/users-service.service';

@Component({
  selector: 'app-table-and-graphic',
  templateUrl: './table-and-graphic.component.html'
})
export class TableAndGraphicComponent {

  @Input() Indicator : any;
  @Input() Project : any;
  @Input() Period : any;
  @Input() Schema : any;
  @Input() ReportSchema : any;

  @Output() setReady : EventEmitter<void>;

  promedios : any[];
  
  IndicatorTable;
  ParametersTable;
  SchemaTable;
  ChartData;
  Parameters;

  Technic : any;

  Promedio : number;
  Calificacion : any = {
    letter: '',
    message: '',
    description: ''
  };

  PromediosDiferenciados : any = {
    older: {
      value: 0,
      calification: {}
    },
    newer: {
      value: 0,
      calification: {}
    }
  }

  Users: any[];

  constructor(public usersService : UsersServiceService) { 
    this.setReady = new EventEmitter();
  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.generateTablesAndGraphicsData();
    if(this.Indicator.antiquity_diff) this.getPromediosDiferenciados();
    this.getIndicatorsPromedio();
    this.setReady.emit();
    

  }

  ngOnChanges(changes: SimpleChanges): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.
    this.generateTablesAndGraphicsData();
    if(this.Indicator.antiquity_diff) this.getPromediosDiferenciados();
    this.getIndicatorsPromedio();
    this.setReady.emit();
  }

  getPromediosDiferenciados(){
    let olders = this.IndicatorTable.filter(row => row.isOlder == 'older');
    let newers = this.IndicatorTable.filter(row => row.isOlder == 'newer');
    olders.forEach(older => this.PromediosDiferenciados.older.value += parseInt(older.total_indicator.value));
    newers.forEach(newer => this.PromediosDiferenciados.newer.value += parseInt(newer.total_indicator.value));

    this.PromediosDiferenciados.older.value /= olders.length;
    this.PromediosDiferenciados.newer.value /= newers.length;
    this.PromediosDiferenciados.older.calification = this.getCalification(this.PromediosDiferenciados.older.value);
    this.PromediosDiferenciados.newer.calification = this.getCalification(this.PromediosDiferenciados.newer.value);
    console.log(this.PromediosDiferenciados);
  }

  getIndicatorsPromedio() {
    if(this.Indicator.type != 'Grupo'){
      let totales = this.IndicatorTable.map(organization => organization.total_indicator.value);
      let sumatoria = 0;
      totales.forEach(total => sumatoria += total);
      this.Promedio = sumatoria / totales.length;
      this.Promedio = Math.round(this.Promedio);
      this.Calificacion = this.getCalification(this.Promedio);
    }
  }

  getCalification(Promedio : number){
    if(Promedio >= 80) return {letter: 'A',message:'Optimo!',description:'Requiere seguimiento periodico'};
    else if(Promedio < 80 && Promedio >= 60) return {letter: 'B',message:'Bueno!',description:'Requiere seguimiento y apoyo técnico puntual'};
    else if(Promedio < 60 && Promedio >= 40) return {letter: 'C',message:'Satisfactorio!',description:'Requiere seguimiento y apoyo técnico sistemático (períodico/minimo bimensual)'};
    else if(Promedio < 40 && Promedio >= 20) return {letter: 'D',message:'Deficiente!',description:'Requiere seguimiento y apoyo técnico cercano y frecuente(mínimo mensual)'};
    else if(Promedio < 20) return {letter: 'E',message:'Muy deficiente!',description:'En peligro de desaparecer, se debe valorar si se continua apoyo'};
  }

  /*Graphics*/
  view: any[] = [700, 400];

  // options
  showXAxis: boolean = true;
  showYAxis: boolean = true;
  gradient: boolean = true;
  showLegend: boolean = true;
  showXAxisLabel: boolean = true;
  xAxisLabel: string = 'Parámetros';
  showYAxisLabel: boolean = true;
  yAxisLabel: string = 'Ponderación';
  legendTitle: string = 'Leyenda';

  xAxisLabelLast: string = 'Organizaciones';
  yAxisLabelLast: string = 'Valor Indicador';

  colorScheme = {
    domain: ['#5AA454', '#C7B42C', '#AAAAAA']
  };

 onSelect(data): void {
    console.log('Item clicked', JSON.parse(JSON.stringify(data)));
  }

  onActivate(data): void {
    console.log('Activate', JSON.parse(JSON.stringify(data)));
  }

  onDeactivate(data): void {
    console.log('Deactivate', JSON.parse(JSON.stringify(data)));
  }


  /*-------------------------------------------------------------------------
    -------------------------------------------------------------------------
    -------------------------------------------------------------------------
    -------------------------------------------------------------------------*/

  
    generateTablesAndGraphicsData(){
      console.log('se lanza');
      this.ParametersTable = [];
      this.IndicatorTable = [];
      this.ChartData = [];
  
      if(this.Indicator.type == 'Simple'){
        this.SchemaTable = {
          projectName: this.Project.name,
          technic: this.Schema.created_by,
          schema: this.Schema.rows
        };

        let baseline : any = this.Project.full_schema.filter(indicador => indicador.id == this.Indicator._id)[0]; 
  
        let parameters : any[] = this.Indicator.parameters_schema;

        for(let i = 0; i < this.Schema.rows.length; i++){

          /**
           * Tabla de Cálculo de Parámetros
           */
  
          let parameterItem = {
            name: this.Schema.rows[i].name,
            id: this.Schema.rows[i].organization,
            parameters: []
          };
          let organization : any;
          for(let i = 0; i < this.Project.organizations.length; i++){
            if(this.Project.organizations[i]._id == parameterItem.id){
              organization = this.Project.organizations[i];
              break;
            }
          }
          
          for(let j = 0; j < parameters.length; j++){
            parameterItem.parameters.push({
              value: this.calculateParameter(parameters[j].definition,this.Schema.rows[i].fields,baseline,organization,parameters[j].name),
              definition: this.formatDefinition(parameters[j].definition),
              unit: parameters[j].unit,
              isAcum: parameters[j].isAcum,
              name: parameters[j].name
            });
          }
            
          
          this.ParametersTable.push(parameterItem);
  
          /**
           * Tabla del Indicador Calculado
           */
  
          let indicadorItem = {
            name: organization.name,
            id: organization._id,
            goals: this.ReportSchema.goal,
            total_indicator: {
              value: 0,
              details: {}
            }
          };
  
          for(let j = 0; j < this.SchemaTable.schema.length; j++){
            if(this.SchemaTable.schema[j].organization == organization._id){
              let startDate = moment(this.Project.start_date);
              let diferencia = moment(this.Period.date.to).diff(startDate,'months');
              let year = `${Math.trunc(diferencia / 12) + 1}º año`;
              for(let k = 0; k < indicadorItem.goals.length; k++){
                if(year == indicadorItem.goals[k].yearNumber){
                  for(let l = 0; l < parameters.length; l++){
                    if(parameters[l].unit != 'Cualitativo' ){
                      let valor = (Math.round(this.ParametersTable[i].parameters[l].value * 100 / parseInt(indicadorItem.goals[k].parameters[0].goals.goal.replace('%',''))));
                      if(valor > 100) indicadorItem.total_indicator.value = 100;
                      else if(valor < 0) indicadorItem.total_indicator.value = 0;
                      else if(valor < 100 && valor > 0)indicadorItem.total_indicator.value = valor;
                    }
                    break;
                  }
                  break;
                }
              }
            }
          }
  
          indicadorItem.total_indicator.details = this.getCalification(indicadorItem.total_indicator.value);
  
          console.log(indicadorItem);
  
          this.IndicatorTable.push(indicadorItem);
        }

        console.log(this.IndicatorTable);

        /*

        
      
  
          /**
           * Tabla del Indicador Calculado
           *
  
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
  
            let startDate = moment(this.Project.start_date);
            let diferencia = moment(this.Period.date.to).diff(startDate,'months');
            let year = `${Math.trunc(diferencia / 12) + 1}º año`;
            for(let k = 0; k < indicadorItem.goals.length; k++){
              if(year == indicadorItem.goals[k].year){
                let goal : any;
                if(this.Indicator.antiquity_diff) goal = indicadorItem.goals[k].parameters[0].goals;
                else goal = indicadorItem.goals[k].parameters[0].goals;
                indicadorItem.parameters.push({
                  ponderacion: this.calculateWeighing(this.ParametersTable[i].parameters[0].value,this.Parameters.weighing,goal,(this.Project.organizations_diff.filter(org => organization._id == org.id)[0]).isOlder,this.Indicator.antiquity_diff)
                });
              }
            }
            //Cálculo del Total del Indicador
            indicadorItem.total_indicator.value += indicadorItem.parameters[0].ponderacion.medido;
        
  
          indicadorItem.total_indicator.details = this.getCalification(indicadorItem.total_indicator.value);
  
          this.IndicatorTable.push(indicadorItem);






  
          /**
           * Tabla del Indicador Calculado
           *
  
          let indicadorItem = {
            name: organization.name,
            id: organization._id,
            isOlder: false,
            goals: this.ReportSchema.goal,
            total_indicator: {
              value: 0,
              details: {}
            }
          };

          if(organization.type == 'SFL') indicadorItem.isOlder = organization.isOlder;
          else{
            indicadorItem.isOlder = (this.Project.organizations_diff.filter(org => organization._id == org.id)[0]).isOlder;
          } 
  
          for(let j = 0; j < this.SchemaTable.schema.length; j++){
            if(this.SchemaTable.schema[j].organization == organization._id){
              let startDate = moment(this.Project.start_date);
              let diferencia = moment(this.Period.date.to).diff(startDate,'months');
              let year = `${Math.trunc(diferencia / 12) + 1}º año`;
              for(let k = 0; k < indicadorItem.goals.length; k++){
                if(year == indicadorItem.goals[k].year){
                  if(this.Parameters[0].unit != 'Cualitativo') indicadorItem.total_indicator.value = Math.round(this.SchemaTable.schema[j].fields[0].value * 100 / indicadorItem.goals[k].parameters[0].goals.goal);
                  else {
                    let indiceGoal = 0;
                    let indiceMedido = 0;
                    for(let l = 0; l < this.Parameters[0].cualitative_levels.length; l++){
                      if(this.Parameters[0].cualitative_levels[l].name == this.SchemaTable.schema[j].fields[0].value) indiceMedido = l;
                      if(this.Parameters[0].cualitative_levels[l].name == indicadorItem.goals[k].parameters[0].goals.goal) indiceGoal = l;
                    }
                    if(indiceGoal <= indiceMedido) indicadorItem.total_indicator.value = 100;
                  }
                  break;
                }
              }
            }
          }
  
          indicadorItem.total_indicator.details = this.getCalification(indicadorItem.total_indicator.value);
  
          console.log(indicadorItem);
  
          this.IndicatorTable.push(indicadorItem);
        });

        console.log(this.IndicatorTable);*/

        /**
         * Graficos Data
         */
        let item = {
          name: this.Indicator.name,
          multi: []
        }
  
        this.Schema.rows.forEach((row,j) => {
          
          item.multi.push({
            name: row.name,
            series: [
              {
                name: 'Valor Medido',
                value: this.IndicatorTable[j].total_indicator.value
              }
            ]
          })
        });

        this.ChartData.push(item);
      
      }else if(this.Indicator.type == 'Compuesto'){ // Esquema para Indicadores Compuestos
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
              //value: this.calculateParameter(parameter.definition,(this.SchemaTable.schema.filter(row => row.organization == organization._id)[0]).fields),
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
            let startDate = moment(this.Project.start_date);
            let diferencia = moment(this.Period.date.to).diff(startDate,'months');
            let year = `${Math.trunc(diferencia / 12) + 1}º año`;
            for(let k = 0; k < indicadorItem.goals.length; k++){
              if(year == indicadorItem.goals[k].year){
                let goal : any;
                if(this.Indicator.antiquity_diff) goal = indicadorItem.goals[k].parameters[j].goals;
                else goal = indicadorItem.goals[k].parameters[j].goals;
                indicadorItem.parameters.push({
                  ponderacion: this.calculateWeighing(this.ParametersTable[i].parameters[j].value,parameter.weighing,goal,(this.Project.organizations_diff.filter(org => organization._id == org.id)[0]).isOlder,this.Indicator.antiquity_diff)
                });
              }
            }
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
      
      }else if(this.Indicator.type == 'Grupo'){
        this.SchemaTable = {
          projectName: this.Project.name,
          technic: this.Schema.created_by,
          schema: this.Schema.records.rows
        };
  
        let parameters : any[] = this.Indicator.parameters_schema;
  
        this.Project.organizations.forEach((organization,i) => {
  
          /**
           * Tabla del Indicador Calculado
           */
  
          let indicadorItem = {
            name: organization.name,
            id: organization._id,
            isOlder: (this.Project.organizations_diff.filter(org => organization._id == org.id)[0]).isOlder,
            goals: this.ReportSchema.goal,
            parameters,
            total_indicatores: [/*{
              value: 0,
              details: {}
            }*/]
          };

          for(let j = 0; j < this.SchemaTable.schema.length; j++){
            if(this.SchemaTable.schema[j].organization == organization._id){
              let startDate = moment(this.Project.start_date);
              let diferencia = moment(this.Period.date.to).diff(startDate,'months');
              let year = `${Math.trunc(diferencia / 12) + 1}º año`;
              for(let k = 0; k < indicadorItem.goals.length; k++){
                if(year == indicadorItem.goals[k].year){
                  for(let v = 0; v < indicadorItem.parameters.length; v++){
                    if(parameters[0].unit != 'Cualitativo') {
                      let valorI = Math.round(this.SchemaTable.schema[j].fields[v].value * 100 / indicadorItem.goals[k].parameters[v].goals.goal);
                      indicadorItem.total_indicatores.push({
                        value: valorI,
                        details: this.getCalification(valorI)
                      });
                    }else {
                      let indiceGoal = 0;
                      let indiceMedido = 0;
                      for(let l = 0; l < this.Parameters[0].cualitative_levels.length; l++){
                        if(this.Parameters[0].cualitative_levels[l].name == this.SchemaTable.schema[j].fields[0].value) indiceMedido = l;
                        if(this.Parameters[0].cualitative_levels[l].name == indicadorItem.goals[k].parameters[0].goals.goal) indiceGoal = l;
                      }
                      if(indiceGoal <= indiceMedido) indicadorItem.total_indicatores.push({
                        value: 100,
                        details: this.getCalification(100)
                      });
                      else indicadorItem.total_indicatores.push({
                        value: 0,
                        details: this.getCalification(0)
                      });
                    }
                  }
                  break;
                }
              }
            }
          }
          this.IndicatorTable.push(indicadorItem);
  
  
          /**
           * Graficos Data
           *
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
                  name: 'Valor Medido',
                  value: this.IndicatorTable[i].total_indicatores[j].value
                }
              ]
            })
          });*/
  
        });
  
        
        //**Promedio de los Indicadores */
        this.promedios = [];
        for(let j = 0; j < this.IndicatorTable[0].parameters.length; j++){
          for(let i = 0; i < this.IndicatorTable.length; i++){
            if(!i) this.promedios.push({value: 0, details: {}});
            this.promedios[j].value += this.IndicatorTable[i].total_indicatores[j].value;
          }
        }
        for(let i = 0; i < this.promedios.length; i++){
          this.promedios[i].value /= this.IndicatorTable.length;
          this.promedios[i].details = this.getCalification(this.promedios[i].value);
        }

        let item = {
          name: 'promedios',
          multi: []
        }
  
        this.IndicatorTable[0].parameters.forEach((parameter,i) => {
          item.multi.push({
            name: parameter.name,
            series: [
              {
                name: 'Valor Promedio',
                value: this.promedios[i].value
              }
            ]
          });
        });

        console.log(item);
  
        this.ChartData.push(item);
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
  
    calculateParameter(definition : string[],fields : any[],baseline : any, organization : any, nameParameter : string) : number {
      let calculated : string = '';
      definition.forEach((operador : any) => {
        if(operador.type == 'normal'){
          if(operador.value == '*100%') calculated += '*100';
          else if(operador.value == 'LB'){
            if(baseline.baseline_diff.type == 'individual'){
              for(let i = 0; i < baseline.baseline.length; i++){
                if(baseline.baseline[i].organization == organization.name){
                  for(let j = 0; j < baseline.baseline[i].parameters.length; j++){
                    if(baseline.baseline[i].parameters[j].name == nameParameter){
                      calculated += baseline.baseline[i].parameters[j].baseline;
                      break;
                    }
                  }
                  break;
                }
              }
            }else{
              for(let i = 0; i < baseline.baseline.length; i++){
                if(baseline.baseline_diff.by == 'sectors' && baseline.baseline[i].organization == organization['sector']){
                  for(let j = 0; j < baseline.baseline[i].parameters.length; j++){
                    if(baseline.baseline[i].parameters[j].name == nameParameter){
                      calculated += baseline.baseline[i].parameters[j].baseline;
                      break;
                    }
                  }
                  break;
                }else if(baseline.baseline_diff.by == 'types' && baseline.baseline[i].organization == organization['type']){
                  for(let j = 0; j < baseline.baseline[i].parameters.length; j++){
                    if(baseline.baseline[i].parameters[j].name == nameParameter){
                      calculated += baseline.baseline[i].parameters[j].baseline;
                      break;
                    }
                  }
                  break;
                }
              }
            }
          }
          else calculated += operador.value;
        }else if(operador.type == 'field'){
          calculated += (fields.filter(field => operador.value == field.name)[0]).value;
        }
      });
      console.log(calculated);
      return Math.round(eval(calculated));
    }
  
    /*
    
      0: {type: "normal", value: "("}
      1: {type: "field", value: "Total Ingreso Mensual"}
      2: {type: "normal", value: "-"}
      3: {type: "normal", value: "LB"}
      4: {type: "normal", value: ")"}
      5: {type: "normal", value: "/"}
      6: {type: "normal", value: "LB"}
      7: {type: "normal", value: "*100%"}

    formatPeriod(fecha : Date) : string{
      return `${this._service.getMonth(fecha.getMonth())} ${fecha.getFullYear()}`;
    }*/

}
