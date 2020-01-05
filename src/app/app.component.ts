import { Component } from '@angular/core';
import { SisiCoreService } from './services/sisi-core.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent {
  
  title = 'sisiapp';
  
  auth : boolean = false;

  userData : any;

  loadingMessage : string;

  isWorking : boolean = false;

  constructor(private _service : SisiCoreService,
              private _snackBar : MatSnackBar){
    if(localStorage.getItem('authenticated') == 'true'){
      this.userData = JSON.parse(localStorage.getItem('user'));
      this.auth = true;
    }
  }

  Authenticate(){
    this.userData = JSON.parse(localStorage.getItem('user')); 
    localStorage.setItem('authenticated','true');
    localStorage.setItem('userID',this.userData._id);
    localStorage.setItem('userRole',this.userData.role);
    this.auth = true;
    this.isWorking = true;
    this.loadingMessage = 'Estamos cargando la información...';
    this._service.getFunders().subscribe(
      result => {
        if(result.message == 'OK') localStorage.setItem('funders',JSON.stringify(result.funders));
      },error => this._snackBar.open('Error recuperando los financiadores.','ENTENDIDO',{duration: 3000})
    );
    this._service.getOrganizations().subscribe(
      result => {
        if(result.message == 'OK') localStorage.setItem('organizations',JSON.stringify(result.organizations));
      },error => this._snackBar.open('Error recuperando las organizaciones.','ENTENDIDO',{duration: 3000})
    );
    this._service.getProjects().subscribe(
      result => {
        if(result.message == 'OK') localStorage.setItem('projects',JSON.stringify(result.projects));
      },error => this._snackBar.open('Error recuperando los proyectos.','ENTENDIDO',{duration: 3000})
    );
    this._service.getIndicators().subscribe(
      result => {
        if(result.message == 'OK') localStorage.setItem('indicators',JSON.stringify(result.indicators));
      },error => this._snackBar.open('Error recuperando los indicadores.','ENTENDIDO',{duration: 3000})
    );
  }
  
  loadingView(options : any){
    this.isWorking = options.isWorking;
    this.loadingMessage = options.message;
  }

  logout(){
    localStorage.removeItem('user');
    localStorage.removeItem('funders');
    localStorage.removeItem('projects');
    localStorage.removeItem('organizations');
    localStorage.removeItem('indicators');
    this.userData = null;
    this.auth = false;
    localStorage.setItem('authenticated','false');
  }

}
