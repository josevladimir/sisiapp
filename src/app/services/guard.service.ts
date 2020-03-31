import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthServiceService } from './auth-service.service';

@Injectable({
  providedIn: 'root'
})
export class GuardService implements CanActivate {

  constructor(private router: Router,
              private authService : AuthServiceService) { }

  canActivate() {
    // If the user is not logged in we'll send them back to the home page
    if (!this.authService.isLogged()) {
        console.log('no permiso');
        this.router.navigateByUrl('/login');
        return false;
    }
    return true;
  }
}
