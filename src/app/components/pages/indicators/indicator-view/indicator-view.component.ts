import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { State } from 'src/app/reducers';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as fromLoadingActions from '../../../../reducers/actions/loading.actions';
import { ActivatedRoute, Params } from '@angular/router';
import { IndicatorsServiceService } from '../../../../services/indicators-service.service';
import { FormGroup, Validators, FormControl, FormArray } from '@angular/forms';
import { MyValidators } from '../../../../models/Validators';
import { isAdmin } from '../../../../reducers/selectors/session.selector';
import { Observable } from 'rxjs';
import { isEditMode } from '../../../../reducers/selectors/general.selector';
import { editModeSetDisabled } from '../../../../reducers/actions/general.actions';

@Component({
  selector: 'app-indicator-view',
  templateUrl: './indicator-view.component.html'
})
export class IndicatorViewComponent{

  Indicator : any; 

  IndicatorForm : FormGroup;

  ParameterSelected : number;

  editMode : Observable<boolean>;

  isAdmin : Observable<boolean>;

  DeleteBtn : () => void = ()=>{
      if(confirm('¿Está seguro que desea eliminar este Indicador?\n\nEsta acción no se puede deshacer.')){
        this._store.dispatch(fromLoadingActions.initLoading({message: 'Eliminando Indicador...'}));
        this._indicatorsService.deleteIndicator(this.Indicator._id);
      }
    }

  constructor(private _activatedRoute : ActivatedRoute,
              private _indicatorsService : IndicatorsServiceService,
              private _store : Store<State>) { 
    this.isAdmin = this._store.select(isAdmin);
    this.editMode = this._store.select(isEditMode);
    this._activatedRoute.params.subscribe(
      (params : Params) => {
        this._indicatorsService.getIndicatorsLocal().subscribe((indicators : any[]) => this.Indicator = indicators.filter(indicator => indicator._id == params.id)[0]);
        this.getFormFromIndicator();
      }
    );
  }

  getFormFromIndicator(){
    if(this.Indicator.type == 'Simple'){
      let description : string;
      if(this.Indicator.description) description = this.Indicator.description;
      else description = '';
      this.IndicatorForm = new FormGroup({
        name: new FormControl(this.Indicator.name,[Validators.required,MyValidators.isBlank]),
        type : new FormControl(this.Indicator.type,Validators.required),
        antiquity_diff: new FormControl(this.Indicator.antiquity_diff),
        parameters_schema: new FormArray([]),
        description: new FormControl(description,[Validators.required,MyValidators.isBlank]),
        frequency: new FormControl(this.Indicator.frequency)
      });
    }else{
      this.IndicatorForm = new FormGroup({
        name: new FormControl(this.Indicator.name,[Validators.required,MyValidators.isBlank]),
        type : new FormControl(this.Indicator.type,Validators.required),
        antiquity_diff: new FormControl(this.Indicator.antiquity_diff),
        record_schema: new FormArray([]),
        parameters_schema: new FormArray([]),
        frequency: new FormControl(this.Indicator.frequency)
      });
      this.Indicator.record_schema.forEach(field => {
        (<FormArray> this.IndicatorForm.controls.record_schema).push(new FormGroup({
          name: new FormControl(field.name,[Validators.required,MyValidators.isBlank]),
          unit: new FormControl(field.unit,[Validators.required])
        }));
      });

      
    }
    this.Indicator.parameters_schema.forEach((parameter,i) => {
      let weighing : any = {};
      if(!parameter.weighing[0].weight) weighing.weight = 0;
      else weighing.weight = parameter.weighing[0].weight;
      if(!parameter.weighing[0].older) weighing.older = 0;
      else weighing.older = parameter.weighing[0].older;
      if(!parameter.weighing[0].newer) weighing.newer = 0;
      else weighing.newer = parameter.weighing[0].newer;
      (<FormArray> this.IndicatorForm.controls.parameters_schema).push(new FormGroup({
          name: new FormControl(parameter.name,Validators.required),
          weighing: new FormArray([new FormGroup({
            weight: new FormControl(weighing.weight),
            older: new FormControl(weighing.older),
            newer: new FormControl(weighing.newer),
          })]),
          isAcum: new FormControl(parameter.isAcum,Validators.required),
          unit: new FormControl(parameter.unit,Validators.required),
          definition: new FormArray([]),
        }));
        parameter.definition.forEach(operator => {
          (<FormArray> this.IndicatorForm.controls.parameters_schema['controls'][i].controls.definition).push(new FormGroup({
            type: new FormControl(operator.type,Validators.required),
            value: new FormControl(operator.value,Validators.required)
          }));
        });
    });

  }

  saveIndicator(){
    this._store.dispatch(fromLoadingActions.initLoading({message: 'Guardando los cambios en el Indicador...'}));
    let body : any = this.IndicatorForm.value;
    console.log(body);
    if(body.type == 'Simple'){
      if(!this.IndicatorForm.valid){
        this._store.dispatch(fromLoadingActions.stopLoading());
        return alert('Todos los campos son obligatorios, por favor, revise el formulario.');
      }
    }else{ //Indicador Compuesto
      let flag : string;
      body.parameters_schema.forEach((parameter : any) => {
        if(!parameter.definition.length) return flag = 'Debe definir todos los parámetros del Indicador.';
      });
      if(flag) {
        this._store.dispatch(fromLoadingActions.stopLoading());
        return alert(flag);
      }
      let suma : any = {
        older: 0,
        newer: 0,
        none: 0
      }
      body.parameters_schema.forEach(parameter => {
        if(body.antiquity_diff){
          suma.older += parseInt(parameter.weighing[0].older);
          suma.newer += parseInt(parameter.weighing[0].newer);
          if(parameter.weighing[0].newer == null || parameter.weighing[0].older == null) return flag = 'Debe completar todas las ponderaciones solicitadas.';
        }else{
          suma.none += parseInt(parameter.weighing[0].weight);
          if(parameter.weighing[0].weight == null) return flag = 'Debe completar todas las ponderaciones solicitadas.';
        }
      });
      if(flag) {
        this._store.dispatch(fromLoadingActions.stopLoading());
        return alert(flag);
      }
      
      if(body.antiquity_diff && (suma.older != 100 || suma.newer != 100)) flag = 'La ponderación debe sumar 100% en total.';
      if(!body.antiquity_diff && suma.none != 100) flag = 'La ponderación debe sumar 100% en total.';
      if(flag) {
        this._store.dispatch(fromLoadingActions.stopLoading());
        return alert(flag);
      }

      if(this.IndicatorForm.invalid){
        this._store.dispatch(fromLoadingActions.stopLoading());
        return alert('Todos los campos son obligatorios, por favor, revise el formulario');
      }
    }
    this._indicatorsService.updateIndicator(body,this.Indicator._id);
  }
  
  addParameter(){
    (<FormArray>this.IndicatorForm.controls.parameters_schema).push(new FormGroup({
        name: new FormControl('',Validators.required),
        weighing: new FormArray([new FormGroup({
          weight: new FormControl(''),
          older: new FormControl(''),
          newer: new FormControl(''),
        })]),
        isAcum: new FormControl(false,Validators.required),
        unit: new FormControl('',Validators.required),
        definition: new FormArray([])
      })
    );
  }
  

  addField(){
    (<FormArray>this.IndicatorForm.controls.record_schema).push(new FormGroup({
      name: new FormControl('',[Validators.required,MyValidators.isBlank]),
      unit: new FormControl('',[Validators.required])
    }));
  }

  cancel(){
    if(confirm('Los cambios no guardados se borrarán.\n\n¿Está seguro que desea cancelar la Edición?')){
      this._store.dispatch(editModeSetDisabled());
      this.getFormFromIndicator();
    }
  }

  addOperator(operator : string){
    if(operator == '+' || operator == '-' || operator == '*' ||
       operator == '/' || operator == '(' || operator == ')' || operator == '*100%'){
     (<FormArray> this.IndicatorForm.controls.parameters_schema['controls'][this.ParameterSelected]['controls']['definition']).push(new FormGroup({
       type: new FormControl('normal'),
       value: new FormControl(operator)
     }));
    }else{
     (<FormArray> this.IndicatorForm.controls.parameters_schema['controls'][this.ParameterSelected]['controls']['definition']).push(new FormGroup({
       type: new FormControl(operator),
       value: new FormControl('',Validators.required)
     }));
    }
 }

  addFieldToDefinition(value : string){
    (<FormArray> this.IndicatorForm.controls.parameters_schema['controls'][this.ParameterSelected]['controls']['definition']).push(new FormGroup({
      type: new FormControl('field'),
      value: new FormControl(value,Validators.required)
    }));
  }

  remove(index : number){
    (<FormArray> this.IndicatorForm.controls.parameters_schema['controls'][this.ParameterSelected].controls.definition).removeAt(index)
  }

}
