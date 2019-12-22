import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute,Params } from '@angular/router';
import { SisiCoreService } from '../../../../services/sisi-core.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

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

  constructor(private _activatedRoute : ActivatedRoute,
              private _service : SisiCoreService,
              private _snackBar : MatSnackBar) { 
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
    this._service.updateFunder(this.FunderFormGroup.value,this.funderID).subscribe(
      result => {
        let funders : any[] = JSON.parse(localStorage.getItem('funders'));
        console.log(funders);
        let posicion : number;
        for(let i = 0; i < funders.length; i++){
          if(funders[i]._id == this.funderID) posicion = i;
        }
        console.log(posicion);
        funders.splice(posicion,1);
        console.log(funders);
        funders.push(result.funder);
        localStorage.setItem('funders',JSON.stringify(funders));
        this.Funder = result.funder;
        this.editMode = false;
        this.FunderFormGroup.disable();
        this._snackBar.open('Se han guardado los cambios.','ENTENDIDO',{duration: 3000});
      },error => this._snackBar.open('Ha ocurrido un error al guardar los cambios','ENTENDIDO',{duration: 3000})
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
