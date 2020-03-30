import { Component } from '@angular/core';
import { SisiCoreService } from '../../../../services/sisi-core.service';
import { ActivatedRoute, Params } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { UpdateExecutedComponent } from '../../../dialogs/update-executed/update-executed.component';
import { ToolbarButton } from '../../../shared/sub-toolbar/sub-toolbar.component';
import { FundersLinkComponent } from '../../../dialogs/funders-link/funders-link.component';
import { environment } from '../../../../../environments/environment';
import { Store } from '@ngrx/store';
import { State } from 'src/app/reducers';
import * as fromLoadingActions from '../../../../reducers/actions/loading.actions';

@Component({
  selector: 'app-project-view',
  templateUrl: './project-view.component.html'
})
export class ProjectViewComponent {

  Project : any;

  File : any;

  executed_budget : any;

  URL : string = environment.baseUrl;

  userRole : string = localStorage.getItem('userRole');

  DeleteBtn : ToolbarButton = {
    hasIcon: true,
    icon: 'delete',
    handler: ()=>{
      if(confirm('¿Está seguro que desea eliminar este Proyecto?\n\nEsta acción no se puede deshacer.')){
        this._store.dispatch(fromLoadingActions.initLoading({message: 'Eliminando el proyecto...'}));
        this._service.deleteProject(this.Project._id).subscribe(
        result => {
          if(result.message == 'DELETED'){
            this._service.updateProjectsList(true);
            this._store.dispatch(fromLoadingActions.stopLoading());
            this._snackBar.open('Se eliminó el Proyecto correctamente.','ENTENDIDO',{duration: 3000});
          }
        },error => {
          this._store.dispatch(fromLoadingActions.stopLoading());
          this._snackBar.open('Ocurrió un error al eliminar el Proyecto.','ENTENDIDO',{duration: 3000});
        }
      )
      }
    },
    message: 'ELIMINAR'
  }

  constructor(private _service : SisiCoreService,
              private _ActivatedRoute : ActivatedRoute,
              private _snackBar: MatSnackBar,
              private dialog : MatDialog,
              private _store : Store<State>) { 

    this._ActivatedRoute.params.subscribe(
      (params : Params) => {
        this.Project = this._service.getProject(params.id);
        this.executed_budget = this.Project.budgets.ejecutado.pop();
        this.Project.budgets.ejecutado.push(this.executed_budget);
        console.log(this.Project.funders);
        this.generateChartData();
      }
    );


    this._service.getBeneficiariesFile(this.Project.beneficiaries.file).subscribe(
      result => {
        if(result.message == 'OK') this.File = result.file
      },error => this._snackBar.open('Error al recuperar la lista de Beneficiarios.','ENTENDIDO',{duration: 3000})
    );
  }

  /**
   * Funders Update Modal
   */
  linkFunders(){
    const dialogRef = this.dialog.open(FundersLinkComponent, {
      width: '550px',
      data: {Funders: JSON.parse(localStorage.funders),actualFunders: this.Project.funders}
    });

    dialogRef.afterClosed().subscribe(funders => {
      if(funders){
        /**Actualizar Financiadores */
        this._store.dispatch(fromLoadingActions.initLoading({message: 'Guardando los cambios...'}));
        this._service.updateProject({funders},this.Project._id).subscribe(
          result => {
            if(result.message == 'UPDATED'){
              let updatedFunders : any[] = []
              result.project.funders.forEach(id => {
                console.log(id);
                updatedFunders.push(this.formatFunder(this._service.getFunder(id)))
              });
              this.Project.funders = updatedFunders;
              this._store.dispatch(fromLoadingActions.stopLoading());
              this._snackBar.open('Se ha vinculado el Financiador.','ENTENDIDO',{duration: 3000});
              this._service.updateProjectsList(null);
              this._service.updateFundersList(null);
            }
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
        this._service.updateProject(budgets,this.Project._id).subscribe(
          result => {
            console.log(result);
            if(result.message == 'UPDATED'){
              this.executed_budget.value = newBudget;
              this.Project.budgets = result.project.budgets
              this.multi[1].series.push(budgets.budgets);
              this._service.updateProjectsList(null);
              this.generateChartData();
              this._store.dispatch(fromLoadingActions.stopLoading());
              this._snackBar.open('Cambios guardados correctamente.','ENTENDIDO',{duration: 3000});
            }
          },error => {
            this._store.dispatch(fromLoadingActions.stopLoading());
            this._snackBar.open('Ocurrió un error al actualizar el presupuesto.','ENTENDIDO',{duration: 3000});
          }
        )
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
        this._service.updateProject(body,this.Project._id).subscribe(
          resultado => {
            if(resultado.message == 'UPDATED'){
              this.Project.budgets.total_final = result;
              this.multi[0].series.pop();
              this.multi[0].series.push({value: result, name: new Date()});
              this._service.updateProjectsList(null);
              this.generateChartData();
              this._store.dispatch(fromLoadingActions.stopLoading());
              this._snackBar.open('Cambios guardados correctamente.','ENTENDIDO',{duration: 3000});
            }
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

}
