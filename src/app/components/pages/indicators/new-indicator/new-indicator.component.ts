import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { State } from 'src/app/reducers';
import * as fromLoadingActions from '../../../../reducers/actions/loading.actions';
import { IndicatorsServiceService } from '../../../../services/indicators-service.service';
import { MyValidators } from '../../../../models/Validators';
import { StorageMap } from '@ngx-pwa/local-storage';
import { Observable } from 'rxjs';
import { MatSelectionList } from '@angular/material/list';

@Component({
  selector: 'app-new-indicator',
  templateUrl: './new-indicator.component.html'
})
export class NewIndicatorComponent{

  IndicatorForm : FormGroup;

  parameterSelected : number = 0;

  preferencias : Observable<any> = this.storage.get('preferences');

  constructor(private storage : StorageMap,
              private store : Store<State>,
              private indicatorService : IndicatorsServiceService,
              private Router : Router){
    this.IndicatorForm = new FormGroup({
      name: new FormControl('',Validators.required),
      type: new FormControl('Simple'),
      frequency: new FormControl('',Validators.required),
      description: new FormControl(''),
      record_schema: new FormArray([]),
      parameters_schema: new FormArray([
        new FormGroup({
          name: new FormControl('',Validators.required),
          definition: new FormArray([]),
          weighing: new FormGroup({
            weight: new FormControl(''),
            older: new FormControl(''),
            newer: new FormControl('')
          }),
          unit: new FormControl('',Validators.required),
          cualitative_levels: new FormArray([]),
          description: new FormControl(''),
          haveSchema: new FormControl(false),
          haveCualitativeSchema: new FormControl(false),
          record_schema: new FormArray([]),
          calculate_as: new FormControl('Sumatoria')
        })
      ]),
      antiquity_diff: new FormControl(false),
      haveSchema: new FormControl(false),
      organizations_diff: new FormControl(false),
      organizations_diff_by: new FormControl(''),
      organizations: new FormArray([])
    });
  }

  onChangeIndicatorType (value) {
    console.log(value);
    if(value == 'Compuesto') (<FormArray> this.IndicatorForm.get('record_schema')).push(new FormGroup({
        name: new FormControl('',Validators.required),
        unit: new FormControl('',Validators.required)
      }));
    else{
      let longitud : number = (<FormArray> this.IndicatorForm.get('record_schema')).length;
      if(longitud){
        for(let i = longitud - 1; i >= 0; i--){
          (<FormArray> this.IndicatorForm.get('record_schema')).removeAt(i);
        }
      }
    }
  }

  onChangeHaveSchema (Pindex,value) {
    if(value.checked){
      this.addFieldInParameter(Pindex);
    }else {
      let longitud : number = (<FormArray> (<FormArray> this.IndicatorForm.get('parameters_schema')).at(Pindex).get('record_schema')).length;
      if(longitud){
        for(let i = longitud - 1; i >= 0; i--){
          (<FormArray> (<FormArray> this.IndicatorForm.get('parameters_schema')).at(Pindex).get('record_schema')).removeAt(i);
        }
      }
    }
  }

  onChangeHaveCualitativeSchema (Pindex,value) {
    if(value.checked){
      this.addFieldInParameter(Pindex);
    }else {
      let longitud : number = (<FormArray> (<FormArray> this.IndicatorForm.get('parameters_schema')).at(Pindex).get('record_schema')).length;
      if(longitud){
        for(let i = longitud - 1; i >= 0; i--){
          (<FormArray> (<FormArray> this.IndicatorForm.get('parameters_schema')).at(Pindex).get('record_schema')).removeAt(i);
        }
      }
    }
  }

  onChangeParameterUnit (Pindex,value) {
    if(value == 'Cualitativo'){
      this.addLevel(Pindex);
      (<FormArray> this.IndicatorForm.get('parameters_schema')).at(Pindex).get('haveSchema').setValue(false);
      let longitud : number = (<FormArray> (<FormArray> this.IndicatorForm.get('parameters_schema')).at(Pindex).get('record_schema')).length;
      if(longitud){
        for(let i = longitud - 1; i >= 0; i--){
          (<FormArray> (<FormArray> this.IndicatorForm.get('parameters_schema')).at(Pindex).get('record_schema')).removeAt(i);
        }
      }
    }else {
      (<FormArray> this.IndicatorForm.get('parameters_schema')).at(Pindex).get('haveCualitativeSchema').setValue(false);
      let longitud : number = (<FormArray> (<FormArray> this.IndicatorForm.get('parameters_schema')).at(Pindex).get('cualitative_levels')).length;
      if(longitud){
        for(let i = longitud - 1; i >= 0; i--){
          (<FormArray> (<FormArray> this.IndicatorForm.get('parameters_schema')).at(Pindex).get('cualitative_levels')).removeAt(i);
        }
      }
    }
  }

  addParameter () {
    (<FormArray> this.IndicatorForm.get('parameters_schema')).push(new FormGroup({
      name: new FormControl('',Validators.required),
      definition: new FormArray([]),
      weighing: new FormGroup({
        weight: new FormControl(''),
        older: new FormControl(''),
        newer: new FormControl('')
      }),
      unit: new FormControl('',Validators.required),
      cualitative_levels: new FormArray([]),
      description: new FormControl(''),
      haveSchema: new FormControl(false),
      haveCualitativeSchema: new FormControl(false),
      record_schema: new FormArray([]),
      calculate_as: new FormControl('Sumatoria')
    }));
  }

  addField () {
    (<FormArray> this.IndicatorForm.get('record_schema')).push(new FormGroup({
      name: new FormControl('',Validators.required),
      unit: new FormControl('',Validators.required)
    }));
  }

  addFieldInParameter (Pindex : number) {
    (<FormArray> (<FormArray> this.IndicatorForm.get('parameters_schema')).at(Pindex).get('record_schema')).push(new FormGroup({
      name: new FormControl('',Validators.required),
      unit: new FormControl('',Validators.required)
    }));
  }
  
  addLevel (Pindex : number) {
    (<FormArray> (<FormArray> this.IndicatorForm.get('parameters_schema')).at(Pindex).get('cualitative_levels')).push(new FormGroup({
      name: new FormControl('',Validators.required),
      description: new FormControl('',Validators.required),
      range: new FormGroup({
        from: new FormControl('',Validators.required),
        to: new FormControl('',Validators.required)
      })
    }));
  }

  addFieldToDefinitionSimple(Pindex : number, value : string){
    (<FormArray> (<FormArray> this.IndicatorForm.get('parameters_schema')).at(Pindex).get('definition')).push(new FormGroup({
      type: new FormControl('field'),
      value: new FormControl(value,Validators.required)
    }));
  }

  addOperatorSimple(Pindex : number, operator : string){
    if(operator == '+' || operator == '-' || operator == '*' || operator == 'LB' ||
       operator == '/' || operator == '(' || operator == ')' || operator == '*100%' || operator == 'ANT'){
      (<FormArray> (<FormArray> this.IndicatorForm.get('parameters_schema')).at(Pindex).get('definition')).push(new FormGroup({
        type: new FormControl('normal'),
        value: new FormControl(operator)
      }));
    }else{
      (<FormArray> (<FormArray> this.IndicatorForm.get('parameters_schema')).at(Pindex).get('definition')).push(new FormGroup({
        type: new FormControl(operator),
        value: new FormControl('',Validators.required)
      }));
    }
  }

  removeParameter (Pindex : number) {
    if(confirm('Esta acción no se puede deshacer.\n\n¿Está seguro que desea eliminar este indicador?')) (<FormArray> this.IndicatorForm.get('parameters_schema')).removeAt(Pindex);
  }

  removeFieldGeneral (index : number) {
    if(confirm('Esta acción no se puede deshacer.\n\n¿Está seguro que desea eliminar este indicador?')) (<FormArray> this.IndicatorForm.get('record_schema')).removeAt(index);
  }

  removeFieldInParameter (Pindex : number, Findex : number) {
    if(confirm('Esta acción no se puede deshacer.\n\n¿Está seguro que desea eliminar este campo?')) (<FormArray> (<FormArray> this.IndicatorForm.get('parameters_schema')).at(Pindex).get('record_schema')).removeAt(Findex);
  }
  
  removeLevel (Pindex : number,Lindex : number) {
    if(confirm('Esta acción no se puede deshacer.\n\n¿Está seguro que desea eliminar este nivel?')) (<FormArray> (<FormArray> this.IndicatorForm.get('parameters_schema')).at(Pindex).get('cualitative_levels')).removeAt(Lindex);
  }

  removeFieldFromDefinitionSimple(Pindex: number,index : number){
    (<FormArray> (<FormArray> this.IndicatorForm.get('parameters_schema')).at(Pindex).get('definition')).removeAt(index);
  }

  removeFieldFromDefinition(Pindex: number,index : number){
    (<FormArray> (<FormArray> this.IndicatorForm.get('parameters_schema')).at(Pindex).get('definition')).removeAt(index);
  }

  saveIndicator(){
    this.store.dispatch(fromLoadingActions.initLoading({message: 'Guardando el Indicador...'}));

    if(this.IndicatorForm.get('organizations_diff').value && this.IndicatorForm.get('organizations_diff_by').value != 'CEFODI' && !(<FormArray> this.IndicatorForm.get('organizations')).length){
      this.store.dispatch(fromLoadingActions.stopLoading());
      return alert('Por favor selecciona las organizaciones que entrarán en el cálculo del Indicador');
    }

    if(this.IndicatorForm.get('type').value == 'Compuesto'){
      let total : any = {newer: 0, older: 0, weight: 0};
      let diff : boolean = this.IndicatorForm.get('antiquity_diff').value;
      for(let i = 0; i < (<FormArray> this.IndicatorForm.get('parameters_schema')).length; i++){
        if(diff){
          total.newer += (<FormArray> this.IndicatorForm.get('parameters_schema')).at(i).get('weighing').get('newer').value;
          total.older += (<FormArray> this.IndicatorForm.get('parameters_schema')).at(i).get('weighing').get('older').value;
        }else total.weight += (<FormArray> this.IndicatorForm.get('parameters_schema')).at(i).get('weighing').get('weight').value;
      }

      if(diff && (total.older != 100 || total.newer != 100)){
        this.store.dispatch(fromLoadingActions.stopLoading());
        return alert('La suma de las ponderaciones debe ser igual a 100%');
      }else if(!diff && total.weight != 100){
        this.store.dispatch(fromLoadingActions.stopLoading());
        return alert('La suma de las ponderaciones deben ser igual a 100%');
      }
    }
    this.indicatorService.createIndicator(this.IndicatorForm.value);
  }

  cancel(){
    if(confirm('Los cambios no guardados se borrarán.\n\n¿Está seguro que desea salir?')) this.Router.navigate(['/indicators']);
  }

  /**Add Sectors & Types */
  OnOrganizationsChange(item : string, list : MatSelectionList){
    let ready : boolean = false;
    let indice : number;
    //Verificación de si el indicador estaba seleccionado o no
    for(let i = 0; i < (<FormArray> this.IndicatorForm.get('organizations')).length; i++){
      if((<FormArray> this.IndicatorForm.get('organizations')).at(i).value == item){
        indice = i;
        ready = true;
        break;
      }
    }

    if(ready){ //Hay que eliminar el indicador
      (<FormArray> this.IndicatorForm.get('organizations')).removeAt(indice);
    }else{  //Hay que agregar el indicador
      (<FormArray> this.IndicatorForm.get('organizations')).push(new FormControl(item,Validators.required));
    }
  }

  OnChangeSelect(value){
    if(value.checked){
      let longitud = (<FormArray> this.IndicatorForm.get('organizations')).length;
      for(let i = longitud - 1; i >= 0; i--){
        (<FormArray> this.IndicatorForm.get('organizations')).removeAt(i);
      }
    }
  }

  selectOrganizations(value){
    let longitud : number = (<FormArray> this.IndicatorForm.get('organizations')).length - 1;
    for(let i = longitud; i >= 0; i--){
      (<FormArray> this.IndicatorForm.get('organizations')).removeAt(i);
    }
    (<FormArray> this.IndicatorForm.get('organizations')).push(new FormControl(value));
  }

}
