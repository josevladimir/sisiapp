import { Component } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { SisiCoreService } from '../../../../services/sisi-core.service';
import { FormGroup, Validators, FormControl, FormArray } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ToolbarButton } from '../../../shared/sub-toolbar/sub-toolbar.component';

@Component({
  selector: 'app-indicator-view',
  templateUrl: './indicator-view.component.html'
})
export class IndicatorViewComponent{

  Indicator : any;

  IndicatorForm : FormGroup;

  ParameterSelected : number;

  editMode : boolean;

  userRole : string = localStorage.getItem('userRole');

  isWorking : boolean = false;
  loadingMessage : string = '';

  DeleteBtn : ToolbarButton = {
    hasIcon: true,
    icon: 'delete',
    handler: ()=>{
      if(confirm('¿Está seguro que desea eliminar este Indicador?\n\nEsta acción no se puede deshacer.')){
        this.loadingMessage = 'Eliminando Indicador...';
        this.isWorking = true;
        this._service.deleteIndicator(this.Indicator._id).subscribe(
        result => {
          if(result.message == 'DELETED'){
            this._service.updateIndicatorsList(true);
            this.isWorking = false;
            this._snackBar.open('Se eliminó el Indicador correctamente.','ENTENDIDO',{duration: 3000});
          }
        },error => {
          this.isWorking = false;
          this._snackBar.open('Ocurrió un error al eliminar el Indicador.','ENTENDIDO',{duration: 3000})
        }
      )
      }
    },
    message: 'ELIMINAR'
  }

  constructor(private _activatedRoute : ActivatedRoute,
              private _service : SisiCoreService,
              private _snackBar : MatSnackBar) { 
    this._activatedRoute.params.subscribe(
      (params : Params) => {
        this.Indicator = this._service.getIndicator(params.id);
        this.editMode = false;
        this.getFormFromIndicator();
      }
    );
  }

  getFormFromIndicator(){
    console.log(this.Indicator);
    if(this.Indicator.type == 'Simple'){
      let description : string;
      if(this.Indicator.description) description = this.Indicator.description;
      else description = '';
      this.IndicatorForm = new FormGroup({
        name: new FormControl(this.Indicator.name,[Validators.required,this._service.isBlank]),
        type : new FormControl(this.Indicator.type,Validators.required),
        antiquity_diff: new FormControl(this.Indicator.antiquity_diff),
        parameters_schema: new FormArray([]),
        description: new FormControl(description,[Validators.required,this._service.isBlank])
      });
    }else{
      this.IndicatorForm = new FormGroup({
        name: new FormControl(this.Indicator.name,[Validators.required,this._service.isBlank]),
        type : new FormControl(this.Indicator.type,Validators.required),
        antiquity_diff: new FormControl(this.Indicator.antiquity_diff),
        record_schema: new FormArray([]),
        parameters_schema: new FormArray([])
      });
      this.Indicator.record_schema.forEach(field => {
        (<FormArray> this.IndicatorForm.controls.record_schema).push(new FormGroup({
          name: new FormControl(field.name,[Validators.required,this._service.isBlank]),
          frequency: new FormControl(field.frequency,[Validators.required]),
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
          frequency: new FormControl('')
        }));
        parameter.definition.forEach(operator => {
          (<FormArray> this.IndicatorForm.controls.parameters_schema['controls'][i].controls.definition).push(new FormControl(operator,Validators.required))
        });
    });
    console.log(this.IndicatorForm.value);

  }

  setEditMode(){
    this.editMode = true;
  }

  saveIndicator(){
    this.loadingMessage = 'Guardando los cambios en el Indicador...';
    this.isWorking = true;
    let body : any = this.IndicatorForm.value;
    console.log(body);
    if(body.type == 'Simple'){
      if(!this.IndicatorForm.valid){
        this.isWorking = false;
        return alert('Todos los campos son obligatorios, por favor, revise el formulario.');
      }
    }else{ //Indicador Compuesto
      let flag : string;
      body.parameters_schema.forEach((parameter : any) => {
        if(!parameter.definition.length) return flag = 'Debe definir todos los parámetros del Indicador.';
      });
      if(flag) {
        this.isWorking = false;
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
        this.isWorking = false;
        return alert(flag);
      }
      
      if(body.antiquity_diff && (suma.older != 100 || suma.newer != 100)) flag = 'La ponderación debe sumar 100% en total.';
      if(!body.antiquity_diff && suma.none != 100) flag = 'La ponderación debe sumar 100% en total.';
      if(flag) {
        this.isWorking = false;
        return alert(flag);
      }

      if(this.IndicatorForm.invalid){
        this.isWorking = false;
        return alert('Todos los campos son obligatorios, por favor, revise el formulario');
      }
    }
    this._service.updateIndicator(body,this.Indicator._id).subscribe(
      result => {
        if(result.message == 'UPDATED'){
          this.Indicator = result.indicator;
          this.editMode = false;
          this.getFormFromIndicator();
          this._service.updateIndicatorsList(null);
          this.isWorking = false;
          this._snackBar.open('Se ha modificado el indicador correctamente.','ENTENDIDO',{duration: 3000});
        }
      },error => {
        this.isWorking = false;
        this._snackBar.open('Ha ocurrido un error al actualizar el indicador.','ENTENDIDO',{duration: 3000});
      }
    );
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
      name: new FormControl('',[Validators.required,this._service.isBlank]),
      frequency: new FormControl('',[Validators.required]),
      unit: new FormControl('',[Validators.required])
    }));
  }

  cancel(){
    if(confirm('Los cambios no guardados se borrarán.\n\n¿Está seguro que desea cancelar la Edición?')){
      this.editMode = false;
      this.getFormFromIndicator();
    }
  }

  addOperator(operator : string){
    (<FormArray> this.IndicatorForm.controls.parameters_schema['controls'][this.ParameterSelected].controls.definition).push(new FormControl(operator));
  }

  addFieldToDefinition(value : string){
    (<FormArray> this.IndicatorForm.controls.parameters_schema['controls'][this.ParameterSelected].controls.definition).push(new FormControl(value));
  }

  remove(index : number){
    (<FormArray> this.IndicatorForm.controls.parameters_schema['controls'][this.ParameterSelected].controls.definition).removeAt(index)
  }

}
