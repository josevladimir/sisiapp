import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { Store } from '@ngrx/store';
import { State } from '../../../../reducers/index';
import { getUserData } from '../../../../reducers/selectors/session.selector';
import { initLoading, stopLoading } from '../../../../reducers/actions/loading.actions';
import { FichasServiceService } from '../../../../services/fichas-service.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-new-manual',
  templateUrl: './new-manual.component.html',
  styleUrls: ['./new-manual.component.sass']
})
export class NewManualComponent implements OnInit {

  @Output() onBack : EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input() indicator;
  @Input() project;
  @Input() ficha;

  FichaTable : FormGroup;

  indicadorTable : number = 0;

  userOrganizations : any;

  period : string;

  constructor(private store : Store<State>,
              private fichaService: FichasServiceService,
              private snackBar : MatSnackBar) {
    this.store.select(getUserData).subscribe(user => {console.log(user); this.userOrganizations = user.organizations});
  }

  ngOnInit(): void {
    if(!this.ficha) this.period = this.setearFrecuencia();
    
    this.FichaTable = new FormGroup({
      lapse: new FormGroup({
        to: new FormControl('',Validators.required),
        from: new FormControl('',Validators.required)
      }),
      indicator: new FormControl(this.indicator._id),
      of_project: new FormControl(this.project._id),
      period: new FormControl('',Validators.required),
      rows: new FormArray([])
    });

    this.indicadorTable = 0;
    /** ['Organizacion','Campo 1','Campo 2'] */
    for(let i = 0; i < this.project.organizations.length; i++){
      if(this.indicator.organizations_diff){
        if(this.indicator.organizations_diff_by != 'CEFODI' && this.indicator.organizations_diff_by != 'characteristic'){
          for(let j = 0; j < this.indicator.organizations.length; j++){
            if(this.project.organizations[i][this.indicator.organizations_diff_by] == this.indicator.organizations[j]) this.addRowInTable(i);
          }
        }else if(this.indicator.organizations_diff_by == 'characteristic'){
          switch(this.indicator.organizations[0]){
            case 'Con Negocios':
              if(this.project.organizations[i].with_business == 'Si') this.addRowInTable(i);
              break;
            case 'Sin Negocios':
              if(this.project.organizations[i].with_business == 'No') this.addRowInTable(i);
              break;
            case 'Legalizadas':
              if(this.project.organizations[i].legalized == 'Si') this.addRowInTable(i);
              break;
            case 'No Legalizadas':
              if(this.project.organizations[i].legalized == 'No') this.addRowInTable(i);
              break;
            default:
              break;
          }
        }
      }else this.addRowInTable(i);

    }
    if(this.indicator.organizations_diff && this.indicator.organizations_diff_by == 'CEFODI'){
      console.log('aqui');
      this.addRowInTable('CEFODI');
    }
    if(this.ficha) this.updateFicha();
  }

  back(noConfirm?){
    if(!noConfirm){
      if(confirm('Los cambios no guardados se perderán.\n\n¿Está seguro que desea salir?'))
        this.onBack.emit(false);
    }
    else this.onBack.emit(true);
  }

  addRowInTable(i){
    let fila : FormArray = new FormArray([]);
    if(i == 'CEFODI'){
      (<FormArray> fila).push(new FormArray([]));
      (<FormArray> (<FormArray> fila).at(0)).push(new FormControl('Organización'));
      (<FormArray> (<FormArray> fila).at(0)).push(new FormControl('id'));
      (<FormArray> fila).push(new FormArray([]));
      (<FormArray> (<FormArray> fila).at(1)).push(new FormControl('CEFODI'));
      (<FormArray> (<FormArray> fila).at(1)).push(new FormControl(''));
      if(this.indicator.type != 'Compuesto'){
        for(let j = 0; j < this.indicator.parameters_schema.length; j++){
          if(this.indicator.parameters_schema[j].haveCualitativeSchema || this.indicator.parameters_schema[j].haveSchema){
            for(let k = 0; k < this.indicator.parameters_schema[j].record_schema.length; k++){
              (<FormArray> (<FormArray> fila).at(0)).push(new FormControl(this.indicator.parameters_schema[j].record_schema[k].name));
              (<FormArray> (<FormArray> fila).at(1)).push(new FormControl(''));
            }
          }else{
            (<FormArray> (<FormArray> fila).at(0)).push(new FormControl(this.indicator.parameters_schema[j].name));
            (<FormArray> (<FormArray> fila).at(1)).push(new FormControl(''));
          }
        }
      }else{
        for(let j = 0; j < this.indicator.record_schema.length; j++){
          (<FormArray> (<FormArray> fila).at(0)).push(new FormControl(this.indicator.record_schema[j].name));
          (<FormArray> (<FormArray> fila).at(1)).push(new FormControl(''));
        }
      }
      for(let j = 0; j < (<FormArray> fila).length; j++){
        (<FormArray> this.FichaTable.get('rows')).push((<FormArray> fila).at(j));
      }
    
    }else{

      if(this.indicator.type != 'Compuesto'){
        if(!this.indicadorTable){
          (<FormArray> fila).push(new FormArray([]));
          (<FormArray> (<FormArray> fila).at(0)).push(new FormControl('Organización'));
          (<FormArray> (<FormArray> fila).at(0)).push(new FormControl('id'));
          (<FormArray> fila).push(new FormArray([]));
          (<FormArray> (<FormArray> fila).at(1)).push(new FormControl(this.project.organizations[i].name));
          (<FormArray> (<FormArray> fila).at(1)).push(new FormControl(this.project.organizations[i]._id));
          for(let j = 0; j < this.indicator.parameters_schema.length; j++){
            if(this.indicator.parameters_schema[j].haveCualitativeSchema || this.indicator.parameters_schema[j].haveSchema){
              for(let k = 0; k < this.indicator.parameters_schema[j].record_schema.length; k++){
                (<FormArray> (<FormArray> fila).at(0)).push(new FormControl(this.indicator.parameters_schema[j].record_schema[k].name));
                (<FormArray> (<FormArray> fila).at(1)).push(new FormControl(''));
              }
            }else{
              (<FormArray> (<FormArray> fila).at(0)).push(new FormControl(this.indicator.parameters_schema[j].name));
              (<FormArray> (<FormArray> fila).at(1)).push(new FormControl(''));
            }
          }
        }else{
          (<FormArray> fila).push(new FormArray([]));
          (<FormArray> (<FormArray> fila).at(0)).push(new FormControl(this.project.organizations[i].name));
          (<FormArray> (<FormArray> fila).at(0)).push(new FormControl(this.project.organizations[i]._id));
          for(let j = 0; j < this.indicator.parameters_schema.length; j++){
            if(this.indicator.parameters_schema[j].haveSchema){
              for(let k = 0; k < this.indicator.parameters_schema[j].record_schema.length; k++){
                (<FormArray> (<FormArray> fila).at(0)).push(new FormControl(''));
              }
            }else{
              (<FormArray> (<FormArray> fila).at(0)).push(new FormControl(''));
            }
          }
        }
      }else{
        if(!this.indicadorTable){
          (<FormArray> fila).push(new FormArray([]));
          (<FormArray> (<FormArray> fila).at(0)).push(new FormControl('Organización'));
          (<FormArray> (<FormArray> fila).at(0)).push(new FormControl('id'));
          (<FormArray> fila).push(new FormArray([]));
          (<FormArray> (<FormArray> fila).at(1)).push(new FormControl(this.project.organizations[i].name));
          (<FormArray> (<FormArray> fila).at(1)).push(new FormControl(this.project.organizations[i]._id));
          for(let j = 0; j < this.indicator.record_schema.length; j++){
            (<FormArray> (<FormArray> fila).at(0)).push(new FormControl(this.indicator.record_schema[j].name));
            (<FormArray> (<FormArray> fila).at(1)).push(new FormControl(''));
          }
        }else{
          (<FormArray> fila).push(new FormArray([]));
          (<FormArray> (<FormArray> fila).at(0)).push(new FormControl(this.project.organizations[i].name));
          (<FormArray> (<FormArray> fila).at(0)).push(new FormControl(this.project.organizations[i]._id));
          for(let j = 0; j < this.indicator.record_schema.length; j++){
            (<FormArray> (<FormArray> fila).at(0)).push(new FormControl(''));
          }
        }
      }
      for(let j = 0; j < (<FormArray> fila).length; j++){
        (<FormArray> this.FichaTable.get('rows')).push((<FormArray> fila).at(j));
      }
      this.indicadorTable += 1;
    }
  }
  
  isMyOrganization (id : string) : boolean {
    if(!this.userOrganizations.length) return true;
    else{
      for(let i = 0; i < this.userOrganizations.length; i++){
        if(id === this.userOrganizations[i].id) return true;
      }
    }  
    return false;
  }

  setearFrecuencia() : string{
    let periodo : string = '';
    switch(this.indicator.frequency){
      case 'Mensual':
        periodo = 'Mes'
        break;
      case 'Trimestral':
        periodo = 'Trimestre';
        break;
      case 'Semestral':
        periodo = 'Semestre';
        break;
      case 'Anual':
        periodo = 'Año';
        break;
      default:
        break;
    }
    return periodo;
  }

  primero : boolean = true;
  save(){
    let body = this.FichaTable.value;
    if(this.ficha){
      console.log(body);
      
      if(confirm('\n¿Seguro que ya desea guardar la ficha?')){
        this.store.dispatch(initLoading({message: 'Guardando Ficha...'}));
        return this.fichaService.updateFicha(this.ficha._id,this.FichaTable.value)
                                .subscribe(result => {
                                  this.store.dispatch(stopLoading());
                                  this.back(true);
                                  this.snackBar.open('Ficha actualizada exitosamente.','ENTENDIDO',{duration:3000});
                                },error =>{
                                  this.store.dispatch(stopLoading());
                                  this.snackBar.open('Ha ocurrido un error.','ENTENDIDO',{duration: 3000});
                                });
      }
    }else{
      if(this.primero){
        let period = body.period;
        body.period = `${period}º ${this.period}`;
        this.primero = false;
      }
     
      console.log(body);
      
      if(confirm('\n¿Seguro que ya desea guardar la ficha?')){
        this.store.dispatch(initLoading({message: 'Guardando Ficha...'}));
        return this.fichaService.saveFicha(this.FichaTable.value)
                                .subscribe(result => {
                                  this.store.dispatch(stopLoading());
                                  this.back(true);
                                  this.snackBar.open('Ficha guardada exitosamente.','ENTENDIDO',{duration:3000});
                                },error =>{
                                  this.store.dispatch(stopLoading());
                                  this.snackBar.open('Ha ocurrido un error.','ENTENDIDO',{duration: 3000});
                                });
      }
    }
  }

  /**
   * lapse: new FormGroup({
        to: new FormControl(this.Search.ficha.lapse.to),
        from: new FormControl(this.Search.ficha.lapse.from)
      }),
      indicator: new FormControl(this.Search.ficha.indicator),
      of_project: new FormControl(this.Search.ficha.of_project),
      period: new FormControl(this.Search.ficha.period),
      rows: new FormArray([])
   */

  updateFicha(){
    this.FichaTable.get('lapse').get('to').setValue(this.ficha.lapse.to);
    this.FichaTable.get('lapse').get('from').setValue(this.ficha.lapse.from);
    this.FichaTable.get('period').setValue(this.ficha.period);

    for(let i = 1; i < this.ficha.rows.length; i++){
      for(let j = 1; j< (<FormArray> this.FichaTable.get('rows')).length; j++){
        if(this.ficha.rows[i][1] == (<FormArray> (<FormArray> this.FichaTable.get('rows')).at(j)).at(1).value){
          for(let k = 2; k < this.ficha.rows[i].length; k++){
            (<FormArray>(<FormArray>this.FichaTable.get('rows')).at(j)).at(k).setValue(this.ficha.rows[i][k]);
          }
        }
      }
    }

  }

}
