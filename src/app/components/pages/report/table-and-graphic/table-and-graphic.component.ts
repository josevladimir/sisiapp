import { Component, Input } from '@angular/core';
import { SisiCoreService } from '../../../../services/sisi-core.service';

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

  constructor(public _service : SisiCoreService) { }
  
  ngOnInit() {
    this.Technic = this._service.getUser(this.SchemaTable.technic);
    this.getIndicatorsPromedio();
  
    //this.setUpGraphics();
  }

  getIndicatorsPromedio() {
    let totales = this.IndicatorTable.map(organization => organization.total_indicator_value);
    let sumatoria = 0;
    totales.forEach(total => sumatoria += total);
    this.Promedio = sumatoria / totales.length;
    this.Promedio = parseFloat(this.Promedio.toFixed(2));
    this.Calificacion = this.getCalification();
  }

  getCalification(){
    if(this.Promedio >= 80) return {letter: 'A',message:'Optimo!',description:'Requiere seguimiento periodico'};
    else if(this.Promedio < 80 && this.Promedio >= 60) return {letter: 'B',message:'Bueno!',description:'Requiere seguimiento y apoyo técnico puntual'};
    else if(this.Promedio < 60 && this.Promedio >= 40) return {letter: 'C',message:'Satisfactorio!',description:'Requiere seguimiento y apoyo técnico sistemático (períodico/minimo bimensual)'};
    else if(this.Promedio < 40 && this.Promedio >= 20) return {letter: 'D',message:'Deficiente!',description:'Requiere seguimiento y apoyo técnico cercano y frecuente(mínimo mensual)'};
    else if(this.Promedio < 20) return {letter: 'E',message:'Muy deficiente!',description:'En peligro de desaparecer, se debe valorar si se continua apoyo'};
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