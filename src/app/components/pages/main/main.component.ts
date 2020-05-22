import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { State } from '../../../reducers/index';
import { User } from '../../../reducers/actions/session.actions';
import { AppServiceService } from '../../../services/app-service.service';
import { getUserData } from '../../../reducers/selectors/session.selector';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html'
})
export class MainComponent implements OnInit {

  userData : User;

  assetsUrl : string = environment.assetsUrl;

  year : number = new Date().getFullYear();

  constructor(private store : Store<State>,
              private appService : AppServiceService) {
    //Subscribe to Store
    this.store.select(getUserData).subscribe((data : User) => {this.userData = data; if(data.token) this.appService.initializeApp()});
  }

  ngOnInit() {
  }

  logout(){
    this.appService.closeApp();
  }

}
