import { Component } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NewPasswordComponent } from '../../../dialogs/new-password/new-password.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { State } from '../../../../reducers/index';
import * as fromLoadingActions from '../../../../reducers/actions/loading.actions';
import { Observable } from 'rxjs';
import { isEditMode } from '../../../../reducers/selectors/general.selector';
import { editModeSetDisabled } from '../../../../reducers/actions/general.actions';
import { UsersServiceService } from '../../../../services/users-service.service';
import { FundersServiceService } from '../../../../services/funders-service.service';
import { MyValidators } from '../../../../models/Validators';
import { StorageMap } from '@ngx-pwa/local-storage';

@Component({
  selector: 'app-users-view',
  templateUrl: './users-view.component.html'
})
export class UsersViewComponent {

  User : any;

  UserForm : FormGroup;

  isEditMode : Observable<boolean>;

  Funders : any[];

  $organizations : any[];
  $preferences : any;

  filteredOrganizations : any[] = [];

  DeleteBtn : () => void = () =>{
    if(confirm('¿Está seguro que desea eliminar este Usuario?\n\nEsta acción no se puede deshacer.')){
      this._store.dispatch(fromLoadingActions.initLoading({message: 'Eliminando el Usuario...'}));
      this._userService.deleteUser(this.User._id);
    }
  }

  constructor(private _userService : UsersServiceService,
              private _fundersService : FundersServiceService,
              private _ActivatedRoute : ActivatedRoute,
              private _snackBar : MatSnackBar,
              private dialog : MatDialog,
              private storage : StorageMap,
              private _store: Store<State>) {

    this.storage.get('preferences').subscribe(preferences => this.$preferences = preferences);
    this.storage.get('organizations').subscribe((organizations : any) => this.$organizations = organizations);

    this.isEditMode = this._store.select(isEditMode);

    this._fundersService.getFundersOff().subscribe(funders => this.Funders = funders);

    this._ActivatedRoute.params.subscribe(
      (params : Params) => {
        this.User = this._userService.getUser().subscribe(users => {
          this.User =  users.filter(user => user._id == params.id)[0];
          this.getFormFromUser();
        });
      }
    );
    
    
  }

  updateUser(){
    this._store.dispatch(fromLoadingActions.initLoading({message: 'Actualizando usuario...'}));
    let body = this.UserForm.value;
    if(body.role == 'Financiador' && !body.funder) return alert('Es necesario que indique a que financiador representa este usuario.');
    else if(body.role != 'Financiador') delete body.funder;
    this._userService.updateOnlyUser(body,this.User._id).subscribe(
      result => {
        if(result.message == 'UPDATED'){
          this.User = result.user;
          this.getFormFromUser();
          this._store.dispatch(editModeSetDisabled());
          this._store.dispatch(fromLoadingActions.stopLoading());
          this._snackBar.open('Usuario actualizado correctamente.','ENTENDIDO',{duration: 3000});
          //this._service.updateUsersList(null);
        }
      },error => {
        this._store.dispatch(fromLoadingActions.stopLoading());
        this._snackBar.open('Ha ocurrido un error al guardar el usuario.','ENTENDIDO',{duration: 3000});
      }
    )
  }

  cancel(){
    if(confirm('Los cambios que no se han guardados se perderán.\n\n¿Desea continua?')) {
      this._store.dispatch(editModeSetDisabled());
      this.getFormFromUser();
    }
  }

  getFormFromUser(){
    let funder : string = '';
    if(this.User.funder) funder = this.User.funder._id;
    this.UserForm = new FormGroup({
      username: new FormControl(this.User.username,[Validators.required,MyValidators.isBlank]),
      name: new FormControl(this.User.name,[Validators.required,MyValidators.isBlank]),
      last_names: new FormControl(this.User.last_names,[Validators.required,MyValidators.isBlank]),
      email: new FormControl(this.User.email,[Validators.required,MyValidators.isBlank,Validators.pattern(new RegExp(/^[_a-z0-9-]+(.[_a-z0-9-]+)*@[a-z0-9-]+(.[a-z0-9-]+)*(.[a-z]{2,4})$/))]),
      position: new FormControl(this.User.position,[Validators.required,MyValidators.isBlank]),
      role:new FormControl(this.User.role,[Validators.required]),
      funder: new FormControl(funder),
      organizations: new FormGroup({
        criteria: new FormControl(this.User.organizations.criteria),
        criteriaItem: new FormArray([]),
        organizations: new FormArray([])
      })
    });

    for(let i = 0; i < this.User.organizations.organizations.length; i++){
      (<FormArray> this.UserForm.get('organizations').get('organizations')).push(new FormGroup({
        name: new FormControl(this.User.organizations.organizations[i].name),
        id: new FormControl(this.User.organizations.organizations[i].id),
        criteria: new FormControl(this.User.organizations.organizations[i].criteria)
      }));
      this.filteredOrganizations.push({
        name: this.User.organizations.organizations[i].name,
        _id: this.User.organizations.organizations[i].id
      });
    }

    for(let i = 0; i < this.User.organizations.criteriaItem.length; i++){
      (<FormArray> this.UserForm.get('organizations').get('criteriaItem')).push(new FormControl(this.User.organizations.criteriaItem[i]));
    }

  }

  getStatus(type: string, value: string) : boolean{
    if(type == 'individual'){
      for(let i = 0; i < this.User.organizations.organizations.length; i++){
        if((<FormArray> this.UserForm.get('organizations').get('organizations')).at(i).get('id').value == value) return true
      }
    }else if(type == 'criteria'){
      for(let i = 0; i < this.User.organizations.criteriaItem.length; i++){
        if((<FormArray> this.UserForm.get('organizations').get('criteriaItem')).at(i).value == value) return true
      }
    }
    return false;
  }

  generateNewPassword(){
    const dialogRef = this.dialog.open(NewPasswordComponent, {
      width: '550px',
      data: {password: ''}
    });

    dialogRef.afterClosed().subscribe(passwords => {
      if(passwords){
        /**Actualizar Contraseña */
        this._store.dispatch(fromLoadingActions.initLoading({message: 'Guardando los cambios...'}));
        this._userService.updateUser({password: passwords.password},this.User._id);
      }
    });
  }

  changeCriteria(value){
    if(value == 'individual') return this.filteredOrganizations = [];
  }

  onOrganizationChange(id : string){
    let ready : boolean = false;
    let index : number = null;
    
    for(let i = 0; i < (<FormArray> this.UserForm.get('organizations').get('organizations')).length; i++){
      if((<FormArray> this.UserForm.get('organizations').get('organizations')).at(i).get('id').value == id) {
        ready = true;
        index = i;
        break;
      }
    }

    if(ready){ //Si está, hay que eliminar
      (<FormArray> this.UserForm.get('organizations').get('organizations')).removeAt(index);
    }else{ //No está, hay que agregar
      let organization = this.formatOrganization(this.$organizations.filter(organization => organization._id == id)[0]);
      (<FormArray> this.UserForm.get('organizations').get('organizations')).push(new FormGroup({
        name: new FormControl(organization.name),
        id: new FormControl(organization.id)
      }));
    }

  }

  formatOrganization(organization : any) : any{
    return {
      name: organization.name,
      id: organization._id,
      sector: organization.sector,
      type: organization.type
    }
  }

  onCriteriaItemChange(value){
    let ready : boolean = false;
    let index : number = null;
    
    for(let i = 0; i < (<FormArray> this.UserForm.get('organizations').get('criteriaItem')).length; i++){
      if((<FormArray> this.UserForm.get('organizations').get('criteriaItem')).at(i).value == value) {
        ready = true;
        index = i;
        break;
      }
    }

    if(ready){ //Hay que eliminarlo
      (<FormArray> this.UserForm.get('organizations').get('criteriaItem')).removeAt(index);
      for(let i = ((<FormArray> this.UserForm.get('organizations').get('organizations')).length - 1); i >= 0; i--){
        if((<FormArray> this.UserForm.get('organizations').get('organizations')).at(i).get('criteria').value == value) {
          (<FormArray> this.UserForm.get('organizations').get('organizations')).removeAt(i);
          this.filteredOrganizations.splice(i,1);
        }
      }
    }else{ //Hay que agregarlo
      let criteria : string = this.UserForm.get('organizations').get('criteria').value; 

      (<FormArray> this.UserForm.get('organizations').get('criteriaItem')).push(new FormControl(value));
      for(let i = 0; i < this.$organizations.length; i++){
        if(this.$organizations[i][criteria] == value) {
          let organization : any = this.formatOrganization(this.$organizations[i]);
          (<FormArray> this.UserForm.get('organizations').get('organizations')).push(new FormGroup({
            name: new FormControl(organization.name),
            id: new FormControl(organization.id),
            criteria: new FormControl(organization[criteria])
          }));
          this.filteredOrganizations.push({
            name: organization.name,
            _id: organization.id
          });
        }
      }
    }

  }

  onRemoveListener(id){
    let ready : boolean = false;
    let index : number = null;

    for(let i = 0; i < (<FormArray> this.UserForm.get('organizations').get('organizations')).length; i++){
      console.log((<FormArray> this.UserForm.get('organizations').get('organizations')).at(i).get('id').value, id);
      if((<FormArray> this.UserForm.get('organizations').get('organizations')).at(i).get('id').value == id){
        ready = true;
        index = i;
        break;
      }
    }

    if(ready){ //Si está, a quitarlo
      (<FormArray> this.UserForm.get('organizations').get('organizations')).removeAt(index);
    }else{ // No está, a ponerlo
      for(let i = 0; i < this.$organizations.length; i++){
        if(this.$organizations[i]._id == id){
          let organization : any = this.formatOrganization(this.$organizations[i]);
          let criteria : string = this.UserForm.get('organizations').get('criteria').value;
          (<FormArray> this.UserForm.get('organizations').get('organizations')).push(new FormGroup({
            name: new FormControl(organization.name),
            id: new FormControl(organization.id),
            criteria: new FormControl(organization[criteria])
          }));
          break;
        }
      }
    }

  }

}
