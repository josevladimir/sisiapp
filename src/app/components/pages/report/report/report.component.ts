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
import { GoogleChartComponent } from 'angular-google-charts';


GoogleChartComponent

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
    selection: 'average',
    items: []
  };

  assetsUrl : string = environment.assetsUrl;

  private querySubscription: Subscription;
  private querySubscription1: Subscription;

  graphicSettings : any = {
    title: '',
    yTitle: '',
    data: [],
    height: 400,
    dataForTable: [],
    format: 'short',
    min: 0,
    max: 100,
    status: 'loading'
  } 

  constructor(private projectService : ProjectsServiceService,
              private indicatorsService : IndicatorsServiceService,
              private preferencesService : PreferencesServiceService,
              private snackBar : MatSnackBar,
              private store : Store<State>,
              private apollo : Apollo) {
                
      this.projectService.getProjectsLocal().subscribe(projects => {projects.forEach(project => this.Projects.push({_id: project._id, name: project.name, duration: project.duration, monitoring_date: project.monitoring_date}))},
      error => this.snackBar.open('Ha ocurrido un error. Inténtelo de nuevo.','ENTENDIDO',{duration: 3000}));

      this.indicatorsService.getIndicatorsLocal().subscribe(indicators => {indicators.forEach(indicator => this.Indicators.push({_id: indicator._id, name: indicator.name, frequency: indicator.frequency, type: indicator.type,parameters_schema: indicator.parameters_schema,organizations_diff_by: indicator.organizations_diff_by}))},
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

    this.graphicSettings.data = [];

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
        
        if(this.Indicator.organizations_diff_by != 'CEFODI') this.makeChart(null);
        else this.setGraphicForCEFODI();
    
      }
    }, error => {this.Status == 'error'; console.log(error)});
  }
  
  dataTemp : any;
  
  makeChart(selection,isOnly?){
    this.Organizations.onlySelection = [];
    if(isOnly || (selection && selection.organization == 'only')){
      let criterio = this.Organizations.agrupation;
      if(isOnly) criterio = selection.agrupation;
      this.Organizations.items = [];
      switch(criterio){
        case 'partners':
          this.Organizations.items.push({value: 'Si', display: 'Mayor Cantidad Hombres'},{value: 'No', display: 'Mayor Cantidad Mujeres'});
          break;
        case 'with_business':
          this.Organizations.items.push({value: 'Si', display: 'Con Negocio'},{value: 'No', display: 'Sin Negocio'});
          break;
        case 'legalized':
          this.Organizations.items.push({value: 'Si', display: 'Legalizadas'},{value: 'No', display: 'Sin Legalizar'});
          break;
        default:
          this.preferencesService.getPreferencesLocal().subscribe(
            result => {
              let items = result[`${criterio}s`];
              for(let i = 0; i < items.length; i++){
                this.Organizations.items.push({
                  value: items[i],
                  display: items[i]
                });
              }
            },error => console.log(error)
          );
          break; 
      }

      /**Only Reset Graphic Settings**/
      let sorted = this.Ficha;
      sorted =  this.sortFechas(sorted);
      this.generatePeriods(sorted);
      this.datos = this.filterByPeriod(sorted);

      this.graphicSettings.data = [];
      this.graphicSettings.dataForTable = [];

      this.dataTemp = {
        rowsData: [['Fecha de Ingreso']],
        rowsDataForTable: [['Fecha de Ingreso']]
      }

      for(let i = 0; i < this.datos.length; i++){
        this.dataTemp.rowsData.push([new Date(this.datos[i].lapse.from)]);
        this.dataTemp.rowsDataForTable.push([[this.datos[i].period,this.datos[i].lapse.from]])
      }

      this.graphicSettings.status = 'loading';

    }else{

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
        console.log(this.Ficha);
        let sorted = this.Ficha;
        sorted=  this.sortFechas(sorted);
        this.generatePeriods(sorted);
        let datos = this.filterByPeriod(sorted);
        
        this.graphicSettings.data = [];
        
        if(this.Organizations.selection == 'average'){
          if(this.Indicator.type == 'Simple') {
            this.graphicSettings.yTitle = this.Indicator.parameters_schema[0].name;
            this.graphicSettings.data.push(['Fecha de Reporte',this.Indicator.parameters_schema[0].name]);
          }else if(this.Indicator.type == "Compuesto"){
            this.graphicSettings.yTitle = '% de Cumplimiento';
            this.graphicSettings.data.push(['Fecha de Reporte','% de Cumplimiento']);
          }
          
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
            this.graphicSettings.data.push([new Date(datos[i].lapse.from),average]);
          }
          this.Loading = false;
          this.Status = 'ready';
        }
        else if(this.Organizations.selection == 'group'){
          this.graphicSettings.data.push(['Fecha de Reporte']);
          let fechas = [];
          for(let i = 0; i < datos.length; i++){
            let row = [];
            row.push(new Date(datos[i].lapse.from));
            fechas.push([new Date(datos[i].lapse.from)]);
            for(let j = 1; j < datos[i].report.length; j++){
              let final : number = datos[i].report[j].length - 1;
              let dato = datos[i].report[j][final]; /////// Dato del Valor
              if(!isNaN(dato)) row.push(parseFloat(dato));
              else row.push(0);
    
              ///Etiquetas
              if(!i && j){
                this.graphicSettings.data[0].push(datos[i].report[j][0]);
              }
            }
    
    
            this.graphicSettings.data.push(row);
    
          }
      
          this.makeGraphicForAgrupationCase(fechas,datos);
    
        }


        console.log(this.graphicSettings);
        this.graphicSettings.title = `Gráfica ${this.Indicator.name} - ${this.Project.name}`;
        
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
      this.setFormatForGraphic();
    }

    
  }

  setFormatForGraphic(){
    let negativo = false;
    if(this.Indicator.type == 'Compuesto' ||
        (this.Indicator.type == 'Simple' && this.Indicator.parameters_schema[0].unit == 'Porcentaje')){
        for(let i = 1; i < this.graphicSettings.data.length; i++){
          for(let j = 1; j < this.graphicSettings.data[i].length; j++){
            if(!negativo){
              if(this.graphicSettings.data[i][j] < 0) negativo = true;
            }
            //if(this.graphicSettings.data[i][j] != 0){
              let aux =this.graphicSettings.data[i][j] / 100;
              this.graphicSettings.data[i][j] = aux;
            //}else this.graphicSettings.data[i][j] = 0;
          }
        }
        this.graphicSettings.format = 'percent';
        this.graphicSettings.max = 1;
        console.log(this.graphicSettings);
        console.log('si');

    }
    else this.graphicSettings.max = 100;

    if(negativo) this.graphicSettings.min = -1;
    else this.graphicSettings.min = 0;

    this.graphicSettings.status = 'ready';

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

  datos : any;

  /********************************************************************************* */
  makeGraphicForAgrupationCase(newData,datos?){
    this.graphicSettings.status = 'loading';
    let tabla = this.graphicSettings.data;
    let titles = this.graphicSettings.data[0];
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
      this.graphicSettings.data = [];

      switch(criterio){
        case 'legalized':
          this.graphicSettings.data.push(['Fecha de Reporte','Legalizadas','No Legalizadas']);
          break;
        case 'with_business':
          this.graphicSettings.data.push(['Fecha de Reporte','Con Negocio','Sin Negocio']);
          break;
        case 'partners':
          this.graphicSettings.data.push(['Fecha de Reporte','+ Mujeres','+ Hombres']);
          break;
        default:
          this.graphicSettings.data.push(['Fecha de Reporte']);
          break;
      }

      //console.log('matrix',newData);

      if(criterio == 'type' || criterio == 'sector'){
        
        let conteo = [];
        for(let j = 1; j < tabla.length; j++){
          conteo.push({}); //contador para cada una de las fichas
          for(let i = 1; i < titles.length; i++){
            let title = titles[i];
            let dato = tabla[j][i];
            let organization = this.getOrganization(data.organizations,title);
            let pos = null;
            
            if(organization){

              for(let k = 1; k < this.graphicSettings.data[0].length; k++){
                if(this.graphicSettings.data[0][k] == organization[criterio]){
                  pos = k;
                  break;
                }
              }
          
            let indexConteo = j - 1;
  
            if(pos != null){
              if(newData[indexConteo][pos] == null){
                newData[indexConteo][pos] = dato;
                if(dato != 0) conteo[(indexConteo)][organization[criterio]] = 1;
                else conteo[(indexConteo)][organization[criterio]] = 0;
              }else{
                newData[indexConteo][pos] += dato;
                if(dato != 0) conteo[(indexConteo)][organization[criterio]] += 1;
              }
            }else {
              this.graphicSettings.data[0].push(organization[criterio]);
              newData[indexConteo].push(dato);
              if(dato != 0) conteo[(indexConteo)][organization[criterio]] = 1;
              else conteo[(indexConteo)][organization[criterio]] = 0;
            }
          }
            

          }
          
        }

        for(let i = 0; i < newData.length; i++){
          for(let j = 1; j < newData[i].length; j++){
            if(conteo[i][this.graphicSettings.data[0][j]]) newData[i][j] = Math.round(newData[i][j] / conteo[i][this.graphicSettings.data[0][j]]*100)/100;
            else newData[i][j] = 0;
          }
          this.graphicSettings.data.push(newData[i]);
        }
          
        this.graphicSettings.dataForTable.push(this.graphicSettings.data[0]);
        for(let i = 1; i < this.graphicSettings.data.length; i++){
          this.graphicSettings.dataForTable.push([]);
          for(let j = 0; j < this.graphicSettings.data[i].length; j++){
            if(j) this.graphicSettings.dataForTable[i].push(this.graphicSettings.data[i][j]);
            else this.graphicSettings.dataForTable[i].push([datosIniciales[i-1].period,datosIniciales[i-1].lapse.from]);
          }
        }
            
      }
      else{
        for(let j = 1; j < tabla.length; j++){
          newData[j-1].push(0,0);
          let contadas = {
            Si: 0,
            No: 0,
          }
          console.log(tabla);
          for(let i = 1; i < titles.length; i++){
            let title = titles[i];
            let dato = tabla[j][i];
            
            
            if(criterio == 'legalized' || criterio == 'with_business' || criterio == 'partners'){
              let organization = this.getOrganization(data.organizations,title);
              if(organization){
                if(criterio == 'partners'){
                  if(organization.partners.mens > organization.partners.womens){
                    newData[j-1][2] += dato;
                    contadas.No += 1;
                  }else{
                    newData[j-1][1] += dato; 
                    contadas.Si += 1;
                  }
                }else{
                  if(organization[criterio] == 'Si'){
                    newData[j-1][1] += dato;
                    contadas.Si += 1;
                  }else if(organization[criterio] == 'No'){
                    newData[j-1][2] += dato;
                    contadas.No += 1;
                  }/*else if(!dato){
                    newData[j][1] += 0;
                    newData[j][2] += 0;
                  }*/
                }
              }
            }
          }
          newData[j-1][1] = Math.round(newData[j-1][1] / contadas.Si);
          newData[j-1][2] = Math.round(newData[j-1][2] / contadas.No);
    
        }
        for(let v = 0; v < newData.length; v++){
          this.graphicSettings.data.push(newData[v]);
        }
        console.log(this.graphicSettings);

        this.graphicSettings.dataForTable.push(this.graphicSettings.data[0]);
        for(let i = 1; i < this.graphicSettings.data.length; i++){
          this.graphicSettings.dataForTable.push([]);
          for(let j = 0; j < this.graphicSettings.data[i].length; j++){
            if(j) this.graphicSettings.dataForTable[i].push(this.graphicSettings.data[i][j]);
            else this.graphicSettings.dataForTable[i].push([datosIniciales[i-1].period,datosIniciales[i-1].lapse.from]);
          }
        }
      }
      
      //this.makeTable('groups',datosIniciales);

    },error => {this.Status == 'error'; console.log(error)});
  
    this.graphicSettings.status = 'ready';
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
          let final = tabla[i].report[0].length - 1;
          formated[j].push(tabla[i].report[j][final]);
        }
      }

      let averages : any[] = ["Promedio"];
      for(let i = 1; i < formated[0].length; i++){
        let n = 0;
        let sums = 0;
        for(let j = 1; j < formated.length; j++){
          if(formated[j][i]!= 'NaN'){
            sums += parseFloat(formated[j][i]);
            n += 1;
          }
        }
        averages.push(Math.round(sums/n));
      }

      formated.push(averages);

      this.graphicSettings.dataForTable = formated;  
      console.log(formated);
    }else if(type == 'groups'){
      let schema = this.graphicSettings.data;
      for(let j = 0; j < schema.length; j++){
        console.log(tabla[j]);
        let fila = [[tabla[j].period,tabla[j].lapse.from]];
        for(let i = 1; i < schema[j].length; i++){
          fila.push(schema[j][i])
        }
        formated.push(fila);
      }

      this.graphicSettings.dataForTable = this.graphicSettings.data;  
      console.log("formated",formated);
      this.Loading = false;
      this.Status = 'ready';
    }
  }

  addOrRemoveOrgs(value : string){

    if(!this.dataTemp){
      this.dataTemp = {
        rowsData: [['Fecha de Ingreso']],
        rowsDataForTable: [['Fecha de Ingreso']]
      }

      for(let i = 0; i < this.datos.length; i++){
        this.dataTemp.rowsData.push([new Date(this.datos[i].lapse.from)]);
        this.dataTemp.rowsDataForTable.push([[this.datos[i].period,this.datos[i].lapse.from]])
      }
    }

    //Verificar si esta o no ya seleccionada
    let exist = false;
    for(let i = 0; i < this.Organizations.onlySelection.length; i++){
      if(this.Organizations.onlySelection[i] == value){
        exist = true;
        break;
      }
    }

    /** Organización de las Fichas */
    let sorted = this.Ficha;
    sorted =  this.sortFechas(sorted);
    this.generatePeriods(sorted);
    let datos = this.filterByPeriod(sorted);

    let criterio = this.Organizations.agrupation;
    let query;

    console.log(exist);

    console.log(this.Organizations.onlySelection);

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
      
      
      if(exist){ // Ya se han agregado estas organizaciones, quitarlas
        let selecciones = [];
        for(let i = 0; i < this.Organizations.onlySelection.length; i++){
          if(this.Organizations.onlySelection[i] != value){
            selecciones.push(this.Organizations.onlySelection[i]);
            break;
          }else console.log('found');
        }
        this.Organizations.onlySelection = selecciones;
        if(!this.Organizations.onlySelection.length){
          this.graphicSettings.data = [];
          this.graphicSettings.dataForTable = [];
          this.dataTemp = null;
          for(let i = 0; i < this.datos.length; i++){
            this.dataTemp.rowsData.push([new Date(this.datos[i].lapse.from)]);
            this.dataTemp.rowsDataForTable.push([[this.datos[i].period,this.datos[i].lapse.from]])
          }
        }
        console.log('Segunda seleccion:',this.Organizations.onlySelection);
      }else{ // Hay que agregar estas organizaciones    
        console.log('Agregar Organizaciones');
        this.Organizations.onlySelection.push(value);
        for(let i = 1; i < this.datos[0].report.length; i++){ //Recorriendo por todas las organizaciones
          let orgName = this.datos[0].report[i][0];
          let org = this.getOrganization(data.organizations,orgName);
          
          if(org){
            if(org[criterio] == value){
              this.dataTemp.rowsData[0].push(orgName);
              this.dataTemp.rowsDataForTable[0].push(orgName);
              for(let j = 0; j < this.datos.length; j++){
                let final;
                if(this.Indicator.type == 'Simple') final = this.datos[0].report[0].length - 1;
                else final = this.datos[0].report.length - 1;
                console.log(final);
                if(this.datos[j].report[i][final] != "NaN"){
                  this.dataTemp.rowsData[j+1].push(Math.round(Number.parseFloat(this.datos[j].report[i][final])*100)/100);
                  this.dataTemp.rowsDataForTable[j+1].push(Math.round(Number.parseFloat(this.datos[j].report[i][final])*100)/100);
                }else{
                  this.dataTemp.rowsData[j+1].push(0);
                  this.dataTemp.rowsDataForTable[j+1].push(0);
                }
              }
            }
          }
  
        }

        

      }

      this.graphicSettings.data = [];
      this.graphicSettings.dataForTable = [];

      this.graphicSettings.data = this.dataTemp.rowsData;
      this.graphicSettings.dataForTable = this.dataTemp.rowsDataForTable;

      console.log('BIEN HECHO');
      console.log(this.graphicSettings.data);
      console.log(this.graphicSettings.dataForTable);
      this.setFormatForGraphic();
    },error => {this.Status == 'error'; console.log(error)});
    

  }

  getPosInColumnsName(title,columnsName) : Number {
    let result = -1;
    for(let i = 1; i < columnsName.length; i++){
      if(columnsName[i] == title){
        result = i;
        break;
      }
    }
    return result;
  }

  reset(){
    this.Status = 'reset';

    this.Organizations = {
      agrupation: 'type',
      selection: 'average',
      items: []
    };
  }

  //Settings of Graphics for CEFODI
  setGraphicForCEFODI(){
    let sorted = this.Ficha;
    sorted =  this.sortFechas(sorted);
    this.generatePeriods(sorted);
    this.datos = this.filterByPeriod(sorted);
    console.log(this.datos);

    let graphicData = [['Fecha de Ingreso',this.Indicator.parameters_schema[0].name]];
    let tableData = [['Fecha de Ingreso',this.Indicator.parameters_schema[0].name,'Nivel','Observación']];
    for(let i = 0; i < this.datos.length; i++){
      for(let j = 1; j < this.datos[i].report.length; j++){
        let index = this.datos[i].report[j].length - 2;
        graphicData.push([this.datos[i].period,Number.parseFloat(this.datos[i].report[j][index])]);
        console.log(
          this.datos[i].report[j]);
        let calificacion = this.getCalificationCualitative(this.datos[i].report[j][index]);
        tableData.push([
                        [this.datos[i].period,this.datos[i].lapse.from],
                        Number.parseFloat(this.datos[i].report[j][index])/100,
                        calificacion[0],
                        calificacion[1]
                      ]);

      }
    }

    this.graphicSettings.data = graphicData;
    this.graphicSettings.dataForTable = tableData;
    this.graphicSettings.levels = this.Indicator.parameters_schema[0].cualitative_levels;
    
    console.log(this.graphicSettings);
    this.Status = 'ready';
  }

  getCalificationCualitative(calificacion){
    let equivalencias = this.Indicator.parameters_schema[0].cualitative_levels;
    let resultado = [];
    for(let i = 0; i < equivalencias.length; i++){
      if(calificacion <= equivalencias[i].range.to && calificacion > equivalencias[i].range.from){
          resultado = [ equivalencias[i].name,equivalencias[i].description];
      }  
    }
    return resultado;
  }

}