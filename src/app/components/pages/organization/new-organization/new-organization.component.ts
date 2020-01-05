import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SisiCoreService } from '../../../../services/sisi-core.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-new-organization',
  templateUrl: './new-organization.component.html'
})
export class NewOrganizationComponent implements OnInit {

  organizationForm : FormGroup;

  isOlder : boolean = false;

  nameCtrl : FormControl = new FormControl('',[Validators.required,this._service.existOrganization]);
  foundation_dateCtrl : FormControl = new FormControl('',[Validators.required,Validators.pattern(new RegExp(/^(0?[1-9]|[12][0-9]|3[01])[\/](0?[1-9]|1[012])[/\\/](19|20)\d{2}$/))]);
  sectorCtrl : FormControl = new FormControl('',Validators.required);
  typeCtrl : FormControl = new FormControl('',Validators.required);
  legalizedCtrl : FormControl = new FormControl('',Validators.required);
  mensCtrl : FormControl = new FormControl('',[Validators.required,Validators.pattern(new RegExp(/^\d{1,8}$/))]);
  womensCtrl : FormControl = new FormControl('',[Validators.required,Validators.pattern(new RegExp(/^\d{1,8}$/))]);
  beneficiariesCtrl : FormControl = new FormControl('',[Validators.required,Validators.pattern(new RegExp(/^\d{1,8}$/))]);
  cantonCtrl : FormControl = new FormControl('',Validators.required);
  recintoCtrl : FormControl = new FormControl('',Validators.required);
  parroquiaCtrl : FormControl = new FormControl('',Validators.required);

  constructor(private _service : SisiCoreService,
              private _snackBar : MatSnackBar,
              private _router : Router) { }

  ngOnInit() {
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
  }

  setOlder(event){
    let anio = this.foundation_dateCtrl.value.split('/')[2];
    if(anio >= 2019) this.isOlder = false;
    else this.isOlder = true;
  }

  saveOrganization(){
    let organization = this.organizationForm.value;
    organization.created_by = localStorage.getItem('userID');
    organization.isOlder = this.isOlder;

    this._service.createOrganization(organization).subscribe(
      result => {
        let organizations;
        if(JSON.parse(localStorage.getItem('organizations'))) organizations = JSON.parse(localStorage.getItem('organizations'));
        else organizations = [];
        organizations.push(result.organization);
        localStorage.setItem('organizations',JSON.stringify(organizations));
        this._router.navigate(['organizations']);
        this._snackBar.open('La organización se registró correctamente.','ENTENDIDO',{duration: 3000});

      },error => this._snackBar.open('Ocurrió un error al guardar la organización.','ENTENDIDO',{duration: 3000})
    );
  }

}
