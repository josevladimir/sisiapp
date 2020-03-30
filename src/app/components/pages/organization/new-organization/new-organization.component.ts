import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SisiCoreService } from '../../../../services/sisi-core.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NewOrganizationPreferenceComponent } from '../../../dialogs/new-organization-preference/new-organization-preference.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSelect } from '@angular/material/select';
import { Store } from '@ngrx/store';
import { State } from 'src/app/reducers';
import * as fromLoadingActions from '../../../../reducers/actions/loading.actions';

@Component({
  selector: 'app-new-organization',
  templateUrl: './new-organization.component.html'
})
export class NewOrganizationComponent implements OnInit {

  organizationForm : FormGroup;

  Sectors : any[] = this._service.getSectorsOff();
  Types : any[] = this._service.getTypesOff();

  isOlder : boolean = false;

  newSector : boolean = false;

  nameCtrl : FormControl = new FormControl('',[Validators.required,this._service.existOrganization]);
  foundation_dateCtrl : FormControl = new FormControl('',[Validators.required]);
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
              private dialog : MatDialog,
              private _store : Store<State>) { }

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
    let anio : number = event.value.getFullYear();
    if(anio >= 2019) this.isOlder = false;
    else this.isOlder = true;
  }

  saveOrganization(){
    this._store.dispatch(fromLoadingActions.initLoading({message: 'Guardando nueva organización...'}));
    let organization = this.organizationForm.value;
    organization.created_by = localStorage.getItem('userID');
    organization.isOlder = this.isOlder;

    this._service.createOrganization(organization).subscribe(
      result => {
        this._service.updateOrganizationsList(true);
        this._store.dispatch(fromLoadingActions.stopLoading());
        this._snackBar.open('La organización se registró correctamente.','ENTENDIDO',{duration: 3000});

      },error => {
        this._store.dispatch(fromLoadingActions.stopLoading());
        this._snackBar.open('Ocurrió un error al guardar la organización.','ENTENDIDO',{duration: 3000});
      }
    );
  }

  /**
   * Sectors
   */
  addNewSector(SelectSectors : MatSelect){
    const dialogRef = this.dialog.open(NewOrganizationPreferenceComponent, {
      width: '550px',
      data: {preference: 'sectors'}
    });

    SelectSectors.close();

    dialogRef.afterClosed().subscribe(sector => {
      if(sector){
        /**Actualizar Financiadores */
        this._service.addNewOrganizationPreference({sector}).subscribe(
          result => {
            console.log(result);
            this.Sectors.push(sector);
            this._service.updatePreferencesList();
            this._snackBar.open('Se añadió correctamente el sector.','ENTENDIDO',{duration : 3000});
          },error =>{
            this._snackBar.open('Ocurrió un error al registrar un nuevo sector.','ENTENDIDO',{duration: 3000});
          });
      }
    });
  }

  addNewType(TypesSelect : MatSelect){
    const dialogRef = this.dialog.open(NewOrganizationPreferenceComponent, {
      width: '550px',
      data: {preference: 'types'}
    });

    TypesSelect.close();

    dialogRef.afterClosed().subscribe(type => {
      if(type){
        /**Actualizar Financiadores */
        this._service.addNewOrganizationPreference({type}).subscribe(
          result => {
            console.log(result,type);
            this.Types.push(type);
            this._service.updatePreferencesList();
            this._snackBar.open('Se añadió correctamente el tipo.','ENTENDIDO',{duration : 3000});
          },error => this._snackBar.open('Ocurrió un error al registrar un nuevo tipo.','ENTENDIDO',{duration: 3000})
        )
      }
    });
  }

}
