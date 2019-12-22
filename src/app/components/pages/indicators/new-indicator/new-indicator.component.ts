import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { SisiCoreService } from '../../../../services/sisi-core.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-new-indicator',
  templateUrl: './new-indicator.component.html'
})
export class NewIndicatorComponent{

  indicatorForm : FormGroup;

  nameCtrl : FormControl = new FormControl('',Validators.required);
  typeCtrl : FormControl = new FormControl('Simple',Validators.required);
  antiquity_diffCtrl : FormControl = new FormControl(false);
  fields : FormArray = new FormArray([
    new FormGroup({
      name: new FormControl('',Validators.required),
      frequency: new FormControl('',Validators.required),
      isAcum: new FormControl(false,Validators.required),
      unit: new FormControl('',Validators.required)
    })
  ]);
  parameterCompuesto : FormArray = new FormArray([
    new FormGroup({
      name: new FormControl('',Validators.required),
      weighing: new FormGroup({
        weight: new FormControl('',Validators.required)
      }),
      isAcum: new FormControl(false,Validators.required),
      unit: new FormControl('',Validators.required)
    })
  ]);

  constructor(private _service : SisiCoreService,
              private _snackBar : MatSnackBar,
              private _Router : Router) { 
    if(this.typeCtrl.value == 'Simple'){
      this.indicatorForm = new FormGroup({
        name: this.nameCtrl,
        type: this.typeCtrl,
        parameters_schema: this.fields
      });
    }else{
      this.indicatorForm = new FormGroup({
        name: this.nameCtrl,
        type: this.typeCtrl,
        parameters_schema: this.parameterCompuesto,
        antiquity_diff: this.antiquity_diffCtrl
      });
    }
  }

  showData(){
    console.log(this.indicatorForm);
  }

  addParameter(){
    (<FormArray>this.fields).push(new FormGroup({
        name: new FormControl('',Validators.required),
        weighing: new FormGroup({
          weight: new FormControl('',Validators.required)
        }),
        isAcum: new FormControl(false,Validators.required),
        unit: new FormControl('',Validators.required)
      })
    );
  }

  changeType(ev){
    if(ev == 'Simple'){
      this.indicatorForm = new FormGroup({
        name: this.nameCtrl,
        type: this.typeCtrl,
        parameters_schema: this.fields
      });
    }else{
      this.indicatorForm = new FormGroup({
        name: this.nameCtrl,
        type: this.typeCtrl,
        parameters_schema: this.parameterCompuesto,
        antiquity_diff: this.antiquity_diffCtrl
      });
    }
  }

  saveIndicator(){
    let body : any;
    if(this.typeCtrl.value == 'Simple'){
      body = this.indicatorForm.value;
      body.created_by = localStorage.getItem('userID');
      body.parameters_schema.definition = this.nameCtrl.value;
      body.parameters_schema[0].weighing = {weight: 100};
      body.antiquity_diff = false;
      console.log(body.parameters_schema[0]);
      this._service.createIndicator(body).subscribe(
        result => {
          let indicators : any[];
          if(localStorage.getItem('indicators')) indicators = JSON.parse(localStorage.getItem('indicators'));
          else indicators = [];
          indicators.push(result.indicator);
          localStorage.setItem('indicators',JSON.stringify(indicators));
          this._snackBar.open('Se ha registrado el indicador correctamente.','ENTENDIDO',{duration: 3000});
          this._Router.navigate(['indicators']);
        },error => this._snackBar.open('Ha ocurrido un error al registrar el indicador.','ENTENDIDO',{duration: 3000})
      );
    }else{
      console.log(this.indicatorForm.value);
    }
  }

}
