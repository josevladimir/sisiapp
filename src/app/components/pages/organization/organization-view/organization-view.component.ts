import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { SisiCoreService } from '../../../../services/sisi-core.service';
import { FormGroup,FormControl,Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ToolbarButton } from '../../../shared/sub-toolbar/sub-toolbar.component';

@Component({
  selector: 'app-organization-view',
  templateUrl: './organization-view.component.html'
})
export class OrganizationViewComponent implements OnInit{

  buttons : ToolbarButton[];

  Organization : any;

  organizationForm : FormGroup;

  userRole : string = localStorage.getItem('userRole');

  editMode : boolean = false;

  isOlder : boolean = false;

  isWorking : boolean = false;
  loadingMessage : string;

  nameCtrl : FormControl;
  foundation_dateCtrl : FormControl;
  sectorCtrl : FormControl;
  typeCtrl : FormControl;
  legalizedCtrl : FormControl;
  beneficiariesCtrl : FormControl;
  cantonCtrl : FormControl;
  recintoCtrl : FormControl;
  parroquiaCtrl : FormControl;


  constructor(private _ActivatedRoute : ActivatedRoute,
              private _service : SisiCoreService,
              private _snackBar : MatSnackBar,
              private _Router : Router) {
    
    this._ActivatedRoute.params.subscribe(
      (params : Params) => this.Organization = this._service.getOrganization(params.id)
    );

    this.buttons  = [
      {
        message: 'SOCIOS',
        hasIcon: true,
        icon: 'people',
        handler: () => {
          this._Router.navigate(['organizations',this.Organization._id,'partners']);
        }
      },
      {
        message: 'ELIMINAR',
        hasIcon: true,
        icon: 'delete',
        handler: () => {
          if(confirm('¿Está seguro que desea eliminar esta Organización?\n\nEsta acción no se puede deshacer.')) {
            this.loadingMessage = 'Eliminando la Organización ...';
            this.isWorking = true;
            this._service.deleteOrganization(this.Organization._id).subscribe(
            result => {
              if(result.message == 'DELETED'){
                this._service.updateOrganizationsList(true);
                this.isWorking = false;
                this._snackBar.open('Se eliminó la Organización correctamente.','ENTENDIDO',{duration: 3000});
              }
            },error => {
              this.isWorking = false;
              this._snackBar.open('Ocurrió un error al eliminar la Organización.','ENTENDIDO',{duration: 3000})
            }
          )
          }
        }
      }
    ];
    
  }

  ngOnInit(){
    this.nameCtrl = new FormControl(this.Organization.name,[Validators.required,this._service.existOrganization]);
    this.foundation_dateCtrl = new FormControl(this.Organization.foundation_date,[Validators.required,Validators.pattern(new RegExp(/^(0?[1-9]|[12][0-9]|3[01])[\/](0?[1-9]|1[012])[/\\/](19|20)\d{2}$/))]);
    this.sectorCtrl = new FormControl(this.Organization.sector,Validators.required);
    this.typeCtrl = new FormControl(this.Organization.type,Validators.required);
    this.legalizedCtrl = new FormControl(this.Organization.legalized,Validators.required);
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
    this.loadingMessage = 'Guardando los cambios...'
    this.isWorking = true;
    let body : any = this.organizationForm.value;
    body.isOlder = this.isOlder;
    body.last_updated_by = localStorage.getItem('userID');
    this._service.updateOrganization(body,this.Organization._id).subscribe(
      result => {
        this.Organization = result.organization;
        this._service.updateOrganizationsList(null);
        this.editMode = false;
        this.organizationForm.disable();
        this.isWorking = false;
        this._snackBar.open('Se han guardado los cambios correctamente.','ENTENDIDO',{duration: 3000});
      },error => {
        this.isWorking = false;
        this._snackBar.open('Ocurrió un problema al guardar los cambios.','ENTENDIDO',{duration: 3000});
      }
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
