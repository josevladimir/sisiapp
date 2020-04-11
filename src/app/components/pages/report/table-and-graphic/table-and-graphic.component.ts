import { Component, Input } from '@angular/core';
import { SisiCoreService } from '../../../../services/sisi-core.service';
import { UsersServiceService } from '../../../../services/users-service.service';

@Component({
  selector: 'app-table-and-graphic',
  templateUrl: './table-and-graphic.component.html'
})
export class TableAndGraphicComponent {

  @Input() SchemaTable : any;
  @Input() ParametersTable : any;
  @Input() IndicatorTable : any;
  @Input() Indicator : any;
  @Input() Project : any;
  @Input() Period : string;
  @Input() ChartData : any[];
  
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

  constructor(public usersService : UsersServiceService) { 
    this.usersService.getUsersLocal().subscribe(response => this.Technic = response.users.filter(user => user._id == this.SchemaTable.technic)[0]);
  }
  
  ngOnInit() {
    if(this.Indicator.antiquity_diff) this.getPromediosDiferenciados();
    this.getIndicatorsPromedio();
  }

  getPromediosDiferenciados(){
    console.log(this.IndicatorTable);
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
    let totales = this.IndicatorTable.map(organization => organization.total_indicator.value);
    let sumatoria = 0;
    totales.forEach(total => sumatoria += total);
    this.Promedio = sumatoria / totales.length;
    this.Promedio = Math.round(this.Promedio);
    this.Calificacion = this.getCalification(this.Promedio);
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
}
