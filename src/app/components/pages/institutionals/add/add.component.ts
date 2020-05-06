import { Component } from '@angular/core';
import { FormGroup, Validators, FormControl, FormArray } from '@angular/forms';

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html'
})
export class AddComponent {

  institutionalForm : FormGroup;

  constructor() {

    this.institutionalForm = new FormGroup({
      name: new FormControl('',Validators.required),
      type: new FormControl('',Validators.required),
      schema: new FormArray([new FormGroup({
        name: new FormControl('',Validators.required),
        type: new FormControl('',Validators.required),
        options: new FormArray([])
      })])
    });

  }

  addCampo = () => (<FormArray> this.institutionalForm.get('schema')).push(new FormGroup({
      name: new FormControl('',Validators.required),
      type: new FormControl('',Validators.required),
      options: new FormArray([])
    }));

  removeCampo = (index) => (<FormArray> this.institutionalForm.get('schema')).removeAt(index);

}
