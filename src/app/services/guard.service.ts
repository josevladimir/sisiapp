import { Injectable } from '@angular/core';
import { CanActivate, Router, CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Store } from '@ngrx/store';
import { State } from '../reducers';
import { isAuth } from '../reducers/selectors/session.selector';
import { StorageMap } from '@ngx-pwa/local-storage';

@Injectable({
  providedIn: 'root'
})
export class GuardService implements CanActivate {

  //isAuth : boolean;

  constructor(private router: Router,
              private storage : StorageMap) {}

  isAuth() {
    return new Promise(resolve => {
      this.storage.get('session').subscribe((session : any) => {
        resolve(session.isAuth);
      });
    });
  }

  async canActivate() {
    // If the user is not logged in we'll send them back to the home page
    let authentication = await this.isAuth();
    if (!authentication) {
        console.log('no permiso');
        this.router.navigateByUrl('/login');
        return false;
    }
    return true;
  }
}

@Injectable({
  providedIn: 'root'
})
export class GuardServiceChild implements CanActivateChild {

  constructor(private router: Router,
              private storage : StorageMap) {}

  isAuth() {
    return new Promise(resolve => {
      this.storage.get('session').subscribe((session : any) => {
        resolve(session.isAuth);
      });
    });
  }

  async canActivateChild(route : ActivatedRouteSnapshot, state : RouterStateSnapshot) {
    // If the user is not logged in we'll send them back to the home page
    let authentication = await this.isAuth();
    if (!authentication) {
        console.log('no permiso');
        this.router.navigateByUrl('/login');
        return false;
    }
    return true;
  }
}
