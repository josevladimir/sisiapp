import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { MatSelectionList } from '@angular/material/list';

import { convertSize, getTypeFromExt } from '../../../shared/upload-box/upload-box.component';

import { Store } from '@ngrx/store';
import { State } from '../../../../reducers/index';
import * as Moment from 'moment'
import { Observable } from 'rxjs';
import { stopLoading } from '../../../../reducers/actions/loading.actions';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MyValidators } from '../../../../models/Validators';
import { SocketioService } from '../../../../services/socketio.service';
import * as fromLoadingActions from '../../../../reducers/actions/loading.actions';
import { FundersServiceService } from '../../../../services/funders-service.service';
import { ProjectsServiceService } from '../../../../services/projects-service.service';
import { DocumentsServiceService } from '../../../../services/documents-service.service';
import { IndicatorsServiceService } from '../../../../services/indicators-service.service';
import { OrganizationsServiceService } from '../../../../services/organizations-service.service';
import { StorageMap } from '@ngx-pwa/local-storage';

@Component({
  selector: 'app-new-project',
  templateUrl: './new-project.component.html'
})
export class NewProjectComponent{

  Funders : any[];
  Indicators : any[]; 
  Organizations : any[];
  
  GeneralFormGroup : FormGroup;

  isValid : boolean = true;

  organizationsSelected : any = [];
  indicatorsSelected : any = [];

  projectDuration : number;

  ExistIndicatorWithAntiquityDiff : boolean = false;

  File : any; //Variable para la subida de la lista de usuarios

  preferences : any;

  constructor(private snackBar : MatSnackBar,
              private fundersService : FundersServiceService,
              private projectsService : ProjectsServiceService,
              private documentsService : DocumentsServiceService,
              private storage : StorageMap,
              private sockets : SocketioService,
              private indicatorsService : IndicatorsServiceService,
              private organizationsService : OrganizationsServiceService,
              private store : Store<State>){

    this.projectDuration = 12;

    this.fundersService.getFundersLocal().subscribe(funders => this.Funders = funders);
    this.indicatorsService.getIndicatorsLocal().subscribe(indicators => this.Indicators = indicators);
    this.organizationsService.getOrganizationsLocal().subscribe(organizations => this.Organizations = organizations);

    this.storage.get('preferences').subscribe((result : any) => {
      this.preferences = {
        sectors: result.sectors,
        types: result.types
      }
    });

    this.GeneralFormGroup = new FormGroup({
      name: new FormControl('',[Validators.required,MyValidators.existProject,MyValidators.isBlank]),
      start_date: new FormControl(new Date(),[Validators.required]),
      monitoring_date: new FormControl(new Date(),[Validators.required]),
      duration: new FormControl(12,Validators.required),
      budgets: new FormGroup({
        total_inicial: new FormControl('',[Validators.required])
      }),
      ubication: new FormControl('',[Validators.required,MyValidators.isBlank]),
      beneficiaries: new FormGroup({
        number: new FormControl('',Validators.required)
      }),
      gen_objective: new FormControl('',[Validators.required,MyValidators.isBlank]),
      esp_objectives: new FormArray([new FormControl('',[Validators.required,MyValidators.isBlank])]),
      results: new FormArray([new FormControl('',[Validators.required,MyValidators.isBlank])]),
      full_schema: new FormArray([]),
      organizations_diff: new FormArray([]),
      funders: new FormArray([])
    });
  }

  addObjective = () => (<FormArray> this.GeneralFormGroup.get('esp_objectives')).push(new FormControl('',[Validators.required,MyValidators.isBlank]));

  addResult = () => (<FormArray> this.GeneralFormGroup.get('results')).push(new FormControl('',[Validators.required,MyValidators.isBlank]));

  deleteObjective = (index : number) => { if(confirm('¿Está seguro de que quiere eliminar este objetivo?')) (<FormArray> this.GeneralFormGroup.get('esp_objectives')).removeAt(index); }

  deleteResult = (index : number) => { if(confirm('¿Está seguro de que quiere eliminar este resultado?')) (<FormArray> this.GeneralFormGroup.get('results')).removeAt(index); }

  assignDate(event){
    this.GeneralFormGroup.get('monitoring_date').setValue(event.value);
  }

  setDuration () {

    if(this.indicatorsSelected.length){

      let duration_diff : number = (this.projectDuration) - (this.GeneralFormGroup.get('duration').value); //si es positivo hay que disminuir; si es negativo hay que aumentar.
  
      if(duration_diff > 0){ //Hay que disminuir
        
        for(let i = 0; i < this.indicatorsSelected.length; i++){
          
          if(this.projectDuration % 12){ //La duration anterior no era exacta en años
            duration_diff -= (this.projectDuration % 12);
            (<FormArray> (<FormArray> this.GeneralFormGroup.get('full_schema')).at(i).get('goal')).removeAt((this.projectDuration / 12) + 1);
          }

          for(let j = 0; j < Math.trunc(duration_diff/12); j++){
            let longitud : number = (<FormArray> (<FormArray> this.GeneralFormGroup.get('full_schema')).at(i).get('goal')).length;
            (<FormArray> (<FormArray> this.GeneralFormGroup.get('full_schema')).at(i).get('goal')).removeAt(longitud -1);
          }

          let exceso = Math.abs(duration_diff) % 12;
          if(exceso){
            let toAdd : number = 12 - (exceso);
            let inicioProyecto = Moment(new Date(this.GeneralFormGroup.get('monitoring_date').value));
            let longitud : number = (<FormArray> this.GeneralFormGroup.get('full_schema')['controls'][i].get('goal')).length;
            
            inicioProyecto.add(longitud - 2,'year');

            (<FormArray> (<FormArray> this.GeneralFormGroup.get('full_schema')).at(i).get('goal')).removeAt(longitud -1);

            (<FormArray> (<FormArray> this.GeneralFormGroup.get('full_schema')).at(i).get('goal')).push(this.addLastGoalToSchema(inicioProyecto,this.indicatorsSelected[i],toAdd)); 
          }

        }
        
      }else if(duration_diff < 0){ //Hay que aumentar
        duration_diff = Math.abs(duration_diff);

        for(let i = 0; i < this.indicatorsSelected.length; i++){

          let total_goals : number = (<FormArray> (<FormArray> this.GeneralFormGroup.get('full_schema')).at(i).get('goal')).length - 1;
          
          if(this.projectDuration % 12){ //La duración anterior no era exacta en años
            duration_diff = Math.abs((this.projectDuration) - (this.GeneralFormGroup.get('duration').value)) + (this.projectDuration % 12);
            (<FormArray> (<FormArray> this.GeneralFormGroup.get('full_schema')).at(i).get('goal')).removeAt(total_goals); //Deleting the last period
            total_goals = (<FormArray> (<FormArray> this.GeneralFormGroup.get('full_schema')).at(i).get('goal')).length - 1;
          }

          let inicioProyecto = Moment(new Date(this.GeneralFormGroup.get('monitoring_date').value));
          inicioProyecto.add(total_goals,'year');

          for(let a = 0; a < Math.trunc(duration_diff / 12); a++){
            let currentYearIndex : number = Math.trunc(this.projectDuration / 12) + a;
            (<FormArray> this.GeneralFormGroup.get('full_schema')['controls'][i].get('goal')).push(this.addGoalToSchema(currentYearIndex,this.indicatorsSelected[i],inicioProyecto));
          }
  
          let toAdd : number = duration_diff % 12;
          if(toAdd){
            (<FormArray> (<FormArray> this.GeneralFormGroup.get('full_schema')).at(i).get('goal')).push(this.addLastGoalToSchema(inicioProyecto,this.indicatorsSelected[i],toAdd));
          }
        }
      }

      this.projectDuration = this.GeneralFormGroup.get('duration').value;
  
    }else this.projectDuration = this.GeneralFormGroup.get('duration').value;

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

    if(ready){ //Si está, hay que eliminarlo
      if(confirm('Esta acción no se puede deshacer.\n\n¿Está seguro que desea descartar este indicador?')){
        (<FormArray> this.GeneralFormGroup.get('full_schema')).removeAt(indice);
        this.indicatorsSelected.splice(indice,1);
      }else list.options.filter(option => option.value == id)[0].selected = true;
    }

    else{ //No está, hay que añadirlo
      let indicador = this.Indicators.filter(indicator => indicator._id == id)[0];
      this.indicatorsSelected.push({
        id: indicador._id,
        parameters_schema: indicador.parameters_schema,
        antiquity_diff: indicador.antiquity_diff,
        organizations_diff: indicador.organizations_diff,
        organizations_diff_by: indicador.organizations_diff_by,
        organizations: indicador.organizations,
      });

      let indicatorGroup : FormGroup = new FormGroup({
        indicator: new FormControl(indicador.name),
        id: new FormControl(indicador._id),
        goal: new FormArray([]),
        baseline: new FormArray([]),
        antiquity_diff: new FormControl(indicador.antiquity_diff),
        baseline_diff: new FormGroup({
          type: new FormControl('individual'),
          by: new FormControl('')
        })
      });

      (<FormArray> indicatorGroup.get('baseline')).push(this.addOrgToBaseLine('First',indicador,true));

      let diferentiation : string = indicador.organizations_diff_by;
      if(diferentiation == 'CEFODI'){
        let baselineRow : FormArray = new FormArray([]);
            (<FormArray> baselineRow).push(new FormControl('CEFODI'));
            (<FormArray> baselineRow).push(new FormControl('CEFODI'));
  
            for(let k = 0; k < indicador.parameters_schema.length; k++){
              (<FormArray> baselineRow).push(new FormControl(''));
            }
  
            (<FormArray> indicatorGroup.get('baseline')).push(baselineRow);
  
      }

      for(let i = 0; i < this.organizationsSelected.length; i++){
        if(indicador.organizations_diff){
          if(diferentiation != 'characteristic'){
            for(let j = 0; j < indicador.organizations.length; j++){
              if(this.organizationsSelected[i][diferentiation] == indicador.organizations[j]) (<FormArray> indicatorGroup.get('baseline')).push(this.addOrgToBaseLine(this.organizationsSelected[i],indicador));
            }
          }else{
            switch (indicador.organizations[0]) {
              case 'Con Negocios':
                if(this.organizationsSelected[i].with_business == 'Si') (<FormArray> indicatorGroup.get('baseline')).push(this.addOrgToBaseLine(this.organizationsSelected[i],indicador));
                break;
              case 'Sin Negocios':
                if(this.organizationsSelected[i].with_business == 'No') (<FormArray> indicatorGroup.get('baseline')).push(this.addOrgToBaseLine(this.organizationsSelected[i],indicador));
                break;
              case 'Legalizadas':
                if(this.organizationsSelected[i].legalized) (<FormArray> indicatorGroup.get('baseline')).push(this.addOrgToBaseLine(this.organizationsSelected[i],indicador));
                break;
              case 'No Legalizadas':
                if(!this.organizationsSelected[i].legalized) (<FormArray> indicatorGroup.get('baseline')).push(this.addOrgToBaseLine(this.organizationsSelected[i],indicador));
                break;
              default:
                break;
            }
          }
        }else (<FormArray> indicatorGroup.get('baseline')).push(this.addOrgToBaseLine(this.organizationsSelected[i],indicador));

      }
      
      let inicioProyecto = Moment(new Date(this.GeneralFormGroup.get('monitoring_date').value));

      (<FormArray> indicatorGroup.get('goal')).push(this.addGoalToSchema(0,indicador,inicioProyecto,true));
      for(let i = 0; i < Math.trunc(this.projectDuration/12); i++){
        (<FormArray> indicatorGroup.get('goal')).push(this.addGoalToSchema(i,indicador,inicioProyecto));
      }

      let exceso : number = this.projectDuration % 12;
      if(exceso){
        (<FormArray> indicatorGroup.get('goal')).push(this.addLastGoalToSchema(inicioProyecto,indicador,exceso));
      }
      console.log(indicatorGroup.get('goal').value);

      (<FormArray> this.GeneralFormGroup.get('full_schema')).push(indicatorGroup);

      //Añadir organización a la diferenciación de antigüedad
      if(indicador.antiquity_diff && !this.ExistIndicatorWithAntiquityDiff){
        for(let i = 0; i < this.organizationsSelected.length; i++){
          if(this.organizationsSelected[i].type != 'SFL') (<FormArray> this.GeneralFormGroup.get('organizations_diff')).push(new FormGroup({
            organization: new FormControl(this.organizationsSelected[i].name),
            id: new FormControl(this.organizationsSelected[i]._id),
            isOlder: new FormControl('',Validators.required)
          }));
        }
        this.ExistIndicatorWithAntiquityDiff = true
      }

    }
  
  }

  addGoalToSchema(index:number, indicador:any, inicioProyecto, isFirst?:boolean){
    let row = new FormArray([]);
    if(isFirst){
      (<FormArray> row).push(new FormControl('Year'));
    }else{
      (<FormArray> row).push(new FormGroup({
        yearNumber: new FormControl(`${index+1}º año`),
        yearPeriod: new FormControl(new Date(inicioProyecto.add(1,'year').format()))
      }));
    }
    for(let i = 0; i < indicador.parameters_schema.length; i++){
      if(isFirst) (<FormArray> row).push(new FormControl(indicador.parameters_schema[i].name));
      else{
        if(indicador.antiquity_diff) (<FormArray> row).push(new FormGroup({
          newer: new FormControl('',Validators.required),
          older: new FormControl('',Validators.required)
        }));
        else (<FormArray> row).push(new FormControl('',Validators.required));
      }
    }
    return row;
  }

  addLastGoalToSchema(inicioProyecto,indicador,exceso){
    let row = new FormArray([]);
    
    let period = new Date(inicioProyecto.add(exceso,'months').format());

    (<FormArray> row).push(new FormGroup({
      yearNumber: new FormControl('Último Período'),
      yearPeriod: new FormControl(period)
    }));

    for(let i = 0; i < indicador.parameters_schema.length; i++){
      if(indicador.antiquity_diff) (<FormArray> row).push(new FormGroup({
        newer: new FormControl('',Validators.required),
        older: new FormControl('',Validators.required)
      }));
      else (<FormArray> row).push(new FormControl('',Validators.required));
    }
    return row;

  }
  
  OnOrganizationsListChange(id : string, OrganizationsList : MatSelectionList){  

    let ready : boolean = false;
    this.organizationsSelected.forEach((organization, index) => {
      if(organization._id == id){ //Hay que quitar
        ready = true;
        if(confirm('Esta acción no se puede deshacer.\n¿Está seguro que desea descartar esta organización?')){
          this.organizationsSelected.splice(index,1); //Quitar del Array de organizaciones seleccionadas
          //Eliminar del Formulario
          return this.RemoveFromForm(index,organization); 
        }else return OrganizationsList.options.filter(option => option.value == id)[0].selected = true;
      }
    });
    //Agregar
    if(!ready){
      let organization : any = this.Organizations.filter(organization => organization._id == id)[0];
      this.organizationsSelected.push(organization);

      if(this.ExistIndicatorWithAntiquityDiff && organization.type != 'SFL') (<FormArray> this.GeneralFormGroup.get('organizations_diff')).push(new FormGroup({
        organization: new FormControl(organization.name),
        id: new FormControl(organization._id),
        isOlder: new FormControl('',Validators.required)
      }));

      for(let i = 0; i < (<FormArray>this.GeneralFormGroup.get('full_schema')).length; i++){

        if(this.indicatorsSelected[i].organizations_diff){
          let diferentiation : string = this.indicatorsSelected[i].organizations_diff_by;
          if(diferentiation != 'characteristic'){
            for(let j = 0; j < this.indicatorsSelected[i].organizations.length; j++){
              if(organization[diferentiation] == this.indicatorsSelected[i].organizations[j]) (<FormArray> (<FormArray> this.GeneralFormGroup.get('full_schema')).at(i).get('baseline')).push(this.addOrgToBaseLine(organization,this.indicatorsSelected[i]));
            }
          }else{
            switch (this.indicatorsSelected[i].organizations[0]) {
              case 'Con Negocios':
                if(organization.with_business == 'Si') (<FormArray> this.GeneralFormGroup.get('full_schema')['controls'][i].get('baseline')).push(this.addOrgToBaseLine(organization,this.indicatorsSelected[i]));
                break;
              case 'Sin Negocios':
                if(organization.with_business == 'No') (<FormArray> this.GeneralFormGroup.get('full_schema')['controls'][i].get('baseline')).push(this.addOrgToBaseLine(organization,this.indicatorsSelected[i]));
                break;
              case 'Legalizadas':
                if(organization.legalized) (<FormArray> this.GeneralFormGroup.get('full_schema')['controls'][i].get('baseline')).push(this.addOrgToBaseLine(organization,this.indicatorsSelected[i]));
                break;
              case 'No Legalizadas':
                if(!organization.legalized) (<FormArray> this.GeneralFormGroup.get('full_schema')['controls'][i].get('baseline')).push(this.addOrgToBaseLine(organization,this.indicatorsSelected[i]));
                break;
              default:
                break;
            }
          }
        }else (<FormArray> this.GeneralFormGroup.get('full_schema')['controls'][i].get('baseline')).push(this.addOrgToBaseLine(organization,this.indicatorsSelected[i]));


      }
    }
  }

  addOrgToBaseLine (organization, indicator, isFirst?) : FormArray {
    let baselineRow : FormArray = new FormArray([]);
    if(isFirst){
      (<FormArray> baselineRow).push(new FormControl('Organization'));
      (<FormArray> baselineRow).push(new FormControl('_id'));
    }else{
      (<FormArray> baselineRow).push(new FormControl(organization.name));
      (<FormArray> baselineRow).push(new FormControl(organization._id));
    }

    for(let j = 0; j < indicator.parameters_schema.length; j++){
      if(isFirst) (<FormArray> baselineRow).push(new FormControl(indicator.parameters_schema[j]['name']));
      else(<FormArray> baselineRow).push(new FormControl(''));
    }

    return baselineRow;
  }

  RemoveFromForm(index : number,organization : any){
    for(let i = 0; i < (<FormArray>this.GeneralFormGroup.get('full_schema')).length; i++){
      (<FormArray> (<FormArray> this.GeneralFormGroup.get('full_schema')).at(i).get('baseline')).removeAt(index);
    }
    for(let i = 0; i < (<FormArray> this.GeneralFormGroup.get('organizations_diff')).length; i++){
      if((<FormArray> this.GeneralFormGroup.get('organizations_diff')).at(i).value == organization._id) (<FormArray> this.GeneralFormGroup.get('organizations_diff')).removeAt(i);
    }
  }

  OnFundersListChange(id : string){
    (<FormArray> this.GeneralFormGroup.get('funders')).push(new FormControl(id,[Validators.required]));
  }

  remakeBaselineSchema(value,i){
    //Clean the previous baseline schema
    for(let j = (<FormArray> (<FormArray> this.GeneralFormGroup.get('full_schema')).at(i).get('baseline')).length - 1; j > 0; j--){
      (<FormArray> (<FormArray> this.GeneralFormGroup.get('full_schema')).at(i).get('baseline')).removeAt(j);
    }

    if(this.indicatorsSelected[i].organizations_diff_by == 'CEFODI'){
      let baselineRow : FormArray = new FormArray([]);
          (<FormArray> baselineRow).push(new FormControl('CEFODI'));
          (<FormArray> baselineRow).push(new FormControl('CEFODI'));

          for(let k = 0; k < this.indicatorsSelected[i].parameters_schema.length; k++){
            (<FormArray> baselineRow).push(new FormControl(''));
          }

          (<FormArray> (<FormArray> this.GeneralFormGroup.get('full_schema')).at(i).get('baseline')).push(baselineRow);

    }else if(value == 'sectors' || value == 'types'){

        for(let j = 0; j < this.preferences[value].length; j++){
        
          let baselineRow : FormArray = new FormArray([]);
          (<FormArray> baselineRow).push(new FormControl(this.preferences[value][j]));
          (<FormArray> baselineRow).push(new FormControl(this.preferences[value][j]));

          for(let k = 0; k < this.indicatorsSelected[i].parameters_schema.length; k++){
            (<FormArray> baselineRow).push(new FormControl(''));
          }

          (<FormArray> (<FormArray> this.GeneralFormGroup.get('full_schema')).at(i).get('baseline')).push(baselineRow);

        }

    }else if(value == 'individual'){
        
        for(let j = 0; j < this.organizationsSelected.length; j++){
          if(this.indicatorsSelected[i].organizations_diff){
            let diferentiation : string = this.indicatorsSelected[i].organizations_diff_by;
            if(diferentiation != 'characteristic'){
              for(let k = 0; k < this.indicatorsSelected[i].organizations.length; k++){
                if(this.organizationsSelected[j][diferentiation] == this.indicatorsSelected[i].organizations[k]){
                  (<FormArray> (<FormArray> this.GeneralFormGroup.get('full_schema')).at(i).get('baseline')).push(this.addOrgToBaseLine(this.organizationsSelected[j],this.indicatorsSelected[i]));
                }
    
              }
            }else{
              switch (this.indicatorsSelected[i].organizations[0]) {
                case 'Con Negocios':
                  if(this.organizationsSelected[j].with_business == 'Si') (<FormArray> (<FormArray> this.GeneralFormGroup.get('full_schema')).at(i).get('baseline')).push(this.addOrgToBaseLine(this.organizationsSelected[j],this.indicatorsSelected[i]));
                  break;
                case 'Sin Negocios':
                  if(this.organizationsSelected[j].with_business == 'No') (<FormArray> (<FormArray> this.GeneralFormGroup.get('full_schema')).at(i).get('baseline')).push(this.addOrgToBaseLine(this.organizationsSelected[j],this.indicatorsSelected[i]));
                  break;
                case 'Legalizadas':
                  if(this.organizationsSelected[j].legalized) (<FormArray> (<FormArray> this.GeneralFormGroup.get('full_schema')).at(i).get('baseline')).push(this.addOrgToBaseLine(this.organizationsSelected[j],this.indicatorsSelected[i]));
                  break;
                case 'No Legalizadas':
                  if(!this.organizationsSelected[j].legalized) (<FormArray> (<FormArray> this.GeneralFormGroup.get('full_schema')).at(i).get('baseline')).push(this.addOrgToBaseLine(this.organizationsSelected[j],this.indicatorsSelected[i]));
                  break;
                default:
                  break;
              }
            }
          }else (<FormArray> (<FormArray> this.GeneralFormGroup.get('full_schema')).at(i).get('baseline')).push(this.addOrgToBaseLine(this.organizationsSelected[j],this.indicatorsSelected[i]));
  
        }

    }
  }

  createProject(){
    this.store.dispatch(fromLoadingActions.initLoading({message: 'Guardando el proyecto...'}));
    if(this.GeneralFormGroup.invalid || !this.indicatorsSelected.length || !this.organizationsSelected.length || !(<FormArray> this.GeneralFormGroup.get('funders')).length){
      this.store.dispatch(fromLoadingActions.stopLoading());
      return alert('Debe completar todo el formulario de registro de Proyectos!\n\nNo olvide asignar los financiadores, indicadores y organizaciones. Tampoco olvide seleccionar el archivo de lista de beneficiarios.')
    }
    let project : any = this.GeneralFormGroup.value;
    project.indicators = [];
    project.organizations = [];
    for(let i = 0; i < this.indicatorsSelected.length; i++){
      project.indicators.push(this.indicatorsSelected[i].id);
    }
    for(let i = 0; i < this.organizationsSelected.length; i++){
      project.organizations.push(this.organizationsSelected[i].id);
    }
    this.projectsService.createProject(project).subscribe(projectResponse =>
      this.uploadBeneficiariesList(projectResponse.project._id).subscribe(docResponse => {
        this.sockets.emit('projectWasCreated',docResponse.project);
        this.sockets.emit('funderWasUpdated',{});
        this.sockets.emit('organizationWasUpdated',{});
        this.projectsService.addToStorage(docResponse.project);
        this.fundersService.getFunders(true);
        this.organizationsService.getOrganizations(true);
      },error =>{
        this.store.dispatch(stopLoading());
        this.snackBar.open('Ha ocurrido un error.','ENTENDIDO',{duration: 3000});
      }),
    error => {
      this.store.dispatch(stopLoading());
      this.snackBar.open('Ha ocurrido un error.','ENTENDIDO',{duration: 3000});
    });
  }

  /////Beneficiaries
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
          project: id,
          type: this.File.type,
          file: name,
          ext: this.File.ext,
          size: this.File.tamaño,
          entity: 'Proyectos'
        });
    filesForm.append('details',JSON.stringify(details));
    filesForm.append('entity','Project');
    filesForm.append('id',id);
    console.log(filesForm);
    return this.documentsService.uploadFile(filesForm);
  }
  
}
