import { Component, OnInit } from '@angular/core';
import { SisiCoreService } from './services/sisi-core.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent implements OnInit {
  
  title = 'sisiapp';
  
  auth : boolean = false;

  userData : any;

  loadingMessage : string;

  isWorking : boolean = false;

  userRole : string = localStorage.getItem('userRole');

  constructor(private _service : SisiCoreService,
              private _snackBar : MatSnackBar,
              private _Router : Router){
    
  }

  ngOnInit(){
    if(localStorage.getItem('authenticated') == 'true'){
      this.loadingMessage = 'Inicializando el Sistema...';
      this.isWorking = true;
      this.userData = JSON.parse(localStorage.getItem('user'));
      this.auth = true;
      this.loadingMessage = 'Recuperando los Financiadores...';
      this._service.getFunders().subscribe(
        result => {
          localStorage.setItem('funders',JSON.stringify(result.funders));
          this.loadingMessage = 'Recuperando las Organizaciones...';
          this._service.getOrganizations().subscribe(
            result => {
              localStorage.setItem('organizations',JSON.stringify(result.organizations));
              this.loadingMessage = 'Recuperando los Proyectos...';
              this._service.getProjects().subscribe(
                result => {
                  localStorage.setItem('projects',JSON.stringify(result.projects));
                  this.loadingMessage = 'Recuperando los Indicadores...';
                  this._service.getIndicators().subscribe(
                    result => {
                      localStorage.setItem('indicators',JSON.stringify(result.indicators));
                      this.loadingMessage = 'Recuperando los Usuarios...';
                      this._service.getUsers().subscribe(
                        result => {
                          localStorage.setItem('users',JSON.stringify(result.users));
                          this.loadingMessage = 'Cargando las preferencias...';
                          this._service.getPreferences().subscribe(
                            result => {
                              if(result.message == 'OK'){
                                localStorage.setItem('sectors',JSON.stringify(result.preferences.Organizations.Sectors));
                                localStorage.setItem('types',JSON.stringify(result.preferences.Organizations.Types));
                              }
                              this.isWorking = false;
                            },error => this._snackBar.open('Error recuperando los usuarios.','ENTENDIDO',{duration: 3000})
                          );
                        },error => this._snackBar.open('Error recuperando los usuarios.','ENTENDIDO',{duration: 3000})
                      );
                    },error => this._snackBar.open('Error recuperando los indicadores.','ENTENDIDO',{duration: 3000})
                  );
                },error => this._snackBar.open('Error recuperando los proyectos.','ENTENDIDO',{duration: 3000})
              );
            },error => this._snackBar.open('Error recuperando las organizaciones.','ENTENDIDO',{duration: 3000})
          );
        },error => this._snackBar.open('Error recuperando los financiadores.','ENTENDIDO',{duration: 3000})
      );
    }
  }

  Authenticate(){
    this._Router.navigate(['dashboard']);
    this.userData = JSON.parse(localStorage.getItem('user')); 
    localStorage.setItem('authenticated','true');
    localStorage.setItem('userID',this.userData._id);
    localStorage.setItem('userRole',this.userData.role);
    this.auth = true;
    this.isWorking = true;
    this.userRole = localStorage.getItem('userRole');
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
        else localStorage.setItem('projects','[]');
      },error => this._snackBar.open('Error recuperando los proyectos.','ENTENDIDO',{duration: 3000})
    );
    this._service.getIndicators().subscribe(
      result => {
        if(result.message == 'OK') localStorage.setItem('indicators',JSON.stringify(result.indicators));
      },error => this._snackBar.open('Error recuperando los indicadores.','ENTENDIDO',{duration: 3000})
    );
    this._service.getUsers().subscribe(
      result => {
        if(result.message == 'OK') localStorage.setItem('users',JSON.stringify(result.users));
      },error => this._snackBar.open('Error recuperando los usuarios.','ENTENDIDO',{duration: 3000})
    );
    this._service.getPreferences().subscribe(
      result => {
        if(result.message == 'OK') {
          localStorage.setItem('sectors',JSON.stringify(result.preferences.Organizations.Sectors));
          localStorage.setItem('types',JSON.stringify(result.preferences.Organizations.Types));
        } 
      },error => this._snackBar.open('Error recuperando los usuarios.','ENTENDIDO',{duration: 3000})
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
