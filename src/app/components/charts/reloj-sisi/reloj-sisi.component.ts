import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
declare var google:any;

@Component({
  selector: 'app-reloj-sisi',
  templateUrl: './reloj-sisi.component.html',
  styleUrls: ['./reloj-sisi.component.sass']
})
export class RelojSISIComponent implements OnChanges,AfterViewInit {
  @ViewChild("relojChart") relojChart: ElementRef;
  
  @Input() data : any[];
  @Input() levels : any;

  options : any;

  drawChart = () => {
    let dataTodraw = google.visualization.arrayToDataTable(this.data);

    this.options = {
      animation: {
        duration: 3000,
        easing: 'in'
      },
      redFrom: 0, 
      redTo: 25,
      yellowFrom: 50, 
      yellowTo: 75,
      greenFrom: 75, 
      greenTo: 100
    };

    this.setRanges();

    const chart = new google.visualization.Gauge(
      this.relojChart.nativeElement
    );

    chart.draw(dataTodraw,this.options);
  };

  ngOnChanges(changes: SimpleChanges): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    this.drawChart();
  }
  
  ngAfterViewInit() {
    //Add '${implements OnChanges}' to the class.
    google.charts.load('current', {'packages':['gauge']});
    google.charts.setOnLoadCallback(this.drawChart);
  }

  setRanges(){
    this.options.redFrom = this.levels[0].range.from;
    this.options.redTo = this.levels[0].range.to;
    this.options.yellowFrom = this.levels[1].range.from;
    this.options.yellowTo = this.levels[1].range.to;
    this.options.greenFrom = this.levels[2].range.from;
    this.options.greenTo =this.levels[2].range.to;
  }
}
