import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { SisiCoreService } from '../../../../services/sisi-core.service';
import { MatSelectionList } from '@angular/material/list';

import { convertSize, getTypeFromExt } from '../../../shared/upload-box/upload-box.component';

import * as Moment from 'moment'
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { State } from '../../../../reducers/index';
import * as fromLoadingActions from '../../../../reducers/actions/loading.actions';

@Component({
  selector: 'app-new-project',
  templateUrl: './new-project.component.html'
})
export class NewProjectComponent{

  Organizations : any[] = this._service.getOrganizationsOff();
  Funders : any[] = this._service.getFundersOff();
  Indicators : any[] = this._service.getIndicatorsOff(); 
  
  GeneralFormGroup : FormGroup;

  isValid : boolean = true;

  organizationsSelected : any = [];
  indicatorsSelected : any = [];

  File : any; //Variable para la subida de la lista de usuarios

  constructor(private _service : SisiCoreService,
              private _snackbar : MatSnackBar,
              private _store : Store<State>){
    this.GeneralFormGroup = new FormGroup({
      name: new FormControl('',[Validators.required,this._service.existProject,this._service.isBlank]),
      start_date: new FormControl('',[Validators.required,Validators.pattern(new RegExp(/^(0?[1-9]|[12][0-9]|3[01])[\/](0?[1-9]|1[012])[/\\/](19|20)\d{2}$/))]),
      duration: new FormControl('',[Validators.required,Validators.pattern(new RegExp(/^\d{1,8}$/)),this._service.isBlank]),
      budgets: new FormGroup({
        total_inicial: new FormControl('',[Validators.required,Validators.pattern(new RegExp(/^\d{1,10}$/))])
      }),
      ubication: new FormControl('',[Validators.required,this._service.isBlank]),
      beneficiaries: new FormGroup({
        number: new FormControl('',[Validators.required])
      }),
      gen_objective: new FormControl('',[Validators.required,this._service.isBlank]),
      esp_objectives: new FormArray([new FormControl('',[Validators.required,this._service.isBlank])]),
      results: new FormArray([new FormControl('',[Validators.required,this._service.isBlank])]),
      full_schema: new FormArray([]),
      organizations_diff: new FormArray([]),
      funders: new FormArray([])
    });
  }

  addObjective(){
    (<FormArray> this.GeneralFormGroup.get('esp_objectives')).push(new FormControl('',[Validators.required,this._service.isBlank]));
  }

  addResult(){
    (<FormArray> this.GeneralFormGroup.get('results')).push(new FormControl('',[Validators.required,this._service.isBlank]));
  }

  deleteObjective(index : number){
    if(confirm('¿Está seguro de que quiere eliminar este objetivo?')) (<FormArray> this.GeneralFormGroup.get('objEspeCtrl')).removeAt(index);
  }

  deleteResult(index : number){
    if(confirm('¿Está seguro de que quiere eliminar este resultado?')) (<FormArray> this.GeneralFormGroup.get('results')).removeAt(index);
  }

/**
 * -------------------------------------------------------------------------------------------
 * Schemas Table Data
 * -------------------------------------------------------------------------------------------
 */

  /*Listeners para las listas de Selección de Funders, Indicators y Organizations*/
  OnIndicatorsListChange(id : string, list : MatSelectionList){
    let ready : boolean = false;
    let indice : number;
    //Verificación de si el indicador estaba seleccionado o no
    for(let i = 0; i < (<FormArray> this.GeneralFormGroup.get('full_schema')).length; i++){
      if(this.GeneralFormGroup.get('full_schema')['controls'][i].get('id').value == id){
        indice = i;
        ready = true;
        break;
      }
    }
    if(ready){ //Hay que eliminar el indicador
      if(confirm('Esta acción no se puede deshacer.\n\n¿Está seguro que desea descartar este indicador?')){
        (<FormArray> this.GeneralFormGroup.get('full_schema')).removeAt(indice);
        this.indicatorsSelected.splice(indice,1);
      }else list.options.filter(option => option.value == id)[0].selected = true;
    }else{  //Hay que agregar el indicador
      let indicator : any = this.Indicators.filter(indicator => indicator._id == id)[0];
      this.indicatorsSelected.push({id: indicator._id,parameters: indicator.parameters_schema,antiquity_diff: indicator.antiquity_diff});
      let baselineCtrl : FormArray = new FormArray([]);      //LineaBase 
      for(let i = 0; i < this.organizationsSelected.length; i++){
        //Añadiendo inputs para la lineaBase
        (<FormArray> baselineCtrl).push(new FormGroup({
          organization: new FormControl(this.organizationsSelected[i].name),
          id: new FormControl(this.organizationsSelected[i].id),
          parameters: new FormArray([])
        }));
        for(let j = 0; j < indicator.parameters_schema.length; j++){
          (<FormArray> baselineCtrl.controls[i].get('parameters')).push(new FormGroup({
            name: new FormControl(indicator.parameters_schema[i]['name']),
            baseline: new FormControl('')
          }));
        }
      }
      
      if(indicator.antiquity_diff) (<FormArray> this.GeneralFormGroup.get('full_schema')).push(new FormGroup({
          indicator: new FormControl(indicator.name),
          id: new FormControl(indicator._id),
          goal: new FormGroup({
            older: new FormControl('',Validators.required),
            newer: new FormControl('',Validators.required)
          }),
          baseline: baselineCtrl,
          antiquity_diff: new FormControl(indicator.antiquity_diff)
        }));
      else (<FormArray> this.GeneralFormGroup.get('full_schema')).push(new FormGroup({
        indicator: new FormControl(indicator.name),
        id: new FormControl(indicator._id),
        goal: new FormGroup({
          goal: new FormControl('',Validators.required)
        }),
        baseline: baselineCtrl,
        antiquity_diff: new FormControl(indicator.antiquity_diff)
      }));
    }
  } 
  
  OnOrganizationsListChange(id : string, OrganizationsList : MatSelectionList){    
    let ready : boolean = false;
    this.organizationsSelected.forEach((organization, index) => {
      if(organization.id == id){ //Hay que quitar
        ready = true;
        if(confirm('Esta acción no se puede deshacer.\n¿Está seguro que desea descartar esta organización?')){
          this.organizationsSelected.splice(index,1); //Quitar del Array de organizaciones seleccionadas
          //Eliminar del Formulario
          return this.RemoveFromForm(index); 
        }else return OrganizationsList.options.filter(option => option.value == id)[0].selected = true;
      }
    });
    //Agregar
    if(!ready){
      let organization : any = this.Organizations.filter(organization => organization._id == id)[0];
      this.organizationsSelected.push({
        name: organization.name,
        id: organization._id
      });

      (<FormArray> this.GeneralFormGroup.get('organizations_diff')).push(new FormGroup({
        organization: new FormControl(organization.name),
        id: new FormControl(organization._id),
        isOlder: new FormControl('',Validators.required)
      }));

      for(let i = 0; i < (<FormArray>this.GeneralFormGroup.get('full_schema')).length; i++){

        let baselineCtrl : FormGroup = new FormGroup({
          organization: new FormControl(this.organizationsSelected[i].name),
          id: new FormControl(this.organizationsSelected[i].id),
          parameters: new FormArray([])
        });

        for(let j = 0; j < this.indicatorsSelected[i].parameters.length; j++){
          (<FormArray> baselineCtrl.get('parameters')).push(new FormGroup({
            name: new FormControl(this.indicatorsSelected[i].parameters[j]['name']),
            baseline: new FormControl('')
          }));
        }

        (<FormArray> this.GeneralFormGroup.get('full_schema')['controls'][i].get('baseline')).push(baselineCtrl);

      }
    }
  }

  RemoveFromForm(index : number){
    for(let i = 0; i < (<FormArray>this.GeneralFormGroup.get('full_schema')).length; i++){
      if(this.GeneralFormGroup.get('full_schema')['controls'][i].get('organization')) (<FormArray> this.GeneralFormGroup.get('full_schema')['controls'][i].get('organization')).removeAt(index);
      (<FormArray> this.GeneralFormGroup.get('full_schema')['controls'][i].get('baseline')).removeAt(index);
    }
  }

  OnFundersListChange(id : string){
    (<FormArray> this.GeneralFormGroup.get('funders')).push(new FormControl(id,[Validators.required]));
  }

  createProject(){
    this._store.dispatch(fromLoadingActions.initLoading({message: 'Guardando el proyecto...'}));
    if(this.GeneralFormGroup.invalid || !this.File || !this.indicatorsSelected.length || !this.organizationsSelected.length || !(<FormArray> this.GeneralFormGroup.get('funders')).length){
      this._store.dispatch(fromLoadingActions.stopLoading());
      return alert('Debe completar todo el formulario de registro de Proyectos!\n\nNo olvide asignar los financiadores, indicadores y organizaciones. Tampoco olvide seleccionar el archivo de lista de beneficiarios.')
    }
    let project : any = this.GeneralFormGroup.value;
    project.indicators = [];
    project.organizations = [];
    for(let i = 0; i < project.goals.length; i++){
      project.indicators.push(project.goals[i].id);
    }
    for(let i = 0; i < project.goals[0].organizations.length; i++){
      project.organizations.push(project.goals[0].organizations[i].id);
    }
    this._service.createProject(project).subscribe(
      result => {
        if(result.message == 'CREATED') {
          this.uploadBeneficiariesList(result.project._id).subscribe(
            result => {
              if(result.message =="CREATED"){
                this._service.updateOrganizationsList(null);
                this._service.updateFundersList(null);
                this._service.updateProjectsList(true);
                this._store.dispatch(fromLoadingActions.stopLoading());
                this._snackbar.open('Proyecto Registrado correctamente.','ENTENDIDO',{duration: 3000});
              }
            },error => {
              this._store.dispatch(fromLoadingActions.stopLoading());
              this._snackbar.open('Ha ocurrido un error al subir el archivo de Beneficiarios.','ENTENDIDO',{duration: 3000})
            }
          );
        }
      },error => {
        this._store.dispatch(fromLoadingActions.stopLoading());
        this._snackbar.open('Ocurrió un error al guardar el nuevo proyecto.','ENTENDIDO',{duration: 3000})
      }
    )
  }

  prepareBeneficiariesList(event){
    if(event.target.files && event.target.files.length > 0){
      let file = event.target.files[0];
        let name = file.name.split('.');
        this.File = {
          name: name[0],
          folder: this.GeneralFormGroup.get('name').value,
          file: file.name,
          ext: name[1],
          type: getTypeFromExt(name[1]),
          description: 'descripcion',
          tamaño: convertSize(file.size),
          fileObj: file 
        };
      }
  }

  uploadBeneficiariesList(id) : Observable<any>{
    let filesForm = new FormData();
    let details = [];
    let name = `${this.File.name.replace(/ /g,'-')}_${Moment.now()}.${this.File.ext}`;
        filesForm.append('multi-files',this.File.fileObj,name);
        details.push({
          name: this.File.name,
          folder: id,
          type: this.File.type,
          file: name,
          ext: this.File.ext,
          size: this.File.tamaño,
          entity: 'Proyectos'
        });
    filesForm.append('details',JSON.stringify(details));
    filesForm.append('entity','Project');
    filesForm.append('id',id);
    return this._service.uploadFile(filesForm);
  }

}
