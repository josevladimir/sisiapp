import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-calification-circle',
  templateUrl: './calification-circle.component.html'
})
export class CalificationCircleComponent implements OnInit {

  @Input() Calificacion : any;
  @Input() Promedio : number;
  @Input() DetailsPosition : string;

  constructor() { }

  ngOnInit(): void {
  }

}
