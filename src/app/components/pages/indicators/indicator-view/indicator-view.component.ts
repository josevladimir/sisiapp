import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { State } from 'src/app/reducers';
import * as fromLoadingActions from '../../../../reducers/actions/loading.actions';
import { ActivatedRoute, Params } from '@angular/router';
import { IndicatorsServiceService } from '../../../../services/indicators-service.service';
import { FormGroup, Validators, FormControl, FormArray } from '@angular/forms';
import { MyValidators } from '../../../../models/Validators';
import { isAdmin } from '../../../../reducers/selectors/session.selector';
import { Observable } from 'rxjs';
import { isEditMode } from '../../../../reducers/selectors/general.selector';
import { editModeSetDisabled } from '../../../../reducers/actions/general.actions';
import { StorageMap } from '@ngx-pwa/local-storage';
import { MatSelectionList } from '@angular/material/list';

@Component({
  selector: 'app-indicator-view',
  templateUrl: './indicator-view.component.html'
})
export class IndicatorViewComponent{

  Indicator : any;
  IndicatorForm : FormGroup;

  editMode : boolean;

  isAdmin : Observable<boolean>;

  parameterSelected : number = 0;


  preferencias : Observable<any> = this.storage.get('preferences');

  DeleteBtn : () => void = ()=>{
      if(confirm('¿Está seguro que desea eliminar este Indicador?\n\nEsta acción no se puede deshacer.')){
        this.store.dispatch(fromLoadingActions.initLoading({message: 'Eliminando Indicador...'}));
        this.indicatorService.deleteIndicator(this.Indicator._id);
      }
    }

  constructor(private store : Store<State>,
              private storage : StorageMap,
              private indicatorService : IndicatorsServiceService,
              private activatedRoute : ActivatedRoute){

    this.isAdmin = this.store.select(isAdmin);
    this.store.select(isEditMode).subscribe(editMode => {
      this.editMode = editMode;
      if(this.editMode) this.getFormFromIndicator();
    });
    this.activatedRoute.params.subscribe((params : Params) => this.indicatorService.getIndicatorsLocal().subscribe((indicators : any[]) => this.Indicator = indicators.filter(indicator => indicator._id == params.id)[0]));

  }

  getFormFromIndicator (){
    this.IndicatorForm = new FormGroup({
      name: new FormControl(this.Indicator.name,Validators.required),
      type: new FormControl({value: this.Indicator.type, disabled: true}),
      frequency: new FormControl(this.Indicator.frequency,Validators.required),
      description: new FormControl(this.Indicator.description),
      record_schema: new FormArray([]),
      parameters_schema: new FormArray([]),
      antiquity_diff: new FormControl(this.Indicator.antiquity_diff),
      haveSchema: new FormControl(this.Indicator.haveSchema),
      organizations_diff: new FormControl(this.Indicator.organizations_diff),
      organizations_diff_by: new FormControl(this.Indicator.organizations_diff_by),
      organizations: new FormArray([])
    });

    for(let i = 0; i < this.Indicator.record_schema.length; i++){
      (<FormArray> this.IndicatorForm.get('record_schema')).push(new FormGroup({
        name: new FormControl(this.Indicator.record_schema[i].name,Validators.required),
        unit: new FormControl(this.Indicator.record_schema[i].unit,Validators.required)
      }));
    }

    for(let i = 0; i < this.Indicator.organizations.length; i++){
      (<FormArray> this.IndicatorForm.get('organizations')).push(new FormControl(this.Indicator.organizations[i]));
    }

    for(let i = 0; i < this.Indicator.parameters_schema.length; i++){
      let weight : any = {};
      
      if(this.Indicator.parameters_schema[i].weighing.weight) weight.weight = this.Indicator.parameters_schema[i].weighing.weight;
      if(this.Indicator.parameters_schema[i].weighing.older) weight.older = this.Indicator.parameters_schema[i].weighing.older;
      if(this.Indicator.parameters_schema[i].weighing.newer) weight.newer = this.Indicator.parameters_schema[i].weighing.newer;
      
      (<FormArray> this.IndicatorForm.get('parameters_schema')).push(new FormGroup({
          name: new FormControl(this.Indicator.parameters_schema[i].name,Validators.required),
          definition: new FormArray([]),
          weighing: new FormGroup({
            weight: new FormControl(weight.weight),
            older: new FormControl(weight.older),
            newer: new FormControl(weight.newer)
          }),
          unit: new FormControl(this.Indicator.parameters_schema[i].unit,Validators.required),
          cualitative_levels: new FormArray([]),
          description: new FormControl(this.Indicator.parameters_schema[i].description),
          haveSchema: new FormControl(this.Indicator.parameters_schema[i].haveSchema),
          haveCualitativeSchema: new FormControl(this.Indicator.parameters_schema[i].haveCualitativeSchema),
          record_schema: new FormArray([]),
          calculate_as: new FormControl(this.Indicator.parameters_schema[i].calculate_as)
      }));

      for(let j = 0; j < this.Indicator.parameters_schema[i].definition.length; j++){
        (<FormArray> (<FormArray> this.IndicatorForm.get('parameters_schema')).at(i).get('definition')).push(new FormGroup({
          type: new FormControl(this.Indicator.parameters_schema[i].definition[j].type),
          value: new FormControl(this.Indicator.parameters_schema[i].definition[j].value)
        }));
      }

      for(let j = 0; j < this.Indicator.parameters_schema[i].cualitative_levels.length; j++){
        (<FormArray> (<FormArray> this.IndicatorForm.get('parameters_schema')).at(i).get('cualitative_levels')).push(new FormGroup({
          name: new FormControl(this.Indicator.parameters_schema[i].cualitative_levels[j].name,Validators.required),
          description: new FormControl(this.Indicator.parameters_schema[i].cualitative_levels[j].description,Validators.required),
          range: new FormGroup({
            from: new FormControl(this.Indicator.parameters_schema[i].cualitative_levels[j].range.from,Validators.required),
            to: new FormControl(this.Indicator.parameters_schema[i].cualitative_levels[j].range.to,Validators.required)
          })
        }));
      }

      for(let j = 0; j < this.Indicator.parameters_schema[i].record_schema.length; j++){
        (<FormArray> (<FormArray> this.IndicatorForm.get('parameters_schema')).at(i).get('record_schema')).push(new FormGroup({
          name: new FormControl(this.Indicator.parameters_schema[i].record_schema[j].name,Validators.required),
          unit: new FormControl(this.Indicator.parameters_schema[i].record_schema[j].unit,Validators.required)
        }));
      }
    }

    console.log(this.IndicatorForm);

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

  isTypeSelected(tipo){
    let isSelected = false;
    for(let i = 0; i < (<FormArray>this.IndicatorForm.get('organizations')).length; i++){
      console.log(this.Indicator.organizations[i]);
      if(tipo == (<FormArray> this.IndicatorForm.get('organizations')).at(i).value){
        isSelected = true;
        break;
      }
    }
    return isSelected;
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

  saveIndicator(){
    this.store.dispatch(fromLoadingActions.initLoading({message: 'Guardando el Indicador...'}));

    if(this.IndicatorForm.get('organizations_diff').value && !(<FormArray> this.IndicatorForm.get('organizations')).length){
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
    this.indicatorService.updateIndicator(this.IndicatorForm.value,this.Indicator._id);
  }
  
  cancel(){
    if(confirm('Los cambios no guardados se borrarán.\n\n¿Está seguro que desea cancelar la Edición?')){
      this.store.dispatch(editModeSetDisabled());
    }
  }

}
