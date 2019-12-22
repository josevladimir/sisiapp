import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-loading-view',
  templateUrl: './loading-view.component.html'
})
export class LoadingViewComponent{

  @Input() message : string;

}
