import { Component, Inject } from '@angular/core';
import { SisiCoreService } from '../../../../services/sisi-core.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UpdateExecutedComponent } from '../../../dialogs/update-executed/update-executed.component';

@Component({
  selector: 'app-project-view',
  templateUrl: './project-view.component.html'
})
export class ProjectViewComponent {

  Project : any;

  File : any;

  executed_budget : number;

  constructor(private _service : SisiCoreService,
              private _Router : Router,
              private _ActivatedRoute : ActivatedRoute,
              private _snackBar: MatSnackBar,
              private dialog : MatDialog) { 

    this._ActivatedRoute.params.subscribe(
      (params : Params) => this.Project = this._service.getProject(params.id)
    );

    this.executed_budget = this.Project.budgets.ejecutado.pop().value;

    this._service.getBeneficiariesFile(this.Project.beneficiaries.file).subscribe(
      result => {
        if(result.message == 'OK') this.File = result.file
      },error => this._snackBar.open('Error al recuperar la lista de Beneficiarios.','ENTENDIDO',{duration: 3000})
    );
    this.generateChartData();
  }

  /**
   * Budget Modals
   */

  updateExecuted(){
    const dialogRef = this.dialog.open(ExecutedModal, {
      width: '250px',
      data: {name: 'name', animal: 'animal'}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      //this.animal = result;
    });
  }

    /**
     * Budget Graphic
     */

    generateChartData(){
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
          series: this.Project.budgets.ejecutado
        }
      ];
      
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


@Component({
  selector: 'executed-modal',
  templateUrl: '../../../dialogs/update-executed/update-executed.component.html',
})
export class ExecutedModal {

  constructor(
    public dialogRef: MatDialogRef<ExecutedModal>,
    @Inject(MAT_DIALOG_DATA) public data: any) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

}