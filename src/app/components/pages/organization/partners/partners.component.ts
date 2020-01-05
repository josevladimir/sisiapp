import { Component } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { SisiCoreService } from '../../../../services/sisi-core.service';
import { ToolbarButton } from '../../../shared/sub-toolbar/sub-toolbar.component';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-partners',
  templateUrl: './partners.component.html'
})
export class PartnersComponent {

  PartnerForm : FormGroup;

  Organization : any;

  ActualPartners : any;

  buttons : ToolbarButton[];

  mensCtrl : FormControl = new FormControl('',[Validators.required,Validators.pattern(new RegExp(/^\d{1,8}$/))]);
  womensCtrl : FormControl = new FormControl('',[Validators.required,Validators.pattern(new RegExp(/^\d{1,8}$/))]);

  constructor(private _ActivedRoute : ActivatedRoute,
              private _service : SisiCoreService,
              private _snackBar : MatSnackBar,
              private _Router : Router) { 
    
    this._ActivedRoute.params.subscribe(  
      (params: Params) => this.Organization = this._service.getOrganization(params.id)
    );

    this.PartnerForm = new FormGroup({
      mens: this.mensCtrl,
      womens: this.womensCtrl
    });
    console.log(this.Organization);
    if(this.Organization.partners_history.length) {
      console.log('si hay');
      this.ActualPartners = {
        mens: this.Organization.partners_history[this.Organization.partners_history.length - 1].mens,
        womens: this.Organization.partners_history[this.Organization.partners_history.length - 1].womens,
        total: this.Organization.partners_history[this.Organization.partners_history.length - 1].mens + this.Organization.partners_history[this.Organization.partners_history.length - 1].womens
      }
    }else {
      console.log('no hay');
      this.ActualPartners = {
        mens: this.Organization.partners.mens,
        womens: this.Organization.partners.womens,
        total: this.Organization.partners.mens + this.Organization.partners.womens
      }
    }
    this.buttons = [
      {
        message: 'HISTÓRICO',
        hasIcon: true,
        icon: 'timeline',
        handler: () => {
          this._Router.navigate(['organizations',this.Organization._id,'partners','historic'])
        }
      }
    ];
  }

  cancel(){
    this.PartnerForm.reset();
  }

  toNumber ( number : string ) : number {
    return Number.parseInt(number);
  }

  save(){
    let history : any[];
    let registry : any = this.PartnerForm.value;
    registry.period = new Date(); 
    history = this.Organization.partners_history;
    history.push(registry);
    this._service.updateOrganization({partners_history: history},this.Organization._id).subscribe(
      result => {

        this.Organization = result.organization;
        let organizations : any[] = JSON.parse(localStorage.getItem('organizations'));
        let position : number;
        for(let i = 0; i < organizations.length; i++){
          if(organizations[i]._id == this.Organization._id) position = i; 
        }
        organizations.splice(position,1);
        organizations.push(result.organization);
        localStorage.setItem('organizations',JSON.stringify(organizations));

        this.PartnerForm.reset();
        this._snackBar.open('Se ha actualizado los socios correctamente.','ENTENDIDO',{duration: 3000});
      },error => this._snackBar.open('Ha ocurrido un error al actualizar los socios.','ENTENDIDO',{duration: 3000})
    );
  }

}
