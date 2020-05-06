import { Component, OnInit } from '@angular/core';
import { ToolbarButton } from '../../../shared/sub-toolbar/sub-toolbar.component';
import { Router, ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html'
})
export class ViewComponent implements OnInit {

  buttons : ToolbarButton[] = [
    {
      hasIcon: true,
      icon: 'add',
      message: 'Agregar Registro',
      handler: () => this.Router.navigate(['newRegistry'],{relativeTo: this.ActivatedRoute})
    }
  ];

  constructor(private Router : Router,
              private ActivatedRoute : ActivatedRoute) {
                
  }

  ngOnInit(): void {
  }

}
