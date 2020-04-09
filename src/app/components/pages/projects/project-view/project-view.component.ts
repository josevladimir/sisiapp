import { Component } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { UpdateExecutedComponent } from '../../../dialogs/update-executed/update-executed.component';
import { FundersLinkComponent } from '../../../dialogs/funders-link/funders-link.component';
import { environment } from '../../../../../environments/environment';
import { Store } from '@ngrx/store';
import { State } from 'src/app/reducers';
import * as fromLoadingActions from '../../../../reducers/actions/loading.actions';
import { Observable } from 'rxjs';
import { isAdmin } from '../../../../reducers/selectors/session.selector';
import { ProjectsServiceService } from '../../../../services/projects-service.service';
import { DocumentsServiceService } from '../../../../services/documents-service.service';
import { SocketioService } from '../../../../services/socketio.service';
import { FundersServiceService } from '../../../../services/funders-service.service';
import { isEditMode } from '../../../../reducers/selectors/general.selector';
import { MyValidators } from '../../../../models/Validators';
import { Validators, FormGroup, FormControl, FormArray } from '@angular/forms';
import { IndicatorsServiceService } from '../../../../services/indicators-service.service';
import { OrganizationsServiceService } from '../../../../services/organizations-service.service';
import { MatSelectionList } from '@angular/material/list';
import { editModeSetDisabled } from '../../../../reducers/actions/general.actions';

@Component({
  selector: 'app-project-view',
  templateUrl: './project-view.component.html'
})
export class ProjectViewComponent { 

  isAdmin : Observable<boolean>;
  isEditMode : Observable<boolean>;

  Project : any;

  File : any;

  executed_budget : any;

  FundersList : any[];

  URL : string = environment.baseUrl;

  Indicators : any[];
  Organizations : any[];

  GeneralFormGroup : FormGroup;
  SchemaFormGroup : FormGroup;

  indicatorsSelected : any[] = [];
  organizationsSelected : any[] = [];

  projectDuration : number;

  DeleteBtn : () => void = () =>{
      if(confirm('¿Está seguro que desea eliminar este Proyecto?\n\nEsta acción no se puede deshacer.')){
        this._store.dispatch(fromLoadingActions.initLoading({message: 'Eliminando el proyecto...'}));
        this._projectsService.deleteProject(this.Project._id);
      }
    }

  constructor(private _projectsService : ProjectsServiceService,
              private _documentsService : DocumentsServiceService,
              private _fundersService : FundersServiceService,
              private _indicatorsService : IndicatorsServiceService,
              private _organizationsService : OrganizationsServiceService,
              private _ActivatedRoute : ActivatedRoute,
              private _snackBar : MatSnackBar,
              private _sockets : SocketioService, 
              private dialog : MatDialog,
              private _store : Store<State>) { 

    this.isAdmin = this._store.select(isAdmin);
    this.isEditMode = this._store.select(isEditMode);

    this._ActivatedRoute.params.subscribe(
      (params : Params) => {
        this._projectsService.getProjectsLocal().subscribe(projects => {
          this.Project = projects.filter(project => project._id == params.id)[0];
          this.projectDuration = this.Project.duration;
          this.executed_budget = this.Project.budgets.ejecutado.pop();
          this.Project.budgets.ejecutado.push(this.executed_budget);
          this.generateChartData();
          this.getFormFromProject();
          this._documentsService.getBeneficiariesFile(this.Project.beneficiaries.file).subscribe(
            result => {
              if(result.message == 'OK') this.File = result.file
            },error => this._snackBar.open('Error al recuperar la lista de Beneficiarios.','ENTENDIDO',{duration: 3000})
          );
        });
      }
      );
    
    this._indicatorsService.getIndicatorsLocal().subscribe(indicators => this.Indicators = indicators);

    this._organizationsService.getOrganizationsLocal().subscribe(organizations => this.Organizations = organizations);

    this._fundersService.getFundersLocal().subscribe(funders => {
      this.FundersList = funders;
    });

  }

  getFormFromProject(){
    this.GeneralFormGroup = new FormGroup({
      name: new FormControl(this.Project.name,[Validators.required,MyValidators.existProject]),
      start_date: new FormControl(this.Project.start_date,[Validators.required]),
      duration: new FormControl(this.Project.duration,[Validators.required]),
      ubication: new FormControl(this.Project.ubication,[Validators.required]),
      beneficiaries: new FormGroup({
        number: new FormControl(this.Project.beneficiaries.number,[Validators.required])
      }),
      gen_objective: new FormControl(this.Project.gen_objective,[Validators.required]),
      esp_objectives: new FormArray([]),
      results: new FormArray([])
    });

    this.Project.esp_objectives.forEach(objective => {
      (<FormArray> this.GeneralFormGroup.get('esp_objectives')).push(new FormControl(objective,[Validators.required]));
    });

    this.Project.results.forEach(result => {
      (<FormArray> this.GeneralFormGroup.get('results')).push(new FormControl(result,[Validators.required]));
    });

    this.SchemaFormGroup = new FormGroup({
      full_schema : new FormArray([]),
      organizations_diff: new FormArray([])
    });

    for(let i = 0; i < this.Project.full_schema.length; i++){
      let baselineCtrl : FormArray = new FormArray([]);

      let indicator = {id: this.Project.full_schema[i].id,antiquity_diff: this.Project.full_schema[i].antiquity_diff,parameters: []};
      
      for(let j = 0; j < this.Project.full_schema[i].baseline.length; j++){
        (<FormArray> this.SchemaFormGroup.get('organizations_diff')).push(new FormGroup({
          organization: new FormControl(this.Project.organizations_diff[j].organization,Validators.required),
          id: new FormControl(this.Project.organizations_diff[j].id,Validators.required),
          isOlder: new FormControl(this.Project.organizations_diff[j].isOlder,Validators.required)
        }));

        this.organizationsSelected.push({
          name: this.Project.full_schema[i].baseline[j].organization,
          id: this.Project.full_schema[i].baseline[j].id
        });

        (<FormArray> baselineCtrl).push(new FormGroup({
          organization: new FormControl(this.Project.full_schema[i].baseline[j].organization),
          id: new FormControl(this.Project.full_schema[i].baseline[j].id),
          parameters: new FormArray([])
        }));

        for(let k = 0; k < this.Project.full_schema[i].baseline[j].parameters.length; k++){
          (<FormArray> baselineCtrl['controls'][j].get('parameters')).push(new FormGroup({
            name: new FormControl(this.Project.full_schema[i].baseline[j].parameters[k].name),
            baseline: new FormControl(this.Project.full_schema[i].baseline[j].parameters[k].baseline)
          }));
        }

      }

      let goalCtrl : FormArray = new FormArray([]);

      for(let j = 0; j < this.Project.full_schema[i].goal.length; j++){
        (<FormArray> goalCtrl).push(new FormGroup({
          year: new FormControl(this.Project.full_schema[i].goal[j].year),
          parameters: new FormArray([])
        }));

        for(let k = 0; k < this.Project.full_schema[i].goal[j].parameters.length; k++){
          indicator.parameters.push({name: this.Project.full_schema[i].goal[j].parameters[k].name});
          if(this.Project.full_schema[i].antiquity_diff) (<FormArray> goalCtrl['controls'][j].get('parameters')).push(new FormGroup({
            name: new FormControl(this.Project.full_schema[i].goal[j].parameters[k].name),
            id: new FormControl(this.Project.full_schema[i].goal[j].parameters[k].id),
            goals: new FormGroup({
              newer: new FormControl(this.Project.full_schema[i].goal[j].parameters[k].goals.newer,[Validators.required]),
              older: new FormControl(this.Project.full_schema[i].goal[j].parameters[k].goals.older,[Validators.required])
            })
          }));
          else (<FormArray> goalCtrl['controls'][j].get('parameters')).push(new FormGroup({
            name: new FormControl(this.Project.full_schema[i].goal[j].parameters[k].name),
            id: new FormControl(this.Project.full_schema[i].goal[j].parameters[k].id),
            goals: new FormGroup({
              goal: new FormControl(this.Project.full_schema[i].goal[j].parameters[k].goals.goal,[Validators.required])
            })
          }));
        }
  
      }

      this.indicatorsSelected.push(indicator);

      let schemaCtrl : FormGroup = new FormGroup({
        indicator: new FormControl(this.Project.full_schema[i].indicator),
        id: new FormControl(this.Project.full_schema[i].id),
        goal: goalCtrl,
        baseline: baselineCtrl,
        antiquity_diff: new FormControl(this.Project.full_schema[i].antiquity_diff)
      });

      (<FormArray> this.SchemaFormGroup.get('full_schema')).push(schemaCtrl);
    }

    console.log(this.SchemaFormGroup);

  }

  addObjective = () => (<FormArray> this.GeneralFormGroup.get('esp_objectives')).push(new FormControl('',[Validators.required,MyValidators.isBlank]));

  addResult = () => (<FormArray> this.GeneralFormGroup.get('results')).push(new FormControl('',[Validators.required,MyValidators.isBlank]));

  deleteObjective = (index : number) => { if(confirm('¿Está seguro de que quiere eliminar este objetivo?')) (<FormArray> this.GeneralFormGroup.get('esp_objectives')).removeAt(index); }

  deleteResult = (index : number) => { if(confirm('¿Está seguro de que quiere eliminar este resultado?')) (<FormArray> this.GeneralFormGroup.get('results')).removeAt(index); }

  isSelected(id : string) {
    return this.Project.organizations.filter(org => org._id == id).length;
  }

  updateProject(){
    this._store.dispatch(fromLoadingActions.initLoading({message: 'Guardando los Nuevos Cambios...'}));
    let body = this.GeneralFormGroup.value;
    this._projectsService.updateProject(body,this.Project._id).subscribe(proyecto => {
      console.log(proyecto);
      this._projectsService.updateProjectOnStorage(true);
      this._sockets.emit('projectWasUpdated',{});
      this._store.dispatch(editModeSetDisabled());
      this._store.dispatch(fromLoadingActions.stopLoading());
      this._snackBar.open('Se han guardado los cambios.','ENTENDIDO',{duration: 3000});
    },error => this._snackBar.open('Ha ocurrido un error.','ENTENDIDO',{duration: 3000}));
  }

  /**
   * Funders Update Modal
   */
  linkFunders(){
    this._fundersService.getFundersLocal()
    const dialogRef = this.dialog.open(FundersLinkComponent, {
      width: '550px',
      data: {Funders: this.FundersList,actualFunders: this.Project.funders}
    });

    dialogRef.afterClosed().subscribe(funders => {
      if(funders){
        /**Actualizar Financiadores */
        this._store.dispatch(fromLoadingActions.initLoading({message: 'Guardando los cambios...'}));
        this._projectsService.updateProject({funders},this.Project._id).subscribe(
          result => {
            this.Project.funders = result.project.funders;
            this._store.dispatch(fromLoadingActions.stopLoading());
            this._snackBar.open('Se ha vinculado el Financiador.','ENTENDIDO',{duration: 3000});
            this._sockets.emit('funderWasUpdated',{});
            this._sockets.emit('projectWasUpdated',{});
          },error => {
            this._store.dispatch(fromLoadingActions.stopLoading());
            this._snackBar.open('Ha ocurrido un error.','ENTENDIDO',{duration: 3000})
          }
        )
      }
    });
  }

  formatFunder(funder : any) : any {
    return {
      name: funder.name,
      _id: funder._id,
      place: funder.place
    }
  }

  delinkFunder(funderID : string) : any {
    if(confirm('¿Está seguro que desea desvincular este financiador?')) {
      this._store.dispatch(fromLoadingActions.initLoading({message: 'Desvinculando Financiador...'}));
      this._projectsService.delinkFunder(this.Project._id,funderID)
                            .subscribe(response => {
                              this.Project = response.project;
                              this._projectsService.updateProjectOnStorage(true);
                              this._sockets.emit('funderWasUpdated',{});
                              this._sockets.emit('projectWasUpdated',{});
                              this._store.dispatch(fromLoadingActions.stopLoading());
                              this._snackBar.open('Se ha desvinculado el financiador.','ENTENDIDO',{duration: 3000});
                            }, error => {
                              this._store.dispatch(fromLoadingActions.stopLoading());
                              this._snackBar.open('Ha ocurrido un error.','ENTENDIDO',{duration: 3000});
                            });
    }
  }

  /**
   * Budget Modals
   */

  updateExecuted(){
    const dialogRef = this.dialog.open(UpdateExecutedComponent, {
      width: '550px',
      data: {ejecutado: '',type: 'executed'}
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result){
        /**Actualizar Ejecutado */
        this._store.dispatch(fromLoadingActions.initLoading({message: 'Guardando los cambios...'}));
        let newBudget : number = parseInt(result);
        if(newBudget <= this.executed_budget.value){
          this._store.dispatch(fromLoadingActions.stopLoading());
          return this._snackBar.open('El presupuesto ejecutado debe ir aumentando, no puede ser menor o igual que el último registrado.','ENTENDIDO',{duration: 3000});
        }
        let budgets = { 
          budgets:{
            value: newBudget,
            name: new Date()
          }
        }
        this._projectsService.updateProject(budgets,this.Project._id).subscribe(
          result => {
              this.executed_budget.value = newBudget;
              this.Project.budgets = result.project.budgets
              this.multi[1].series.push(budgets.budgets);
              this.generateChartData();
              this._sockets.emit('projectWasUpdated',{});
              this._store.dispatch(fromLoadingActions.stopLoading());
              this._snackBar.open('Cambios guardados correctamente.','ENTENDIDO',{duration: 3000});
          },error => {
            this._store.dispatch(fromLoadingActions.stopLoading());
            this._snackBar.open('Ocurrió un error al actualizar el presupuesto.','ENTENDIDO',{duration: 3000});
          }
        );
      }
    });
  }

  updateBudget(){
    const dialogRef = this.dialog.open(UpdateExecutedComponent, {
      width: '550px',
      data: {final: '',type: 'budget'}
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result){
        /**Actualizar Ejecutado */
        this._store.dispatch(fromLoadingActions.initLoading({message: 'Guardando los cambios...'}));
        let newBudget : number = parseInt(result);
        let body = { newBudget }
        this._projectsService.updateProject(body,this.Project._id).subscribe(
          resultado => {
              this.Project.budgets.total_final = result;
              this.multi[0].series.pop();
              this.multi[0].series.push({value: result, name: new Date()});
              this._sockets.emit('projectWasUpdated',{});
              this.generateChartData();
              this._store.dispatch(fromLoadingActions.stopLoading());
              this._snackBar.open('Cambios guardados correctamente.','ENTENDIDO',{duration: 3000});
          },error => {
            this._store.dispatch(fromLoadingActions.stopLoading());
            this._snackBar.open('Ocurrió un error al actualizar el presupuesto.','ENTENDIDO',{duration: 3000})
          }
        )
      }
    });
  }

  /**
     * Budget Graphic
     */

    generateChartData(){
      console.log(this.Project.budgets);
      this.multi = null;
      this.multi = [
        {
          name: 'Presupuesto',
          series: [{
              name: new Date(this.Project.created_at),
              value: this.Project.budgets.total_inicial
            },
            {
              name: new Date(),
              value: this.Project.budgets.total_final
          }]
        },
        {
          name: 'Ejecutado',
          series: [{name: new Date(this.Project.created_at),value: this.Project.budgets.ejecutado[0].value}]
        }
      ];
      for(let i = 0; i < this.Project.budgets.ejecutado.length; i++){
        if(i) this.multi[1].series.push(this.getSerieItem(this.Project.budgets.ejecutado[i].name,this.Project.budgets.ejecutado[i].value));
      }
      
      this.multi[1].series.push({
        name: new Date(),
        value: this.executed_budget.value
      });
      console.log(this.multi);
      
    }

    getSerieItem(name : string, value : number){
      return {
        name: new Date(name),
        value
      }
    }
  
    multi: any[];
    view: any[] = [700, 400];
  
    // options
    legend: boolean = true;
    showLabels: boolean = true;
    animations: boolean = true;
    xAxis: boolean = true;
    yAxis: boolean = true;
    showYAxisLabel: boolean = true;
    showXAxisLabel: boolean = true;
    //Eje de X
    xAxisLabel: string = 'Tiempo';
    //Eje de Y
    yAxisLabel: string = 'Presupuesto en dólares (USD)';
    timeline: boolean = true;
  
    colorScheme = {
      domain: ['#5AA454', '#E44D25']
    };
  
    onSelect(data): void {
      console.log('Item clicked', JSON.parse(JSON.stringify(data)));
    }
  
    onActivate(data): void {
      console.log('Activate', JSON.parse(JSON.stringify(data)));
    }
  
    onDeactivate(data): void {
      console.log('Deactivate', JSON.parse(JSON.stringify(data)));
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
    for(let i = 0; i < (<FormArray> this.SchemaFormGroup.get('full_schema')).length; i++){
      if(this.SchemaFormGroup.get('full_schema')['controls'][i].get('id').value == id){
        indice = i;
        ready = true;
        break;
      }
    }
    if(ready){ //Hay que eliminar el indicador
      if(confirm('Esta acción no se puede deshacer.\n\n¿Está seguro que desea descartar este indicador?')){
        (<FormArray> this.SchemaFormGroup.get('full_schema')).removeAt(indice);
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

      let goalCtrl : FormArray = new FormArray([]);

      console.log(this.projectDuration);

      for(let i = 0; i < this.projectDuration/12; i++){

        (<FormArray> goalCtrl).push(new FormGroup({
          year: new FormControl(`${i+1}º año`),
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

      
        (<FormArray> this.SchemaFormGroup.get('full_schema')).push(new FormGroup({
          indicator: new FormControl(indicator.name),
          id: new FormControl(indicator._id),
          goal: goalCtrl,
          baseline: baselineCtrl,
          antiquity_diff: new FormControl(indicator.antiquity_diff)
        }));
    }
  } 
  
  OnOrganizationsListChange(id : string, OrganizationsList : MatSelectionList){    
    let ready : boolean = false;
    console.log(this.organizationsSelected);
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

      (<FormArray> this.SchemaFormGroup.get('organizations_diff')).push(new FormGroup({
        organization: new FormControl(organization.name),
        id: new FormControl(organization._id),
        isOlder: new FormControl('',Validators.required)
      }));

      for(let i = 0; i < (<FormArray>this.SchemaFormGroup.get('full_schema')).length; i++){

        let baselineCtrl : FormGroup = new FormGroup({
          organization: new FormControl(organization.name),
          id: new FormControl(organization.id),
          parameters: new FormArray([])
        });

        for(let j = 0; j < this.indicatorsSelected[i].parameters.length; j++){
          (<FormArray> baselineCtrl.get('parameters')).push(new FormGroup({
            name: new FormControl(this.indicatorsSelected[i].parameters[j]['name']),
            baseline: new FormControl('')
          }));
        }

        (<FormArray> this.SchemaFormGroup.get('full_schema')['controls'][i].get('baseline')).push(baselineCtrl);

      }
    }
  }

  RemoveFromForm(index : number){
    for(let i = 0; i < (<FormArray>this.SchemaFormGroup.get('full_schema')).length; i++){
      if(this.SchemaFormGroup.get('full_schema')['controls'][i].get('organization')) (<FormArray> this.SchemaFormGroup.get('full_schema')['controls'][i].get('organization')).removeAt(index);
      (<FormArray> this.SchemaFormGroup.get('full_schema')['controls'][i].get('baseline')).removeAt(index);
    }
    (<FormArray> this.GeneralFormGroup.get('organizations_diff')).removeAt(index);
  }

}

