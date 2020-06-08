import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl, ValidatorFn, FormArray } from '@angular/forms';
import { Store } from '@ngrx/store';
import { State } from 'src/app/reducers';
import * as fromLoadingActions from '../../../../reducers/actions/loading.actions';
import { UsersServiceService } from '../../../../services/users-service.service';
import { MyValidators } from '../../../../models/Validators';
import { FundersServiceService } from '../../../../services/funders-service.service';
import { Observable } from 'rxjs';
import { StorageMap } from '@ngx-pwa/local-storage';

@Component({
  selector: 'app-new-users',
  templateUrl: './new-users.component.html'
})
export class NewUsersComponent {

  filteredOrganizations : any[] = [];

  UserForm : FormGroup;
  Repassword : string = '';
  
  Funders : any[];

  $organizations : any[];
  $preferences : any;

  constructor(private _usersService : UsersServiceService,
              private _fundersService : FundersServiceService,
              private storage : StorageMap,
              private _store : Store<State>) { 

    this.storage.get('preferences').subscribe(preferences => this.$preferences = preferences);
    this.storage.get('organizations').subscribe((organizations : any) => this.$organizations = organizations);
    
    this.UserForm = new FormGroup({
      username: new FormControl('',[Validators.required,MyValidators.isBlank/*,MyValidators.existUser*/]),
      name: new FormControl('',[Validators.required,MyValidators.isBlank]),
      last_names: new FormControl('',[Validators.required,MyValidators.isBlank]),
      email: new FormControl('',[Validators.required,MyValidators.isBlank,Validators.pattern(new RegExp(/^[_a-z0-9-]+(.[_a-z0-9-]+)*@[a-z0-9-]+(.[a-z0-9-]+)*(.[a-z]{2,4})$/))]),
      position: new FormControl('',[Validators.required,MyValidators.isBlank]),
      password: new FormControl('',[Validators.required,MyValidators.isBlank,Validators.minLength(10)]),
      funder: new FormControl(''),
      repassword: new FormControl(''),
      role: new FormControl('',[Validators.required]),
      organizations: new FormGroup({
        criteria: new FormControl('individual'),
        organizations: new FormArray([]),
        criteriaItem: new FormArray([])
      })
    });
    this.UserForm.get('repassword').setValidators([Validators.required,MyValidators.isBlank,this.ComparePass(this.UserForm.get('password'))]);
    this._fundersService.getFundersOff().subscribe(funders => this.Funders = funders);
  }

  ComparePass(otherControl: AbstractControl): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} => {
      const value: any = control.value;
      const otherValue: any = otherControl.value;
      return otherValue === value ? null : { 'notMatch': { value, otherValue } };
    };
  }

  createUser(){
    this._store.dispatch(fromLoadingActions.initLoading({message: 'Guardando Usuario...'}));
    let body = this.UserForm.value;
    delete body.repassword;
    if(body.role == 'Financiador' && !body.funder) return alert('Es necesario que indique a que financiador representa este usuario.');
    else if(body.role != 'Financiador') delete body.funder;
    this._usersService.createUser(body);
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
