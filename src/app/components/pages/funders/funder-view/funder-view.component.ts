import { Component } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { SisiCoreService } from '../../../../services/sisi-core.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ToolbarButton } from '../../../shared/sub-toolbar/sub-toolbar.component';

@Component({
  selector: 'app-funder-view',
  templateUrl: './funder-view.component.html'
})
export class FunderViewComponent{

  funderID : string;

  editMode : boolean = false;

  userRole : string = localStorage.getItem('userRole');

  Funder : any;

  FunderFormGroup : FormGroup;

  isWorking : boolean = false;

  loadingMessage : string = '';

  DeleteBtn : ToolbarButton = {
    hasIcon: true,
    icon: 'delete',
    handler: ()=>{
      if(confirm('¿Está seguro que desea eliminar este Financiador?\n\nEsta acción no se puede deshacer.')){
        this.loadingMessage = 'Eliminando Financiador...'
        this.isWorking = true;
        this._service.deleteFunder(this.Funder._id).subscribe(
          result => {
            if(result.message == 'DELETED'){
              this._service.updateProjectsList(null);
              this._service.updateFundersList(true);
              this.isWorking = false;
              this._snackBar.open('Se eliminó el Financiador correctamente.','ENTENDIDO',{duration: 3000});
            }
          
          },error => {
            this.isWorking = false;
            this._snackBar.open('Ocurrió un error al eliminar el Financiador.','ENTENDIDO',{duration: 3000})
          }
        )
      }
    },
    message: 'ELIMINAR'
  }

  constructor(private _activatedRoute : ActivatedRoute,
              private _service : SisiCoreService,
              private _snackBar : MatSnackBar,
              private _Router : Router) { 
    this._activatedRoute.params.subscribe(
      (params : Params) => {
        this.funderID = params.id;
        this.Funder = this._service.getFunder(this.funderID)
      });
    this.FunderFormGroup = new FormGroup({
      name: new FormControl({value: this.Funder.name, disabled: true},Validators.required),
      place: new FormControl({value: this.Funder.place, disabled: true},Validators.required),
      website: new FormControl({value: this.Funder.website, disabled: true}),
      coop_date: new FormControl({value: this.Funder.coop_date, disabled: true},[Validators.required,Validators.pattern(new RegExp(/^\d{1,2}\/\d{4}$/))])
    });
  }

  edit(){
    this.editMode = true;
    this.FunderFormGroup.enable();
  }

  save(){
    this.loadingMessage = 'Guardando los cambios en el Financiador...';
    this.isWorking = true;
    this._service.updateFunder(this.FunderFormGroup.value,this.funderID).subscribe(
      result => {
        this._service.updateFundersList(false);
        this.Funder = result.funder;
        this.editMode = false;
        this.FunderFormGroup.disable();
        this.isWorking = false;
        this._snackBar.open('Se han guardado los cambios.','ENTENDIDO',{duration: 3000});
      },error => {
        this.isWorking = false;
        this._snackBar.open('Ha ocurrido un error al guardar los cambios','ENTENDIDO',{duration: 3000})
      }
    )
  }

  cancel(){
    this.FunderFormGroup.disable();
    this.FunderFormGroup.reset({
      name: this.Funder.name,
      place: this.Funder.place,
      website: this.Funder.website,
      coop_date: this.Funder.coop_date
    });
    this.editMode = false;
  }

}
