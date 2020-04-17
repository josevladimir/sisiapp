import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { State } from 'src/app/reducers';
import * as fromLoadingActions from '../../../../reducers/actions/loading.actions';
import { IndicatorsServiceService } from '../../../../services/indicators-service.service';
import { MyValidators } from '../../../../models/Validators';

@Component({
  selector: 'app-new-indicator',
  templateUrl: './new-indicator.component.html'
})
export class NewIndicatorComponent{

  indicatorForm : FormGroup;

  parameterSelected;
  
  fields : FormGroup = new FormGroup({
    name: new FormControl('',Validators.required),
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
      name: new FormControl('',[Validators.required,MyValidators.isBlank]),
      unit: new FormControl('',Validators.required)
    })
  ]);

  constructor(private _indicatorsService : IndicatorsServiceService,
              private _Router : Router,
              private _store : Store<State>) { 
                
      //Inicialización del Formulario Simple
      this.indicatorForm = new FormGroup({
        name: new FormControl('',[Validators.required,MyValidators.isBlank]),
        type: new FormControl('Simple',Validators.required),
        parameters_schema: this.fields,
        description: new FormControl('',[Validators.required,MyValidators.isBlank]),
        frequency: new FormControl('',[Validators.required])
      });
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

  removeParameter(index : number){
    if(confirm('Esta acción no se puede deshacer.\n\n¿Está seguro que desea eliminar este parámetro?')) (<FormArray> this.parameterCompuesto).removeAt(index);
  }

  addField(){
    (<FormArray>this.record_schemaCtrl).push(new FormGroup({
      name: new FormControl('',[Validators.required,MyValidators.isBlank]),
      unit: new FormControl('',[Validators.required])
    }));
  }

  removeField(index : number){
    if(confirm('Esta acción no se puede deshacer.\n\n¿Está seguro que desea eliminar este campo?')) (<FormArray> this.record_schemaCtrl).removeAt(index);
  }

  changeType(ev){
    if(ev == 'Simple'){
      this.indicatorForm = new FormGroup({
        name: new FormControl('',[Validators.required,MyValidators.isBlank]),
        type: new FormControl('Simple',Validators.required),
        parameters_schema: this.fields,
        description: new FormControl('',[Validators.required,MyValidators.isBlank]),
        frequency: new FormControl('',Validators.required)
      });
    }else{
      this.indicatorForm = new FormGroup({
        name: new FormControl('',[Validators.required,MyValidators.isBlank]),
        type: new FormControl('Compuesto',Validators.required),
        record_schema: this.record_schemaCtrl,
        parameters_schema: this.parameterCompuesto,
        antiquity_diff: new FormControl(false),
        frequency: new FormControl('',Validators.required)
      });
    }
  }

  saveIndicator(){
    this._store.dispatch(fromLoadingActions.initLoading({message: 'Guardando el Indicador...'}));
    let body : any;
    if(this.indicatorForm.get('type').value == 'Simple'){
      if(this.indicatorForm.valid){
        body = this.indicatorForm.value;
        body.parameters_schema = [{
          name: this.fields.controls.name.value,
          isAcum: this.fields.controls.isAcum.value,
          unit: this.fields.controls.unit.value,
          definition: this.indicatorForm.get('description').value,
          weighing: {weight: 100}
        }];
        body.antiquity_diff = false;
        console.log(body);
      }else {
        this._store.dispatch(fromLoadingActions.stopLoading())
        return alert('Todos los campos son obligatorios, por favor, revise el formulario.');
      }
    }else{
      body = this.indicatorForm.value;
      let flag : string;
      if(body.parameters_schema.length == 1) {
        this._store.dispatch(fromLoadingActions.stopLoading());
        return alert("Los indicadores compuestos tienen al menos 2 parámetros. Si este indicador tine solamente uno, seleccione el tipo 'Simple'");
      }
      body.parameters_schema.forEach((parameter : any) => {
        if(!parameter.definition.length) return flag = 'Debe definir todos los parámetros del Indicador.';
      });
      if(flag){
        this._store.dispatch(fromLoadingActions.stopLoading());
        return alert(flag);
      }
      let suma : any = {
        older: 0,
        newer: 0,
        none: 0
      }
      body.parameters_schema.forEach(parameter => {
        if(this.indicatorForm.get('antiquity_diff').value){
          suma.older += parseInt(parameter.weighing.older);
          suma.newer += parseInt(parameter.weighing.newer);
          if(parameter.weighing.newer == null || parameter.weighing.older == null) return flag = 'Debe completar todas las ponderaciones solicitadas.';
        }else{
          suma.none += parseInt(parameter.weighing.weight);
          if(parameter.weighing.weight == null) return flag = 'Debe completar todas las ponderaciones solicitadas.';
        }
      });
      if(flag) {
        this._store.dispatch(fromLoadingActions.stopLoading());
        return alert(flag);
      }
      
      if(this.indicatorForm.get('antiquity_diff').value && (suma.older != 100 || suma.newer != 100)) flag = 'La ponderación debe sumar 100% en total.';
      if(!this.indicatorForm.get('antiquity_diff').value && suma.none != 100) flag = 'La ponderación debe sumar 100% en total.';
      if(flag) {
        this._store.dispatch(fromLoadingActions.stopLoading());
        return alert(flag);
      }

      if(this.indicatorForm.invalid){ 
        this._store.dispatch(fromLoadingActions.stopLoading());
        return alert('Todos los campos son obligatorios, por favor, revise el formulario');
      }
    }
    this._indicatorsService.createIndicator(body);
  }

  cancel(){
    if(confirm('Los cambios no guardados se borrarán.\n\n¿Está seguro que desea salir?')) this._Router.navigate(['/indicators']);
  }

  addOperator(operator : string){
    if(operator == '+' || operator == '-' || operator == '*' ||
       operator == '/' || operator == '(' || operator == ')' || operator == '*100%'){
      (<FormArray> this.parameterCompuesto.controls[this.parameterSelected]['controls']['definition']).push(new FormGroup({
        type: new FormControl('normal'),
        value: new FormControl(operator)
      }));
    }else{
      (<FormArray> this.parameterCompuesto.controls[this.parameterSelected]['controls']['definition']).push(new FormGroup({
        type: new FormControl(operator),
        value: new FormControl('',Validators.required)
      }));
    }
  }

  addFieldToDefinition(value : string){
    (<FormArray> this.parameterCompuesto.controls[this.parameterSelected]['controls']['definition']).push(new FormGroup({
      type: new FormControl('field'),
      value: new FormControl(value,Validators.required)
    }));
  }

  remove(index : number){
    (<FormArray> this.parameterCompuesto.controls[this.parameterSelected]['controls']['definition']).removeAt(index);
  }

}
