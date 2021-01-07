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
import { PreferencesServiceService } from '../../../../services/preferences-service.service';

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
    height: 400,
    dataForTable: []
  } 







  constructor(private projectService : ProjectsServiceService,
              private indicatorsService : IndicatorsServiceService,
              private preferencesService : PreferencesServiceService,
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
          indicator_id {
            _id
            name
          }
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
      if(!data.reportes.length) this.Status = 'no hay';
      else{
        
        for(let i = 0; i < data.reportes.length; i++){
          console.log('al inicio: ',i);
          let reporte = {
            report: [],
            lapse: {from: data.reportes[i].lapse.from},
            period: data.reportes[i].period
          };
          if(this.selectedIndicator == 'all') reporte['indicator'] = data.reportes[i].indicator_id;
          for(let j = 0; j < data.reportes[i].report.length; j++){
            reporte.report.push(data.reportes[i].report[j].split(','));
          }
          datos.push(reporte);
        }
        this.Ficha = datos;
        this.makeChart(null);
    
      }
    }, error => {this.Status == 'error'; console.log(error)});
  }
  
  makeChart(selection){
    
    this.graphicSettings.dataForTable = [];

    if(selection){
      if(selection.period) this.Period.selection = selection.period;
      else if(selection.organization){
        this.Organizations.selection = selection.organization;
        if(selection.agrupation) this.Organizations.agrupation = selection.agrupation;
      }
      else if(selection.agrupation) this.Organizations.agrupation = selection.agrupation;
    }

    if(this.selectedIndicator != 'all'){

      let sorted = this.Ficha;
      sorted=  this.sortFechas(sorted);
      this.generatePeriods(sorted);
      let datos = this.filterByPeriod(sorted);
  
      this.graphicSettings.data = [];
  
      if(this.Organizations.selection == 'average'){
        /**Ejecutar función para hacer la tabla de datos */
        this.makeTable('average',datos);
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
        this.Loading = false;
        this.Status = 'ready';
      }
      else if(this.Organizations.selection == 'group'){
        this.graphicSettings.columnNames = ['Fecha de Reporte'];
        let fechas = [];
        for(let i = 0; i < datos.length; i++){
          let row = [];
          row.push(new Date(datos[i].lapse.from));
          fechas.push([new Date(datos[i].lapse.from)]);
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
        
        this.makeGraphicForAgrupationCase(fechas,datos);
  
        console.log(this.graphicSettings);
      }
  
      this.graphicSettings.options.chart.title = `Gráfica ${this.Indicator.name} - ${this.Project.name}`;
    }else{////////////////Todos los Indicadores
      let fichasClasificadas = {};
      let columnasTitle = ["Fecha de Ingreso"];
      let graphicData = [];

      for(let i = 0; i < this.Ficha.length; i++){
        let indicatorName = this.Ficha[i].indicator.name;
        if(fichasClasificadas.hasOwnProperty(indicatorName)) fichasClasificadas[indicatorName].push(this.Ficha[i]);
        else{
          fichasClasificadas[indicatorName] = [this.Ficha[i]];
          columnasTitle.push(indicatorName);
        }

      }

      console.log(columnasTitle);

      for(let i = 1; i < columnasTitle.length; i++){
        fichasClasificadas[columnasTitle[i]] = this.sortFechas(fichasClasificadas[columnasTitle[i]]);
        for(let j = 0; j < fichasClasificadas[columnasTitle[i]].length; j++){
          let fichaActual = fichasClasificadas[columnasTitle[i]][j];
          let already = false;

          ////Escribiendo las fechas en la primera columna
          for(let k = 0; k < graphicData.length; k++){
            if(graphicData[k][0] == fichaActual.lapse.from){
              already = true;
              break;
            }
          }

          if(already) break;

          graphicData.push([fichaActual.lapse.from])
          
        }
      }

      console.log(columnasTitle);

      
      
      for(let v = 1; v < columnasTitle.length; v++){
        for(let i = 0; i < fichasClasificadas[columnasTitle[v]].length; i++){
          let sumatoria : number = 0;
          let cantidad : number = 0;
          for(let j = 0; j < fichasClasificadas[columnasTitle[v]][i].report.length; j++){
            let final : number = fichasClasificadas[columnasTitle[v]][i].report[j].length - 1;
            let dato = fichasClasificadas[columnasTitle[v]][i].report[j][final];
            if(!isNaN(dato)){
              sumatoria += parseFloat(dato);
              cantidad += 1;
            }
          }
          let average = Math.round(sumatoria/cantidad);
          this.graphicSettings.type = 'Line';
          fichasClasificadas[columnasTitle[v]][i].promedio = average;
        }
      }
      console.log(columnasTitle);

      
      graphicData = this.sortRows(graphicData);
      for(let i = 0; i < graphicData.length; i++){
        for(let j = 1; j < columnasTitle.length; j++){
          graphicData[i].push(0);
          let fichasAct = fichasClasificadas[columnasTitle[j]];
          for(let k = 0; k < fichasAct.length; k++){
            if(fichasAct[k].lapse.from == graphicData[i][0]){
              graphicData[i][j] = fichasAct[k].promedio;
              break;
            }
          }
        }
      }

      for(let i = 0; i < graphicData.length; i++){
        graphicData[i][0] = new Date(graphicData[i][0]);
      }

      let forTable = [];
      forTable.push([])
      
      for(let i = 0; i < graphicData.length; i++){
        forTable.push([]);
        for(let j = 0; j < graphicData[i].length; j++){
          if(!i) forTable[0].push(columnasTitle[j]);
          forTable[i+1].push(graphicData[i][j]);
        }
      }
      console.log(columnasTitle);

      this.graphicSettings.columnNames = columnasTitle;
      this.graphicSettings.data = graphicData;
      this.graphicSettings.dataForTable = forTable;
      console.log(graphicData);
      console.log(this.graphicSettings);
      this.Status = 'ready';

    }
    
  }

  sortRows(datos) : any[]{
    let indicador = false;
    let auxiliar = datos;
    do {
      indicador = false;
      for(let i = 1; i < auxiliar.length; i++){
        let Ant = moment(new Date(auxiliar[i][0]));
        let Sig = moment(new Date(auxiliar[i][0]));
  
        if(Sig.isBefore(Ant)){
          let aux = auxiliar[i];
          auxiliar[i] = auxiliar[i-1];
          auxiliar[i-1] = aux;
          indicador = true;
        }
      }
    } while (indicador);
    return auxiliar;
  }

  sortFechas(datos):any[]{
    let indicador = false;
    let auxiliar = datos;
    do {
      indicador = false;
      for(let i = 1; i < auxiliar.length; i++){
        let Ant = auxiliar[i-1].period.split('º')[0];
        let Sig = auxiliar[i].period.split('º')[0];
  
        if(parseInt(Sig) < parseInt(Ant)){
          let aux = auxiliar[i];
          auxiliar[i] = auxiliar[i-1];
          auxiliar[i-1] = aux;
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
  makeGraphicForAgrupationCase(newData,datos?){
    let tabla = this.graphicSettings.data;
    let titles = this.graphicSettings.columnNames;
    let criterio = this.Organizations.agrupation;
    let datosIniciales = datos;

    let query;
    if(criterio != 'partners') query = gql`
      query {
        organizations(project: "${this.Project._id}") {
          _id
          name 
          ${criterio}
        }    
      }`;
      else query = gql`
      query {
        organizations(project: "${this.Project._id}") {
          _id
          name 
          partners {
            mens,
            womens
          }
        }    
      }`;

    this.querySubscription1 = this.apollo.watchQuery<any>({
      query  
    }).valueChanges.subscribe(({ data, loading}) => {
      this.graphicSettings.columnNames = ['Fecha de Reporte',`% de Cumplimiento(Promedio)`];
      this.graphicSettings.data = [];

      switch(criterio){
        case 'legalized':
          this.graphicSettings.columnNames = ['Fecha de Reporte','Legalizadas','No Legalizadas'];
          break;
        case 'with_business':
          this.graphicSettings.columnNames = ['Fecha de Reporte','Con Negocio','Sin Negocio'];
          break;
        case 'partners':
          this.graphicSettings.columnNames = ['Fecha de Reporte','+ Mujeres','+ Hombres'];
          break;
        default:
          this.graphicSettings.columnNames = ['Fecha de Reporte'];
          break;
      }

      //console.log('matrix',newData);

      if(criterio == 'type' || criterio == 'sector'){
        
        let conteo = [];
        for(let j = 0; j < tabla.length; j++){
          conteo.push({});
          for(let i = 1; i < titles.length; i++){
            let title = titles[i];
            let dato = tabla[j][i];
            let organization = this.getOrganization(data.organizations,title);
            let pos = null;

            console.log('criterio',organization[criterio]);

            for(let k = 1; k < this.graphicSettings.columnNames.length; k++){
              if(this.graphicSettings.columnNames[k] == organization[criterio]){
                pos = k;
                break;
              }
            }

            if(pos != null){
              if(newData[j][pos] == null){
                newData[j][pos] = dato;
                conteo[j][organization[criterio]] = 1;
              }else{
                newData[j][pos] += dato;
                conteo[j][organization[criterio]] += 1;
              }
            }else{
              this.graphicSettings.columnNames.push(organization[criterio]);
              newData[j].push(dato);
              conteo[j][organization[criterio]] = 1;
            }
          }

        }
        
        for(let i = 0; i < newData.length; i++){
          for(let j = 1; j < newData[i].length; j++){
            newData[i][j] = Math.round(newData[i][j] / conteo[i][this.graphicSettings.columnNames[j]]);
          }
        }
        this.graphicSettings.data = newData;
        
            
      }
      else{
        for(let j = 0; j < tabla.length; j++){
          newData[j].push(0,0);
          let contadas = {
            Si: 0,
            No: 0,
          }
          for(let i = 1; i < titles.length; i++){
            let title = titles[i];
            let dato = tabla[j][i];
            
            
            if(criterio == 'legalized' || criterio == 'with_business' || criterio == 'partners'){
              let organization = this.getOrganization(data.organizations,title);
              if(criterio == 'partners'){
                if(organization.partners.mens > organization.partners.womens){
                  newData[j][2] += dato;
                  contadas.No += 1;
                }else{
                  newData[j][1] += dato; 
                  contadas.Si += 1;
                }
              }else{
                if(organization[criterio] == 'Si'){
                  newData[j][1] += dato;
                  contadas.Si += 1;
                }else if(organization[criterio] == 'No'){
                  newData[j][2] += dato;
                  contadas.No += 1;
                }/*else if(!dato){
                  newData[j][1] += 0;
                  newData[j][2] += 0;
                }*/
              }
            }
          }
          newData[j][1] = Math.round(newData[j][1] / contadas.Si);
          newData[j][2] = Math.round(newData[j][2] / contadas.No);
    
        }
        this.graphicSettings.data = newData;
        console.log(this.graphicSettings);
      }
      
      this.makeTable('groups',datosIniciales);

    },error => {this.Status == 'error'; console.log(error)});
  

  }

  getOrganization(organizations,name){
    for(let i = 0; i < organizations.length; i++){
      if(organizations[i].name == name) return organizations[i];
    }
  }

  makeTable(type,tabla){
    let formated = [];
    if(type == 'average'){
      formated.push(['Organización']); //Row Title
      for(let j = 1; j < tabla[0].report.length; j++){
        formated.push([tabla[0].report[j][0]]);
        for(let i = 0; i < tabla.length; i++){
          if(j == 1) formated[0].push([tabla[i].period,tabla[i].lapse.from]);
            let final = tabla[i].report[j].length - 1;
            formated[j].push(tabla[i].report[j][final]);
          }
      }

      let averages : any[] = ["Promedio"];
      for(let i = 1; i < formated[0].length; i++){
        let sums = 0;
        for(let j = 1; j < formated.length; j++){
          console.log(j,i,formated[j][i]);
          sums += parseFloat(formated[j][i]);
        }
        averages.push(Math.round(sums/(formated.length - 1)));
      }

      formated.push(averages);

      this.graphicSettings.dataForTable = formated;  
      console.log(formated);
    }else if(type == 'groups'){
      console.log('nombres',this.graphicSettings.columnNames);
      formated.push(this.graphicSettings.columnNames);
      let schema = this.graphicSettings.data;
      for(let j = 0; j < schema.length; j++){
        console.log('j',j);
        let fila = [[tabla[j].period,tabla[j].lapse.from]];
        for(let i = 1; i < schema[j].length; i++){
          fila.push(schema[j][i])
        }
        formated.push(fila);
      }

      this.graphicSettings.dataForTable = formated;  
      console.log("formated",formated);
      this.Loading = false;
      this.Status = 'ready';
    }
  }

}