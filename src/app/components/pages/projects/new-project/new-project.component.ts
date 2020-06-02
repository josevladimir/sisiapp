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

  constructor(private snackBar : MatSnackBar,
              private fundersService : FundersServiceService,
              private projectsService : ProjectsServiceService,
              private documentsService : DocumentsServiceService,
              private sockets : SocketioService,
              private indicatorsService : IndicatorsServiceService,
              private organizationsService : OrganizationsServiceService,
              private store : Store<State>){

    this.projectDuration = 12;

    this.fundersService.getFundersLocal().subscribe(funders => this.Funders = funders);
    this.indicatorsService.getIndicatorsLocal().subscribe(indicators => this.Indicators = indicators);
    this.organizationsService.getOrganizationsLocal().subscribe(organizations => this.Organizations = organizations);

    this.GeneralFormGroup = new FormGroup({
      name: new FormControl('',[Validators.required,MyValidators.existProject,MyValidators.isBlank]),
      start_date: new FormControl('',[Validators.required]),
      duration: new FormControl('',Validators.required),
      budgets: new FormGroup({
        total_inicial: new FormControl('',[Validators.required])
      }),
      ubication: new FormControl('',[Validators.required,MyValidators.isBlank]),
      beneficiaries: new FormGroup({
        number: new FormControl('',[Validators.required])
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

  setDuration () {
    
    let duration_diff : number = (this.projectDuration/12) - (this.GeneralFormGroup.get('duration').value/12); //si es positivo hay que disminuir; si es negativo hay que aumentar.

    this.projectDuration = this.GeneralFormGroup.get('duration').value;

    for(let i = 0; i < this.indicatorsSelected.length; i++){
      console.log(Math.abs(duration_diff));

      for(let a = 0; a < Math.abs(duration_diff); a++){

        if(duration_diff < 0){ //Hay que aumentar
  
          let goalCtrl : FormGroup = new FormGroup({
            year: new FormControl(`${(<FormArray> this.GeneralFormGroup.get('full_schema')['controls'][i].get('goal')).length + 1}º año`),
            parameters: new FormArray([])
          });
  
          for(let j = 0; j < this.indicatorsSelected[i].parameters.length; j++){
            if(this.indicatorsSelected[i].antiquity_diff) (<FormArray> goalCtrl.get('parameters')).push(new FormGroup({
              name: new FormControl(this.indicatorsSelected[i].parameters[j].name),
              id: new FormControl(this.indicatorsSelected[i].parameters[j]._id),
              goals: new FormGroup({
                newer: new FormControl('', Validators.required),
                older: new FormControl('', Validators.required)
              })
            }));
            else (<FormArray> goalCtrl.get('parameters')).push(new FormGroup({
              name: new FormControl(this.indicatorsSelected[i].parameters[j].name),
              id: new FormControl(this.indicatorsSelected[i].parameters[j]._id),
              goals: new FormGroup({
                goal: new FormControl('', Validators.required)
              })
            }));
          }
  
          (<FormArray> this.GeneralFormGroup.get('full_schema')['controls'][i].get('goal')).push(goalCtrl);
          
        }else{ //Hay que disminuir
          (<FormArray> this.GeneralFormGroup.get('full_schema')['controls'][i].get('goal')).removeAt((<FormArray> this.GeneralFormGroup.get('full_schema')['controls'][i].get('goal')).length - 1);
        }
  
      }
      
    }


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
      this.indicatorsSelected.push({
        id: indicator._id,
        parameters: indicator.parameters_schema,
        antiquity_diff: indicator.antiquity_diff,
        organizations_diff: indicator.organizations_diff,
        organizations_diff_by: indicator.organizations_diff_by,
        organizations: indicator.organizations
      });
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
            name: new FormControl(indicator.parameters_schema[j]['name']),
            baseline: new FormControl('')
          }));
        }
      }

      let goalCtrl : FormArray = new FormArray([]);

      let fecha = Moment(new Date(this.GeneralFormGroup.get('start_date').value));
      for(let i = 0; i < this.projectDuration/12; i++){
        (<FormArray> goalCtrl).push(new FormGroup({
          yearNumber: new FormControl(`${i+1}º año`),
          year: new FormControl(new Date(fecha.add(1,'year').format())),
          parameters: new FormArray([])
        }));

        for(let j = 0; j < indicator.parameters_schema.length; j++){
          
          if(indicator.antiquity_diff) (<FormArray> goalCtrl.controls[i].get('parameters')).push(new FormGroup({
            name: new FormControl(indicator.parameters_schema[j].name),
            id: new FormControl(indicator.parameters_schema[j]._id),
            goals: new FormGroup({
              newer: new FormControl('',Validators.required),
              older: new FormControl('',Validators.required)
            })
          }));
          else (<FormArray> goalCtrl.controls[i].get('parameters')).push(new FormGroup({
            name: new FormControl(indicator.parameters_schema[j].name),
            id: new FormControl(indicator.parameters_schema[j]._id),
            goals: new FormGroup({
              goal: new FormControl('',Validators.required)
            })
          }));
        }
      
      }

      if(this.projectDuration % 12){
        let goal : FormArray = new FormArray([]);
        
        for(let j = 0; j < indicator.parameters_schema.length; j++){
          
          if(indicator.antiquity_diff) (<FormArray> goal).push(new FormGroup({
            name: new FormControl(indicator.parameters_schema[j].name),
            id: new FormControl(indicator.parameters_schema[j]._id),
            goals: new FormGroup({
              newer: new FormControl('',Validators.required),
              older: new FormControl('',Validators.required)
            })
          }));
          else (<FormArray> goal).push(new FormGroup({
            name: new FormControl(indicator.parameters_schema[j].name),
            id: new FormControl(indicator.parameters_schema[j]._id),
            goals: new FormGroup({
              goal: new FormControl('',Validators.required)
            })
          }));
          
        }

        (<FormArray> goalCtrl).push(new FormGroup({
          yearNumber: new FormControl('Último período'),
          year: new FormControl(new Date(fecha.add(this.projectDuration % 12,'months').format())),
          parameters: goal
        }));
      }

      (<FormArray> this.GeneralFormGroup.get('full_schema')).push(new FormGroup({
          indicator: new FormControl(indicator.name),
          id: new FormControl(indicator._id),
          goal: goalCtrl,
          baseline: baselineCtrl,
          antiquity_diff: new FormControl(indicator.antiquity_diff)
      }));

      if(indicator.antiquity_diff && !this.ExistIndicatorWithAntiquityDiff){
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
              if(organization[diferentiation] == this.indicatorsSelected[i].organizations[j]){
                let baselineCtrl : FormGroup = new FormGroup({
                  organization: new FormControl(organization.name),
                  id: new FormControl(organization._id),
                  parameters: new FormArray([])
                });
        
                for(let k = 0; k < this.indicatorsSelected[i].parameters.length; k++){
                  (<FormArray> baselineCtrl.get('parameters')).push(new FormGroup({
                    name: new FormControl(this.indicatorsSelected[i].parameters[k]['name']),
                    baseline: new FormControl('')
                  }));
                }
        
                (<FormArray> this.GeneralFormGroup.get('full_schema')['controls'][i].get('baseline')).push(baselineCtrl);
              
              }

            }
          }else{
            switch (this.indicatorsSelected[i].organizations[0]) {
              case 'Con Negocios':
                if(organization.with_business) (<FormArray> this.GeneralFormGroup.get('full_schema')['controls'][i].get('baseline')).push(this.addOrgToBaseLine(organization,this.indicatorsSelected[i]));
                break;
              case 'Sin Negocios':
                if(!organization.with_business) (<FormArray> this.GeneralFormGroup.get('full_schema')['controls'][i].get('baseline')).push(this.addOrgToBaseLine(organization,this.indicatorsSelected[i]));
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

  addOrgToBaseLine (organization, indicator) : FormGroup {
    let baselineCtrl : FormGroup = new FormGroup({
      organization: new FormControl(organization.name),
      id: new FormControl(organization._id),
      parameters: new FormArray([])
    });

    for(let j = 0; j < indicator.parameters.length; j++){
      (<FormArray> baselineCtrl.get('parameters')).push(new FormGroup({
        name: new FormControl(indicator.parameters[j]['name']),
        baseline: new FormControl('')
      }));
    }

    return baselineCtrl;
  }

  RemoveFromForm(index : number){
    for(let i = 0; i < (<FormArray>this.GeneralFormGroup.get('full_schema')).length; i++){
      if(this.GeneralFormGroup.get('full_schema')['controls'][i].get('organization')) (<FormArray> this.GeneralFormGroup.get('full_schema')['controls'][i].get('organization')).removeAt(index);
      (<FormArray> this.GeneralFormGroup.get('full_schema')['controls'][i].get('baseline')).removeAt(index);
    }
    (<FormArray> this.GeneralFormGroup.get('organizations_diff')).removeAt(index);
  }

  OnFundersListChange(id : string){
    (<FormArray> this.GeneralFormGroup.get('funders')).push(new FormControl(id,[Validators.required]));
  }

  createProject(){
    this.store.dispatch(fromLoadingActions.initLoading({message: 'Guardando el proyecto...'}));
    if(this.GeneralFormGroup.invalid || !this.File || !this.indicatorsSelected.length || !this.organizationsSelected.length || !(<FormArray> this.GeneralFormGroup.get('funders')).length){
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
