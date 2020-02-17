import { Component, ViewChild, OnInit, ɵConsole } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { SisiCoreService } from '../../../../services/sisi-core.service';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';

import { SisiDatewarehouseService } from '../../../../services/sisi-datewarehouseç.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-partners-historic',
  templateUrl: './partners-historic.component.html'
})
export class PartnersHistoricComponent implements OnInit {

  Organization : any;
  period : string  = '';

  chartData;

  ELEMENT_DATA : Registry[];
  /*Table Widget*/
  displayedColumns : string[];
  dataSource : MatTableDataSource<Registry>;


  availablesPeriods : any[] = [];

  constructor(private _ActivatedRoute : ActivatedRoute,
              private _Service : SisiCoreService,
              private _Datawarehouse : SisiDatewarehouseService,
              private _snackbar : MatSnackBar) { 

    this._ActivatedRoute.params.subscribe(
      (params : Params) => this.Organization = this._Service.getOrganization(params.id)
    );

    this._Datawarehouse.getPartnersHistoryData(this.Organization._id)
        .subscribe(
          result => {
            if(result.message == 'OK'){
              result.data.periods.forEach(period => this.availablesPeriods.push(period));
              result.data.series[0].series.forEach(serie => serie.name = new Date(serie.name));
              result.data.series[1].series.forEach(serie => serie.name = new Date(serie.name));
              this.chartData = result.data.series;
            }
          },
          error => this._snackbar.open('Error al recuperar los datos para la gráfica.','ENTENDIDO',{duration: 3000})
        );

    this.generateTable();

  }

  ngOnInit() {
    this.dataSource.paginator = this.paginator;
  }

  /**
   * Graphic's Logic
   */

  generateChartData(){
    this.multi = null;
    this.multi = [
      {
        name: 'Mujeres',
        series: []
      },
      {
        name: 'Hombres',
        series: []
      }
    ];
    switch(this.period){
      case 'actual':
        this.multi[0].series = this.chartData[0].series;
        this.multi[1].series = this.chartData[1].series;  
        break;
    }
    
  }

  multi: any[];
  view: any[] = [900, 400];

  // options
  legend: boolean = true;
  showLabels: boolean = true;
  animations: boolean = true;
  xAxis: boolean = true;
  yAxis: boolean = true;
  showYAxisLabel: boolean = true;
  showXAxisLabel: boolean = true;
  //Eje de X
  xAxisLabel: string = 'Tiempo';
  //Eje de Y
  yAxisLabel: string = 'Número de Socios';
  timeline: boolean = true;

  colorScheme = {
    domain: ['#5AA454', '#E44D25']
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

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;


  getRegistryDate (fecha : Date) : String{
    return `${fecha.getMonth() + 1}-${fecha.getFullYear()}`;
  }

  generateTable(){
    this.ELEMENT_DATA = [];
    let fecha : Date = new Date(this.Organization.created_at);
    this.ELEMENT_DATA.push({
      number: 1,
      period: `${this.getMonthText(fecha.getMonth() + 1)} - ${new Date(this.Organization.created_at).getFullYear()}`,
      mens: this.Organization.partners.mens,
      womens: this.Organization.partners.womens,
      total: this.Organization.partners.mens + this.Organization.partners.womens
    });
    this.Organization.historyPartners.forEach((registry, index) => {
      let fechaPeriodo : Date = new Date(registry.period);
      this.ELEMENT_DATA.push({
        number: index + 2,
        period: `${this.getMonthText(fechaPeriodo.getMonth() + 1)} - ${fechaPeriodo.getFullYear()}`,
        mens: registry.mens,
        womens: registry.womens,
        total: registry.mens + registry.womens
      })
    });
    this.displayedColumns = ['number', 'period', 'mens', 'womens', 'total'];
    this.dataSource = new MatTableDataSource<Registry>(this.ELEMENT_DATA);
  }

  getMonthText (month : number) : string {
    let mes : string = '';
    switch(month){
      case 1:
        mes = 'Enero';
        break;
      case 2:
        mes = 'Febrero';
        break;
      case 3:
        mes = 'Marzo';
        break;
      case 4:
        mes = 'Abril';
        break;
      case 5:
        mes = 'Mayo';
        break;
      case 6:
        mes = 'Junio';
        break;
      case 7:
        mes = 'Julio';
        break;
      case 8:
        mes = 'Agosto';
        break;
      case 9:
        mes = 'Septiembre';
        break;
      case 10:
        mes = 'Octubre';
        break;
      case 11:
        mes = 'Noviembre';
        break;
      case 12:
        mes = 'Diciembre';
        break;
      default:
        break;
    }
    return mes;
  }

  formatDate (fecha : Date) : string {
    return fecha.toString().split('T')[0];
  }

}

  export interface Registry {
    number: number,
    period: string,
    mens: number,
    womens: number,
    total: number
  }