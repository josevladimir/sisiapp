import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-project-card',
  templateUrl: './project-card.component.html'
})
export class ProjectCardComponent {

  @Input() project : any;

}
