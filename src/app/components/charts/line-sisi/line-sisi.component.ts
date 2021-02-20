import { AfterViewInit, Component, ElementRef, Input, SimpleChanges, ViewChild } from '@angular/core';
declare var google:any;

@Component({
  selector: 'app-line-sisi',
  templateUrl: './line-sisi.component.html',
  styleUrls: ['./line-sisi.component.sass']
})
export class LineSISIComponent implements AfterViewInit {
  @ViewChild("pieChart") pieChart: ElementRef;
  
  @Input() data : any[];
  @Input() yTitle : string;
  @Input() title : string;
  @Input() format: string;
  @Input() min: number;
  @Input() max: number;


  drawChart = () => {
    let dataTodraw = google.visualization.arrayToDataTable(this.data);

    let options = {
      title: this.title,
      legend: { position: "bottom" },
      vAxis: {
        title: this.yTitle,
        format: this.format,
        viewWindow: {
          max: this.max,
          min: this.min
        }
      }
    };

    const chart = new google.charts.Line(
      this.pieChart.nativeElement
    );

    chart.draw(dataTodraw, google.charts.Line.convertOptions(options));
  };

  ngOnChanges(changes: SimpleChanges): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    this.drawChart();
  }
  
  ngAfterViewInit() {
    //Add '${implements OnChanges}' to the class.
    google.charts.load('current', {'packages':['line']});
    google.charts.setOnLoadCallback(this.drawChart);
  }


}
