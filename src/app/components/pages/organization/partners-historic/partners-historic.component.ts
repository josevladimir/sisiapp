import { Component, ViewChild, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { SisiCoreService } from '../../../../services/sisi-core.service';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';

@Component({
  selector: 'app-partners-historic',
  templateUrl: './partners-historic.component.html'
})
export class PartnersHistoricComponent implements OnInit {

  Organization : any;
  period : string  = '';

  ELEMENT_DATA : Registry[];
  /*Table Widget*/
  displayedColumns : string[];
  dataSource : MatTableDataSource<Registry>;


  availablesPeriods : any[] = [];

  constructor(private _ActivatedRoute : ActivatedRoute,
              private _Service : SisiCoreService) { 

    this._ActivatedRoute.params.subscribe(
      (params : Params) => this.Organization = this._Service.getOrganization(params.id)
    );

    this.generateTable();
    
    let fechaCreacion : Date = new Date(this.Organization.created_at);
    let año : number = fechaCreacion.getFullYear();
    if(new Date().getFullYear() > año){
      let diferenciaAños = new Date().getFullYear() - fechaCreacion.getFullYear();
      this.availablesPeriods.push({value: '3-months', text: 'Últimos 3 meses'});
      this.availablesPeriods.push({value: '6-months', text: 'Últimos 6 meses'});
      this.availablesPeriods.push({value: '9-months', text: 'Últimos 9 meses'});
      for(let i = 1; i <= diferenciaAños; i++){
        if(diferenciaAños == 1) this.availablesPeriods.push({value: '1-year', text:'Último año'});
        else this.availablesPeriods.push({value: `${i}-year`, text: `Últimos ${i} años`});
      }
    } else {
      let diferenciaMeses = new Date().getMonth() + 1 - fechaCreacion.getMonth() + 1; 
      //El Mismo año
      if(!diferenciaMeses || diferenciaMeses < 3) this.availablesPeriods.push({value: 'actual', text: 'Actualidad'});
      if(diferenciaMeses >= 3) this.availablesPeriods.push({value: '3-months', text: 'Últimos 3 meses'});
      if(diferenciaMeses >= 6) this.availablesPeriods.push({value: '6-months', text: 'Últimos 6 meses'});
      if(diferenciaMeses >= 9) this.availablesPeriods.push({value: '9-months', text: 'Últimos 9 meses'});
    }

  }

  ngOnInit() {
    this.dataSource.paginator = this.paginator;
  }

  /**
   * Graphic's Logic
   */

  generateChartData(){
    this.multi = null;
    let data : any[] = this.Organization.partners_history;
    this.multi = [
      {
        "name": "Hombres",
        "series": [
          /*{
            "name": "1990",
            "value": 62000000
          },
          {
            "name": "2010",
            "value": 73000000
          },
          {
            "name": "2011",
            "value": 89400000
          }*/
        ]
      },
    
      {
        "name": "Mujeres",
        "series": []
      }
    ];
    switch(this.period){
      case 'always':
        this.multi[0].series.push({
          name: this.getRegistryDate(new Date(this.Organization.created_at)),
          value: this.Organization.partners.mens
        });
        this.multi[1].series.push({
          name: this.getRegistryDate(new Date(this.Organization.created_at)),
          value: this.Organization.partners.womens
        });
        data.forEach(registry => {
          this.multi[0].series.push({
            name: this.getRegistryDate(new Date(registry.period)),
            value: registry.mens
          });
          this.multi[1].series.push({
            name: this.getRegistryDate(new Date(registry.period)),
            value: registry.womens
          });
        });
        break;
      case 'actual':
      this.multi[0].series.push({
        name: this.getRegistryDate(new Date(this.Organization.created_at)),
        value: this.Organization.partners.mens
      });
      this.multi[1].series.push({
        name: this.getRegistryDate(new Date(this.Organization.created_at)),
        value: this.Organization.partners.womens
      });
      /*data.forEach(registry => {
        this.multi[0].series.push({
          name: this.getRegistryDate(new Date(registry.period)),
          value: registry.mens
        });
        this.multi[1].series.push({
          name: this.getRegistryDate(new Date(registry.period)),
          value: registry.womens
        });
      });*/
        break;
      case '3-months':
        break;
      case '6-months':
        break;
      case '9-months':
        break;
      case '1-year':
        break;
      default: 
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
    this.Organization.partners_history.forEach((registry, index) => {
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

}

  export interface Registry {
    number: number,
    period: string,
    mens: number,
    womens: number,
    total: number
  }