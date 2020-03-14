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

  parameterSelected;

  isWorking : boolean = false;
  loadingMessage : string; 

  nameCtrl : FormControl = new FormControl('',[Validators.required,this._service.isBlank]);
  typeCtrl : FormControl = new FormControl('Compuesto',Validators.required);
  antiquity_diffCtrl : FormControl = new FormControl(false);
  descriptionCtrl : FormControl = new FormControl('',[Validators.required,this._service.isBlank]);
  
  fields : FormGroup = new FormGroup({
    name: new FormControl('',Validators.required),
    frequency: new FormControl('',Validators.required),
    isAcum: new FormControl(false,Validators.required),
    unit: new FormControl('',Validators.required)
  });
  
  parameterCompuesto : FormArray = new FormArray([
    new FormGroup({
      name: new FormControl('',Validators.required),
      weighing: new FormGroup({
        weight: new FormControl(''),
        older: new FormControl(''),
        newer: new FormControl(''),
      }),
      isAcum: new FormControl(false,Validators.required),
      unit: new FormControl('',Validators.required),
      definition: new FormArray([])
    })
  ]);

  record_schemaCtrl : FormArray = new FormArray([
    new FormGroup({
      name: new FormControl('',[Validators.required,this._service.isBlank]),
      frequency: new FormControl('',[Validators.required]),
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
        record_schema: this.record_schemaCtrl,
        parameters_schema: this.parameterCompuesto,
        antiquity_diff: this.antiquity_diffCtrl
      });
    }
  }

  showData(){
    console.log(this.indicatorForm);
  }

  addParameter(){
    (<FormArray>this.parameterCompuesto).push(new FormGroup({
        name: new FormControl('',Validators.required),
        weighing: new FormGroup({
          weight: new FormControl(''),
          older: new FormControl(''),
          newer: new FormControl(''),
        }),
        isAcum: new FormControl(false,Validators.required),
        unit: new FormControl('',Validators.required),
        definition: new FormArray([])
      })
    );
  }

  addField(){
    (<FormArray>this.record_schemaCtrl).push(new FormGroup({
      name: new FormControl('',[Validators.required,this._service.isBlank]),
      frequency: new FormControl('',[Validators.required]),
      unit: new FormControl('',[Validators.required])
    }));
  }

  changeType(ev){
    if(ev == 'Simple'){
      this.indicatorForm = new FormGroup({
        name: this.nameCtrl,
        type: this.typeCtrl,
        parameters_schema: this.fields,
        description: this.descriptionCtrl
      });
    }else{
      this.indicatorForm = new FormGroup({
        name: this.nameCtrl,
        type: this.typeCtrl,
        record_schema: this.record_schemaCtrl,
        parameters_schema: this.parameterCompuesto,
        antiquity_diff: this.antiquity_diffCtrl
      });
    }
  }

  saveIndicator(){
    this.loadingMessage = 'Guando el Indicador...';
    this.isWorking = true;
    let body : any;
    if(this.typeCtrl.value == 'Simple'){
      if(this.indicatorForm.valid){
        body = this.indicatorForm.value;
        body.parameters_schema = [{
          name: this.fields.controls.name.value,
          frequency: this.fields.controls.frequency.value,
          isAcum: this.fields.controls.isAcum.value,
          unit: this.fields.controls.unit.value,
          definition: this.descriptionCtrl.value,
          weighing: {weight: 100}
        }];
        body.antiquity_diff = false;
        console.log(body);
      }else {
        this.isWorking = false
        return alert('Todos los campos son obligatorios, por favor, revise el formulario.');
      }
    }else{
      body = this.indicatorForm.value;
      let flag : string;
      if(body.parameters_schema.length == 1) {
        this.isWorking = false;
        return alert("Los indicadores compuestos tienen al menos 2 parámetros. Si este indicador tine solamente uno, seleccione el tipo 'Simple'");
      }
      body.parameters_schema.forEach((parameter : any) => {
        if(!parameter.definition.length) return flag = 'Debe definir todos los parámetros del Indicador.';
      });
      if(flag){
        this.isWorking = false;
        return alert(flag);
      }
      let suma : any = {
        older: 0,
        newer: 0,
        none: 0
      }
      body.parameters_schema.forEach(parameter => {
        if(this.antiquity_diffCtrl.value){
          suma.older += parseInt(parameter.weighing.older);
          suma.newer += parseInt(parameter.weighing.newer);
          if(parameter.weighing.newer == null || parameter.weighing.older == null) return flag = 'Debe completar todas las ponderaciones solicitadas.';
        }else{
          suma.none += parseInt(parameter.weighing.weight);
          if(parameter.weighing.weight == null) return flag = 'Debe completar todas las ponderaciones solicitadas.';
        }
      });
      if(flag) {
        this.isWorking = false;
        return alert(flag);
      }
      
      if(this.antiquity_diffCtrl.value && (suma.older != 100 || suma.newer != 100)) flag = 'La ponderación debe sumar 100% en total.';
      if(!this.antiquity_diffCtrl.value && suma.none != 100) flag = 'La ponderación debe sumar 100% en total.';
      if(flag) {
        this.isWorking = false;
        return alert(flag);
      }

      if(this.indicatorForm.invalid){ 
        this.isWorking = false;
        return alert('Todos los campos son obligatorios, por favor, revise el formulario');
      }
    }
    this._service.createIndicator(body).subscribe(
      result => {
        this._service.updateIndicatorsList(true);
        this.isWorking = false;
        this._snackBar.open('Se ha registrado el indicador correctamente.','ENTENDIDO',{duration: 3000});
      },error => {
        this.isWorking = false;
        this._snackBar.open('Ha ocurrido un error al registrar el indicador.','ENTENDIDO',{duration: 3000});
      }
    );
  }

  cancel(){
    if(confirm('Los cambios no guardados se borrarán.\n\n¿Está seguro que desea salir?')) this._Router.navigate(['/indicators']);
  }

  addOperator(operator : string){
    (<FormArray> this.parameterCompuesto.controls[this.parameterSelected]['controls']['definition']).push(new FormControl(operator));
  }

  addFieldToDefinition(value : string){
    (<FormArray> this.parameterCompuesto.controls[this.parameterSelected]['controls']['definition']).push(new FormControl(value));
  }

  remove(index : number){
    (<FormArray> this.parameterCompuesto.controls[this.parameterSelected]['controls']['definition']).removeAt(index)
  }

}
