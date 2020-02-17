import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { SisiCoreService } from '../../../../services/sisi-core.service';
import { MatSelectionList } from '@angular/material/list';

import { convertSize, getTypeFromExt } from '../../../shared/upload-box/upload-box.component';

import * as Moment from 'moment'
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-new-project',
  templateUrl: './new-project.component.html'
})
export class NewProjectComponent{

  Organizations : any[] = this._service.getOrganizationsOff();
  Funders : any[] = this._service.getFundersOff();
  Indicators : any[] = this._service.getIndicatorsOff(); 
  
  ProjectFormGroup : FormGroup;

  isValid : boolean = true;

  organizationsSelected : any = [];

  File : any; //Variable para la subida de la lista de usuarios

  /*Inicializando Formulario*/
  nameCtrl : FormControl = new FormControl('',[Validators.required,this._service.existProject,this._service.isBlank]);
  start_dateCtrl : FormControl = new FormControl('',[Validators.required,Validators.pattern(new RegExp(/^(0?[1-9]|[12][0-9]|3[01])[\/](0?[1-9]|1[012])[/\\/](19|20)\d{2}$/))]);
  durationCtrl : FormControl = new FormControl('',[Validators.required,Validators.pattern(new RegExp(/^\d{1,8}$/)),this._service.isBlank]);
  
  budgetCtrl : FormControl = new FormControl('',[Validators.required,Validators.pattern(new RegExp(/^\d{1,10}$/))]);
  ubicationCtrl : FormControl = new FormControl('',[Validators.required,this._service.isBlank]);
  beneficiariesNumberCtrl : FormControl = new FormControl('',[Validators.required,Validators.pattern(new RegExp(/^\d{1,8}$/))]);

  objGeneralCtrl : FormControl = new FormControl('',[Validators.required,this._service.isBlank]);
  objEspeCtrl : FormArray = new FormArray([new FormControl('',[Validators.required,this._service.isBlank])]);
  resultsCtrl : FormArray = new FormArray([new FormControl('',[Validators.required,this._service.isBlank])]);

  goalsCtrl : FormArray = new FormArray([]);
  fundersCtrl : FormArray = new FormArray([]);

  constructor(private _service : SisiCoreService,
              private _snackbar : MatSnackBar,
              private _Router : Router){
    this.ProjectFormGroup = new FormGroup({
      name: this.nameCtrl,
      start_date: this.start_dateCtrl,
      duration: this.durationCtrl,
      budgets: new FormGroup({
        total_inicial: this.budgetCtrl
      }),
      ubication: this.ubicationCtrl,
      beneficiaries: new FormGroup({
        number: this.beneficiariesNumberCtrl
      }),
      gen_objective: this.objGeneralCtrl,
      esp_objectives: this.objEspeCtrl,
      results: this.resultsCtrl,
      goals: this.goalsCtrl,
      funders: this.fundersCtrl
    });
  }

  addObjective(){
    (<FormArray> this.objEspeCtrl).push(new FormControl('',[Validators.required,this._service.isBlank]));
  }

  addResult(){
    (<FormArray> this.resultsCtrl).push(new FormControl('',[Validators.required,this._service.isBlank]));
  }

  deleteObjective(index : number){
    if(confirm('¿Está seguro de que quiere eliminar este objetivo?')) (<FormArray> this.objEspeCtrl).removeAt(index);
  }

  deleteResult(index : number){
    if(confirm('¿Está seguro de que quiere eliminar este resultado?')) (<FormArray> this.resultsCtrl).removeAt(index);
  }

  /*Listeners para las listas de Selección de Funders, Indicators y Organizations*/
  OnIndicatorsListChange(id : string, list : MatSelectionList){
    let ready : boolean = false;
    let indice : number;
    for(let i = 0; i < (<FormArray> this.goalsCtrl).length; i++){
      if(this.goalsCtrl.controls[i].get('id').value == id){
        indice = i;
        ready = true;
        break;
      }
    }
    if(ready){//Hay que eliminar
      if(confirm('Esta acción no se puede deshacer.\n¿Está seguro que desea descartar este indicador?')) (<FormArray> this.goalsCtrl).removeAt(indice);
      else list.options.filter(option => option.value == id)[0].selected = true;
    }else{//Agregar
      let indicator : any = this.Indicators.filter(indicator => indicator._id == id)[0];
      let organizationsCtrl : FormArray = new FormArray([]);
      this.organizationsSelected.forEach(organization => {
        (<FormArray> organizationsCtrl).push(new FormGroup({
          organization: new FormControl(organization.name,[Validators.required]),
          id: new FormControl(organization.id,[Validators.required]),
          baseline: new FormControl('',[Validators.required,this._service.isBlank,Validators.pattern(new RegExp(/^\d{1,10}$/))]),
          goal: new FormControl('',[Validators.required,this._service.isBlank,Validators.pattern(new RegExp(/^\d{1,10}$/))])
        }));
      });
      (<FormArray> this.goalsCtrl).push(new FormGroup({
        indicator: new FormControl(indicator.name),
        id: new FormControl(indicator._id),
        organizations: organizationsCtrl
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
      for(let i = 0; i < this.goalsCtrl.length; i++){
        (<FormArray> this.goalsCtrl.controls[i].get('organizations')).push(new FormGroup({
          organization: new FormControl(organization.name,[Validators.required]),
          id: new FormControl(organization._id,[Validators.required]),
          baseline: new FormControl('',[Validators.required,this._service.isBlank,Validators.pattern(new RegExp(/^\d{1,10}$/))]),
          goal: new FormControl('',[Validators.required,this._service.isBlank,Validators.pattern(new RegExp(/^\d{1,10}$/))])
        }));
      }
    }
  }

  RemoveFromForm(index : number){
    for(let i = 0; i < this.goalsCtrl.length; i++){
      (<FormArray> this.goalsCtrl.controls[i].get('organizations')).removeAt(index);
    }
  }

  OnFundersListChange(id : string){
    (<FormArray> this.fundersCtrl).push(new FormControl(id,[Validators.required]));
  }

  createProject(){
    if(this.ProjectFormGroup.invalid || !this.File || !this.goalsCtrl.length || !this.fundersCtrl.length) return alert('Debe completar todo el formulario de registro de Proyectos!\n\nNo olvide asignar los financiadores, indicadores y organizaciones. Tampoco olvide seleccionar el archivo de lista de beneficiarios.')
    let project : any = this.ProjectFormGroup.value;
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
          let projects : any[];
          if(localStorage.getItem('projects')) projects = JSON.parse(localStorage.getItem('projects'));
          else projects = [];
          projects.push(result.project);
          localStorage.setItem('projects',JSON.stringify(projects));
          this.uploadBeneficiariesList(result.project._id).subscribe(
            result => {
              if(result.message =="CREATED"){
                this._service.updateProjectsList();
                this._service.updateOrganizationsList();
                this._service.updateFundersList();
                this._snackbar.open('Proyecto Resgistrado correctamente.','ENTENDIDO',{duration: 3000});
                this._Router.navigate([document.location.pathname.split('/')[1]])
              }
            },error => this._snackbar.open('Ha ocurrido un error al subir el archivo de Beneficiarios.','ENTENDIDO',{duration: 3000})
          );
        }
      },error => this._snackbar.open('Ocurrió un error al guardar el nuevo proyecto.','ENTENDIDO',{duration: 3000})
    )
  }

  prepareBeneficiariesList(event){
    if(event.target.files && event.target.files.length > 0){
      let file = event.target.files[0];
        let name = file.name.split('.');
        this.File = {
          name: name[0],
          folder: this.nameCtrl.value,
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
