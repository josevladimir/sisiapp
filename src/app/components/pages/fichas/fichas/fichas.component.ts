import { Store } from '@ngrx/store';
import { State } from '../../../../reducers/index';
import * as moment from 'moment';
import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SocketioService } from '../../../../services/socketio.service';
import { ProjectsServiceService } from '../../../../services/projects-service.service';
import { IndicatorsServiceService } from '../../../../services/indicators-service.service';
import { initLoading, stopLoading } from '../../../../reducers/actions/loading.actions';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { getDaysOfLapse } from '../../../../reducers/selectors/general.selector';
import { environment } from '../../../../../environments/environment';
import { FichasServiceService } from '../../../../services/fichas-service.service';
import { getUserData } from '../../../../reducers/selectors/session.selector';

@Component({
  selector: 'app-fichas',
  templateUrl: './fichas.component.html'
})
export class FichasComponent {

  assetsUrl : string = environment.assetsUrl;

  Projects : any[] = [];
  ProjectSelected : any;

  IndicatorSelected : any;

  FichaTable : FormGroup;

  Status : any;

  daysOfLapse : number;

  Period : any;

  userOrganizations : any;

  Schema : any;

  Search : any = {
    working: false,
    error: false,
    empty: false,
    editMode: false,
    EditForm: null,
    fichas: []
  };

  constructor(private projectService : ProjectsServiceService,
              private store : Store<State>,
              private snackBar : MatSnackBar,
              private fichaService : FichasServiceService,
              private indicatorService : IndicatorsServiceService){
    
    this.store.select(getDaysOfLapse).subscribe((days : number) => this.daysOfLapse = days);
    projectService.getProjectsUniqueLocal().subscribe(projects => projects.forEach(project => this.Projects.push(this.formatProjectForList(project))));
    this.store.select(getUserData).subscribe(user => {console.log(user); this.userOrganizations = user.organizations});

  }
  
  cancel(){
    if(confirm('La Ficha no será guardada. Esta acción no se puede deshacer.\n\n¿Está seguro que desea cancelar?')){
      this.FichaTable.reset();
      this.Status = 'none'
    }
  }
  
  save(){
    if(confirm('\n¿Seguro que ya desea guardar la ficha?')){
      this.store.dispatch(initLoading({message: 'Guardando Ficha...'}));
      if(!this.Schema)return this.fichaService.saveFicha(this.FichaTable.value)
                                              .subscribe(result => {
                                                            this.Status = 'none';
                                                            this.store.dispatch(stopLoading());
                                                            this.snackBar.open('Ficha guardada exitosamente.','ENTENDIDO',{duration:3000});
                                                          },error =>{
                                                            this.store.dispatch(stopLoading());
                                                            this.snackBar.open('Ha ocurrido un error.','ENTENDIDO',{duration: 3000});
                                                          });
      else if(this.Search.EditForm) return this.fichaService.updateFicha(this.Search.ficha._id,this.Search.EditForm.value)
                                        .subscribe(result => {
                                           if(result.message == 'OK') {
                                             this.Status = 'none';
                                             this.store.dispatch(stopLoading());
                                             this.snackBar.open('Ficha guardada exitosamente.','ENTENDIDO',{duration: 3000});
                                           }
                                        },error => {
                                          this.store.dispatch(stopLoading());
                                          this.snackBar.open('Ha ocurrido un error.','ENTENDIDO',{duration: 3000});
                                        });
      else return this.fichaService.updateFicha(this.Schema._id,this.FichaTable.value)
                                   .subscribe(result => {
                                      if(result.message == 'OK') {
                                        this.Status = 'none';
                                        this.store.dispatch(stopLoading());
                                        this.snackBar.open('Ficha guardada exitosamente.','ENTENDIDO',{duration: 3000});
                                      }
                                   },error => {
                                     this.store.dispatch(stopLoading());
                                     this.snackBar.open('Ha ocurrido un error.','ENTENDIDO',{duration: 3000});
                                   });
      
    }
  }

  /*listeners*/
  onProjectSelect(value){
    this.ProjectSelected = this.Projects.filter(project => project._id == value)[0];
  }

  onIndicatorSelect(value){
    this.indicatorService.getIndicatorsUniqueLocal().subscribe(indicators => {
      this.IndicatorSelected = indicators.filter(indicator => indicator._id == value)[0];
    }); 
  }

  indicadorTable : number = 0;

  generateSchema(){
    this.Status = 'loading';

    if(moment(new Date()).isAfter(moment(moment(this.ProjectSelected.start_date).add(this.ProjectSelected.duration,'months').add(this.daysOfLapse,'days').format()))) return this.Status = 'outDateProject';
    
    let startDate = moment(this.ProjectSelected.start_date);
    let diferencia = moment(new Date()).diff(startDate,'months');
    console.log('inicio',startDate);
    console.log('diferencia',diferencia);
    let noCorresponde : number;
    let period : any; 
    switch(this.IndicatorSelected.frequency){
      case 'Mensual':
        noCorresponde = 0;
        period = {
          period: Math.trunc(diferencia / 1) + 'º Mes',
          date: {
            to: new Date(startDate.add(diferencia,'months').format()),
            from: new Date(startDate.subtract(1,'months').format()),
          }
        }  
        break;
      case 'Trimestral':
        noCorresponde = diferencia % 3;
        period = {
          period: Math.trunc(diferencia / 3) + 'º Trimestre',
          date: {
            to: new Date(startDate.add(diferencia,'months').format()),
            from: new Date(startDate.subtract(3,'months').format()),
          }
        }  
        break;
      case 'Semestral':
        noCorresponde = diferencia % 6;
        period = {
          period: Math.trunc(diferencia / 6) + 'º Semestre',
          date: {
            to: new Date(startDate.add(diferencia,'months').format()),
            from: new Date(startDate.subtract(6,'months').format()),
          }
        }  
        break;
      case 'Anual':
        noCorresponde = diferencia % 12;
        period = {
          period: Math.trunc(diferencia / 12) + 'º Año',
          date: {
            to: new Date(startDate.add(diferencia,'months').format()),
            from: new Date(startDate.subtract(12,'months').format()),
          }
        }  
        break;
      default:
        break;
    }

    if(noCorresponde) return this.Status = 'noPeriod';

    this.FichaTable = new FormGroup({
      lapse: new FormGroup({
        to: new FormControl(period.date.to),
        from: new FormControl(period.date.from)
      }),
      indicator: new FormControl(this.IndicatorSelected._id),
      of_project: new FormControl(this.ProjectSelected._id),
      period: new FormControl(period.period),
      rows: new FormArray([])
    });

    let fechaLimite = ((moment(this.ProjectSelected.start_date).add(diferencia,'months')
                                                               .add(this.daysOfLapse,'days')
                                                               .set('hours',23))
                                                               .set('minutes',59))
                                                               .set('seconds',59)
                                                               .format();

    let fueraDeTiempo : boolean = moment(new Date()).isAfter(moment(fechaLimite));

    this.comprobarDisponibilidad(fueraDeTiempo); 

  }

  makeSchemaForm(exist){

    console.log(exist,this.Schema);
    this.indicadorTable = 0;
    /** ['Organizacion','Campo 1','Campo 2'] */
    for(let i = 0; i < this.ProjectSelected.organizations.length; i++){
      if(this.IndicatorSelected.organizations_diff){
        if(this.IndicatorSelected.organizations_diff_by != 'CEFODI' && this.IndicatorSelected.organizations_diff_by != 'characteristic'){
          for(let j = 0; j < this.IndicatorSelected.organizations.length; j++){
            if(this.ProjectSelected.organizations[i][this.IndicatorSelected.organizations_diff_by] == this.IndicatorSelected.organizations[j]) this.addRowInTable(i,exist);
          }
        }else if(this.IndicatorSelected.organizations_diff_by == 'characteristic'){
          switch(this.IndicatorSelected.organizations[0]){
            case 'Con Negocios':
              if(this.ProjectSelected.organizations[i].with_business == 'Si') this.addRowInTable(i,exist);
              break;
            case 'Sin Negocios':
              if(this.ProjectSelected.organizations[i].with_business == 'No') this.addRowInTable(i,exist);
              break;
            case 'Legalizadas':
              if(this.ProjectSelected.organizations[i].legalized == 'Si') this.addRowInTable(i,exist);
              break;
            case 'No Legalizadas':
              if(this.ProjectSelected.organizations[i].legalized == 'No') this.addRowInTable(i,exist);
              break;
            default:
              break;
          }
        }
      }else this.addRowInTable(i,exist);

    }
    if(this.IndicatorSelected.organizations_diff && this.IndicatorSelected.organizations_diff_by == 'CEFODI'){
      this.addRowInTable(0,exist);
    }
    console.log(this.FichaTable.value);
    return this.Status = 'ready';
  }
  
  addRowInTable(i,exist){
    let fila : FormArray = new FormArray([]);
    if(this.IndicatorSelected.type != 'Compuesto'){
      if(!this.indicadorTable){
        (<FormArray> fila).push(new FormArray([]));
        (<FormArray> (<FormArray> fila).at(0)).push(new FormControl('Organización'));
        (<FormArray> (<FormArray> fila).at(0)).push(new FormControl('id'));
        (<FormArray> fila).push(new FormArray([]));
        (<FormArray> (<FormArray> fila).at(1)).push(new FormControl(this.ProjectSelected.organizations[i].name));
        (<FormArray> (<FormArray> fila).at(1)).push(new FormControl(this.ProjectSelected.organizations[i]._id));
        for(let j = 0; j < this.IndicatorSelected.parameters_schema.length; j++){
          if(this.IndicatorSelected.parameters_schema[j].haveCualitativeSchema || this.IndicatorSelected.parameters_schema[j].haveSchema){
            for(let k = 0; k < this.IndicatorSelected.parameters_schema[j].record_schema.length; k++){
              (<FormArray> (<FormArray> fila).at(0)).push(new FormControl(this.IndicatorSelected.parameters_schema[j].record_schema[k].name));
              (<FormArray> (<FormArray> fila).at(1)).push(new FormControl((exist ? this.Schema.rows[this.indicadorTable+1][k+2] : ''),Validators.required));
            }
          }else{
            (<FormArray> (<FormArray> fila).at(0)).push(new FormControl(this.IndicatorSelected.parameters_schema[j].name));
            (<FormArray> (<FormArray> fila).at(1)).push(new FormControl((exist ? this.Schema.rows[this.indicadorTable+1][j+2] : ''),Validators.required));
          }
        }
      }else{
        (<FormArray> fila).push(new FormArray([]));
        (<FormArray> (<FormArray> fila).at(0)).push(new FormControl(this.ProjectSelected.organizations[i].name));
        (<FormArray> (<FormArray> fila).at(0)).push(new FormControl(this.ProjectSelected.organizations[i]._id));
        for(let j = 0; j < this.IndicatorSelected.parameters_schema.length; j++){
          if(this.IndicatorSelected.parameters_schema[j].haveSchema){
            for(let k = 0; k < this.IndicatorSelected.parameters_schema[j].record_schema.length; k++){
              (<FormArray> (<FormArray> fila).at(0)).push(new FormControl((exist ? this.Schema.rows[this.indicadorTable+1][k+2] : ''),Validators.required));
            }
          }else{
            (<FormArray> (<FormArray> fila).at(0)).push(new FormControl((exist ? this.Schema.rows[this.indicadorTable+1][j+2] : ''),Validators.required));
          }
        }
      }
    }else{
      if(!this.indicadorTable){
        (<FormArray> fila).push(new FormArray([]));
        (<FormArray> (<FormArray> fila).at(0)).push(new FormControl('Organización'));
        (<FormArray> (<FormArray> fila).at(0)).push(new FormControl('id'));
        (<FormArray> fila).push(new FormArray([]));
        (<FormArray> (<FormArray> fila).at(1)).push(new FormControl(this.ProjectSelected.organizations[i].name));
        (<FormArray> (<FormArray> fila).at(1)).push(new FormControl(this.ProjectSelected.organizations[i]._id));
        for(let j = 0; j < this.IndicatorSelected.record_schema.length; j++){
          (<FormArray> (<FormArray> fila).at(0)).push(new FormControl(this.IndicatorSelected.record_schema[j].name));
          (<FormArray> (<FormArray> fila).at(1)).push(new FormControl((exist ? this.Schema.rows[this.indicadorTable+1][j] : ''),Validators.required));
        }
      }else{
        (<FormArray> fila).push(new FormArray([]));
        (<FormArray> (<FormArray> fila).at(0)).push(new FormControl(this.ProjectSelected.organizations[i].name));
        (<FormArray> (<FormArray> fila).at(0)).push(new FormControl(this.ProjectSelected.organizations[i]._id));
        for(let j = 0; j < this.IndicatorSelected.record_schema.length; j++){
          (<FormArray> (<FormArray> fila).at(0)).push(new FormControl((exist ? this.Schema.rows[this.indicadorTable+1][j] : ''),Validators.required));
        }
      }
    }
    for(let j = 0; j < (<FormArray> fila).length; j++){
      (<FormArray> this.FichaTable.get('rows')).push((<FormArray> fila).at(j));
    }
    this.indicadorTable += 1;
  }

  /*Utilities*/

  isMyOrganization (id : string) : boolean {
    if(!this.userOrganizations.length) return true;
    else{
      for(let i = 0; i < this.userOrganizations.length; i++){
        if(id === this.userOrganizations[i].id) return true;
      }
    }  
    return false;
  }
  
  formatProjectForList (project : any) : any {
    return {
      name: project.name,
      _id: project._id,
      indicators: project.indicators,
      organizations: project.organizations,
      start_date: project.monitoring_date,
      duration: project.duration
    }
  }

  comprobarDisponibilidad(fueraDeTiempo){
    console.log('aqui');
    this.fichaService
        .existFicha(this.ProjectSelected._id,this.IndicatorSelected._id,this.FichaTable.get('period').value)
        .subscribe((ficha : any) => {
          console.log(ficha);

          this.Schema = ficha.ficha;

          if(fueraDeTiempo){
            if(ficha.exist) this.Status = 'fueraDeTiempo';
            else this.Status = 'noSeHizoNada'
          }else this.makeSchemaForm(ficha.exist);
        });
  }

  searchFichas(){
    this.Search.working = true;
    this.Search.error = false;
    this.Search.empty = false;
    this.fichaService.search(this.ProjectSelected._id,this.IndicatorSelected._id).subscribe(
      result => {
        console.log(result);
        if(result.message == 'OK'){
          this.Search.working = false;
          let sorted = this.sortFichas(result.fichas);
          this.Search.fichas = sorted;
        }else{
          console.log(this.Search.empty, 'aqui');
          this.Search.working = false;
          this.Search.empty = true;
        }
      },error => {
        this.Search.working = false;
        console.log(error);
        this.Search.error = true;
      }
    );
  }

  sortFichas(fichas):any[]{
    let indicador = false;
    let auxiliar = fichas;
    do {
      indicador = false;
      for(let i = 1; i < auxiliar.length; i++){
        let Ant = auxiliar[i-1].period.split('º')[0];
        let Sig = auxiliar[i].period.split('º')[0];
  
        if(parseInt(Sig) < parseInt(Ant)){
          let aux = auxiliar[i];
          auxiliar[i] = auxiliar[i-1];
          auxiliar[i-1] = aux;
          indicador = true;
        }
      }
    } while (indicador);
    return auxiliar;
  }
  
  setEditMode(){

    this.Search.EditForm = new FormGroup({
      lapse: new FormGroup({
        to: new FormControl(this.Search.ficha.lapse.to),
        from: new FormControl(this.Search.ficha.lapse.from)
      }),
      indicator: new FormControl(this.Search.ficha.indicator),
      of_project: new FormControl(this.Search.ficha.of_project),
      period: new FormControl(this.Search.ficha.period),
      rows: new FormArray([])
    });
    for(let i = 0; i < this.Search.ficha.rows.length; i++){
      let row = new FormArray([]);
      for(let j = 0; j < this.Search.ficha.rows[i].length; j++){
        (<FormArray> row).push(new FormControl(this.Search.ficha.rows[i][j]));
      }
      (<FormArray> this.Search.EditForm.get('rows')).push(row);
    }

    this.Search.editMode = true;

    console.log(this.Search.EditForm.value);
  }
  
}

