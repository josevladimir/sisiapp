import { Injectable } from '@angular/core';
import { FundersServiceService, Funder } from './funders-service.service';
import { OrganizationsServiceService } from './organizations-service.service';
import { PreferencesServiceService } from './preferences-service.service';
import { DocumentsServiceService } from './documents-service.service';
import { IndicatorsServiceService } from './indicators-service.service';
import { UsersServiceService } from './users-service.service';
import { ProjectsServiceService } from './projects-service.service';
import { SocketioService } from './socketio.service';
import { Store } from '@ngrx/store';
import { State } from '../reducers';
import * as fromLoading from '../reducers/actions/loading.actions';
import { getUserRole, getUserId, getUserData } from '../reducers/selectors/session.selector';
import { HeadersGenerator } from './headersGenerator.service';
import { StorageMap } from '@ngx-pwa/local-storage';
import { stopLoading, initLoading } from '../reducers/actions/loading.actions';
import { Router } from '@angular/router';
import { logout, User } from '../reducers/actions/session.actions';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppServiceService {

  constructor(private store : Store<State>,
              private Router : Router,
              private socket : SocketioService,
              private storage : StorageMap,
              private usersService : UsersServiceService,
              private fundersService : FundersServiceService,
              private headerGenerator : HeadersGenerator,
              private projectsService : ProjectsServiceService,
              private documentsService : DocumentsServiceService,
              private indicatorsService : IndicatorsServiceService,
              private preferencesService : PreferencesServiceService,
              private organizationsService : OrganizationsServiceService) {}

  initializeApp(){
    let userData : User;
    this.store.select(getUserData).subscribe((user : User) => userData = user);
    this.socket.globalConnect();
    this.socket.emit('subscribeUser',userData);
    this.setUpSocketEventsListener();
    this.store.dispatch(fromLoading.initLoading({message: 'Inicializando el Sistema...'}));
    if(userData.role != 'Financiador') this.fundersService.getFunders();
    this.organizationsService.getOrganizations();
    if(userData.role != 'Financiador') this.indicatorsService.getIndicators();
    this.projectsService.getProjects((userData.role == 'Financiador'));
    if(userData.role != 'Financiador') this.documentsService.getDocuments();
    if(userData.role == 'Administrador') this.usersService.getUsers();
    this.store.dispatch(fromLoading.stopLoading());
  }

  closeApp(){
    let id : string;
    this.store.select(getUserId).subscribe((_id : string) => id = _id);
    this.socket.disconnect();
    this.store.dispatch(initLoading({message: 'Cerrando Sesión...'}));
    this.store.dispatch(logout());
    this.storage.clear().subscribe(() => this.store.dispatch(stopLoading()));
    this.Router.navigateByUrl('/login');
  }

  setUpSocketEventsListener(){
    this.socket.listen('funderWasCreated').subscribe((funder :Funder) => this.fundersService.addToStorage(funder,true));
    this.socket.listen('funderWasUpdated').subscribe(() => this.fundersService.updateFundersOnStorage(true));
    this.socket.listen('funderWasDeleted').subscribe((id : string) => this.fundersService.removeFromStorage(id,true));
  }

}
