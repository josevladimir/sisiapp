import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { SisiCoreService } from '../../../../services/sisi-core.service';
import { FormGroup,FormControl,Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-organization-view',
  templateUrl: './organization-view.component.html'
})
export class OrganizationViewComponent implements OnInit{

  Organization : any;

  organizationForm : FormGroup;

  editMode : boolean = false;

  isOlder : boolean = false;

  nameCtrl : FormControl;
  foundation_dateCtrl : FormControl;
  sectorCtrl : FormControl;
  typeCtrl : FormControl;
  legalizedCtrl : FormControl;
  mensCtrl : FormControl;
  womensCtrl : FormControl;
  beneficiariesCtrl : FormControl;
  cantonCtrl : FormControl;
  recintoCtrl : FormControl;
  parroquiaCtrl : FormControl;


  constructor(private _ActivatedRoute : ActivatedRoute,
              private _service : SisiCoreService,
              private _snackBar : MatSnackBar) {
    
    this._ActivatedRoute.params.subscribe(
      (params : Params) => this.Organization = this._service.getOrganization(params.id)
    )
    
  }

  ngOnInit(){
    this.nameCtrl = new FormControl(this.Organization.name,[Validators.required,this._service.existOrganization]);
    this.foundation_dateCtrl = new FormControl(this.Organization.foundation_date,[Validators.required,Validators.pattern(new RegExp(/^(0?[1-9]|[12][0-9]|3[01])[\/](0?[1-9]|1[012])[/\\/](19|20)\d{2}$/))]);
    this.sectorCtrl = new FormControl(this.Organization.sector,Validators.required);
    this.typeCtrl = new FormControl(this.Organization.type,Validators.required);
    this.legalizedCtrl = new FormControl(this.Organization.legalized,Validators.required);
    this.mensCtrl = new FormControl(this.Organization.partners.mens,[Validators.required,Validators.pattern(new RegExp(/^\d{1,8}$/))]);
    this.womensCtrl = new FormControl(this.Organization.partners.womens,[Validators.required,Validators.pattern(new RegExp(/^\d{1,8}$/))]);
    this.beneficiariesCtrl = new FormControl(this.Organization.beneficiaries,[Validators.required,Validators.pattern(new RegExp(/^\d{1,8}$/))]);
    this.cantonCtrl = new FormControl(this.Organization.ubication.canton,Validators.required);
    this.recintoCtrl = new FormControl(this.Organization.ubication.recinto,Validators.required);
    this.parroquiaCtrl = new FormControl(this.Organization.ubication.parroquia,Validators.required);
    this.organizationForm = new FormGroup({
      name : this.nameCtrl,
      foundation_date : this.foundation_dateCtrl,
      sector: this.sectorCtrl,
      type: this.typeCtrl,
      legalized: this.legalizedCtrl,
      partners: new FormGroup({
        mens: this.mensCtrl,
        womens: this.womensCtrl
      }),
      beneficiaries: this.beneficiariesCtrl,
      ubication: new FormGroup({
        canton: this.cantonCtrl,
        recinto: this.recintoCtrl,
        parroquia: this.parroquiaCtrl
      })
    });
    this.organizationForm.disable();
  }

  setOlder(){
    let anio = this.foundation_dateCtrl.value.split('/')[2];
    if(anio >= 2019) this.isOlder = false;
    else this.isOlder = true;
  }

  updateOrganization(){
    let body : any = this.organizationForm.value;
    body.isOlder = this.isOlder;
    this._service.updateOrganization(body,this.Organization._id).subscribe(
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
        this.editMode = false;
        this.organizationForm.disable();
        this._snackBar.open('Se han guardado los cambios correctamente.','ENTENDIDO',{duration: 3000});
      },error => this._snackBar.open('Ocurrió un problema al guardar los cambios.','ENTENDIDO',{duration: 3000})
    );
  }

  edit(){
    this.editMode = true;
    this.organizationForm.enable();
  }

  onCancel(){
    if(confirm('Todos los cambios no guardados se perderán.\n\n¿Desea continuar?')){
      this.editMode = false;
      this.organizationForm.disable();
      this.organizationForm.reset({
        name : this.Organization.name,
        foundation_date : this.Organization.foundation_date,
        sector: this.Organization.sector,
        type: this.Organization.type,
        legalized: this.Organization.legalized,
        partners: new FormGroup({
          mens: this.Organization.partners.mens,
          womens: this.Organization.partners.womens
        }),
        beneficiaries: this.Organization.beneficiaries,
        ubication: new FormGroup({
          canton: this.Organization.ubication.canton,
          recinto: this.Organization.ubication.recinto,
          parroquia: this.Organization.ubication.parroquia
        })
      });
    }
  }

}
