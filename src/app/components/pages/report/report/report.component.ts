import { Component } from '@angular/core';
import { ProjectsServiceService } from '../../../../services/projects-service.service';
import { environment } from '../../../../../environments/environment';
import { Store } from '@ngrx/store';
import { State } from 'src/app/reducers';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { Apollo,gql } from 'apollo-angular';
import { IndicatorsServiceService } from '../../../../services/indicators-service.service';
import * as moment from 'moment';

/** */

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html'
})
export class ReportComponent {

  Projects : any[] = [];
  selectedProject : string = "";
  Project : any;

  Indicators : any[] = [];
  selectedIndicator : string = 'all';
  Indicator : any;

  Status : string;
  Loading : boolean;

  /**Ficha */
  Ficha : any = [];

  settingsEnabled = false;

  /**Periodo */
  Period: any = {
    frequency: '',
    periods: [],
    selection: 'allTime'
  };

   /**Periodo */
  Organizations: any = {
    agrupation: 'type',
    selection: 'average'
  };

  assetsUrl : string = environment.assetsUrl;

  private querySubscription: Subscription;
  private querySubscription1: Subscription;

  graphicSettings = {
    type: 'BarChart',
    data: [],
    columnNames: ['Browser', 'Percentage'],
    options: {    
      chart: {
        title: '',
        subtitle: '',
        legend: {
          position: 'top'
        }
      },
    },
    height: 400
  } 







  constructor(private projectService : ProjectsServiceService,
              private indicatorsService : IndicatorsServiceService,
              private snackBar : MatSnackBar,
              private store : Store<State>,
              private apollo : Apollo) {
                
      this.projectService.getProjectsLocal().subscribe(projects => {projects.forEach(project => this.Projects.push({_id: project._id, name: project.name, duration: project.duration, monitoring_date: project.monitoring_date}))},
      error => this.snackBar.open('Ha ocurrido un error. Inténtelo de nuevo.','ENTENDIDO',{duration: 3000}));

      this.indicatorsService.getIndicatorsLocal().subscribe(indicators => {indicators.forEach(indicator => this.Indicators.push({_id: indicator._id, name: indicator.name, frequency: indicator.frequency}))},
      error => this.snackBar.open('Ha ocurrido un error. Inténtelo de nuevo.','ENTENDIDO',{duration: 3000}));
  }

  generatePeriods(data){
    this.Period.periods = [];
    for(let i = data.length - 1; i > 0 ; i--){
      this.Period.periods.push(data[i].period);
    }
    this.settingsEnabled = true;
  }

  generateReport(){
    this.Status = '';
    this.Loading = true;
    this.settingsEnabled = false;



    for(let i = 0; i < this.Projects.length; i++){
      if(this.Projects[i]._id == this.selectedProject){
        this.Project = this.Projects[i];
        break;
      }
    }

    if(this.selectedIndicator != 'all'){
      for(let i = 0; i < this.Indicators.length; i++){
        console.log(this.Indicators[i]._id, this.selectedIndicator);
        if(this.Indicators[i]._id == this.selectedIndicator){
          this.Indicator = this.Indicators[i];
          break;
        }
      }
    }

    let query; ////// TODO: Toca dinamizar el id del project ////// TODO: Toca dinamizar el id del project ////// TODO: Toca dinamizar el id del project
    if(this.selectedIndicator == 'all'){
      query = gql`
      query {
        reportes(project: "${this.Project._id}") {
          report
          lapse {
            from
          }
          period
        }    
      }` 
    }else{
      query = gql`
       query {
         reportes(project: "${this.Project._id}", indicator: "${this.Indicator._id}") {
           report
           lapse {
             from
           }
           period
         }    
       }` 
    }

    this.querySubscription = this.apollo.watchQuery<any>({
       query  
    }).valueChanges.subscribe(({ data, loading}) => {
      this.Loading = loading;
      let datos = [];
      for(let i = 0; i < data.reportes.length; i++){
        let reporte = {
          report: [],
          lapse: {from: data.reportes[i].lapse.from},
          period: data.reportes[i].period
        };
        for(let j = 0; j < data.reportes[i].report.length; j++){
          reporte.report.push(data.reportes[i].report[j].split(','));
        }
        datos.push(reporte);
      }
      this.Ficha = datos;
      this.makeChart(null);
      this.Loading = false;
      this.Status = 'ready';
    }, error => console.log(error));
  }
  
  makeChart(selection){
    
    if(selection){
      if(selection.period) this.Period.selection = selection.period;
      else if(selection.organization){
        this.Organizations.selection = selection.organization;
        if(selection.agrupation) this.Organizations.agrupation = selection.agrupation;
      }
      else if(selection.agrupation) this.Organizations.agrupation = selection.agrupation;
    }

    let sorted = this.Ficha;
    sorted=  this.sortFechas(sorted);
    this.generatePeriods(sorted);
    let datos = this.filterByPeriod(sorted);
    console.log(this.Ficha);

    this.graphicSettings.data = [];

    if(this.Organizations.selection == 'average'){
      for(let i = 0; i < datos.length; i++){
        let sumatoria : number = 0;
        let cantidad : number = 0;
        for(let j = 0; j < datos[i].report.length; j++){
          let final : number = datos[i].report[j].length - 1;
          let dato = datos[i].report[j][final];
          if(!isNaN(dato)){
            sumatoria += parseFloat(dato);
            cantidad += 1;
          }
        }
        let average = Math.round(sumatoria/cantidad);
        this.graphicSettings.type = 'Line';
        this.graphicSettings.data.push([new Date(datos[i].lapse.from),average]);
      }
      this.graphicSettings.columnNames = ['Fecha de Reporte',`% de Cumplimiento(Promedio)`];
    }
    else if(this.Organizations.selection == 'all'){
      console.log(this.Ficha);
      this.graphicSettings.columnNames = ['Fecha de Reporte'];
      for(let i = 0; i < datos.length; i++){
        let row = [];
        row.push(new Date(datos[i].lapse.from));
        for(let j = 0; j < datos[i].report.length; j++){
          let final : number = datos[i].report[j].length - 1;
          let dato = datos[i].report[j][final]; /////// Dato del Valor
          if(!isNaN(dato)) row.push(parseFloat(dato));
          else{
            if(j){
              let ant = j - 1;
              if(!isNaN(datos[i].report[ant][final])) row.push(parseFloat(datos[i].report[ant][final]));
              else row.push(0);
            }
          }

          ///Etiquetas
          if(!i && j){
            this.graphicSettings.columnNames.push(datos[i].report[j][0]);
          }
        }


        this.graphicSettings.type = 'Line';
        this.graphicSettings.data.push(row);
      }
      
      this.makeGraphicForAgrupationCase();

    }

    this.graphicSettings.options.chart.title = `Gráfica ${this.Indicator.name} - ${this.Project.name}`;
    
  }

  sortFechas(datos):any[]{
    let indicador = false;
    let auxiliar = datos;
    do {
      indicador = false;
      for(let i = 1; i < auxiliar.length; i++){
        let Ant = auxiliar[i-1];
        let Sig = auxiliar[i];
  
        if(moment(Ant.lapse.from).isAfter(moment(Sig.lapse.from))){
          let aux = auxiliar[i-1];
          auxiliar[i-1] = auxiliar[i];
          auxiliar[i] = aux;
          indicador = true;
        }
      }
    } while (indicador);
    return auxiliar;
  }

  filterByPeriod(sortedData:any[]) : any[]{
    let sorted = [];
    if(this.Period.selection == 'allTime') return sortedData;
    let index;
    for(let i = 0; i < sortedData.length; i++){
      if(sortedData[i].period == this.Period.selection){
        index = i;
        break;
      }
    }
    for(let i = index; i < sortedData.length; i++){
      sorted.push(sortedData[i]);
    }
    return sorted;
  }


  /********************************************************************************* */
  makeGraphicForAgrupationCase(){
    let tabla = this.graphicSettings.data;
    let titles = this.graphicSettings.columnNames;

    let query = gql`
      query {
        organizations(project: "${this.Project._id}") {
          _id
          name 
          ${this.Organizations.agrupation}
        }    
      }` 


    this.querySubscription1 = this.apollo.watchQuery<any>({
      query  
    }).valueChanges.subscribe(({ data, loading}) => {
      
      let criterio = this.Organizations.agrupation;

      /*Filtrar*/ 
      if(criterio == 'legalized' || criterio == 'with_business' || criterio == 'partners'){
        if(criterio == 'partners'){

        }else{
          console.log(this.graphicSettings.data);

          let posiciones = {Si: [], No: []};
          
          for(let i = titles.length-1; i > 0; i--){
            let index;

            console.log(data.organizations);
            for(let j = 0; j < data.organizations.length; j++){
              if(data.organizations[j].name == titles[i]){
                console.log('llego');
                index = j;
                break;
              }
            }
            posiciones[data.organizations[index][criterio]].push(i);
          }
          console.log(posiciones);
          //////
          

        }
      }

     }, error => console.log(error));
    

  }

}