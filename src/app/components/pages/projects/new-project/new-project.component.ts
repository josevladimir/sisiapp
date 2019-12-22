import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-new-project',
  templateUrl: './new-project.component.html'
})
export class NewProjectComponent implements OnInit {

  firstFormGroup : FormGroup;
  secondFormGroup : FormGroup;

  constructor() { 
    this.firstFormGroup = new FormGroup({
      firstCtrl: new FormControl(''),
    });
    this.secondFormGroup = new FormGroup({
      secondCtrl: new FormControl('')
    });
  }

  ngOnInit() {
  }

}
