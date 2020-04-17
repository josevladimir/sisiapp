import { FormControl } from '@angular/forms';

export abstract class MyValidators {
    
    static isBlank( control: FormControl ) : {[s:string]:boolean} {
      if(!(control.value.trim()).length) return {isBlank: true};
      return null;
    }

    static isDurationValid( control: FormControl ) : {[s:string]:boolean} {
      if((control.value%12)) return {isInvalid: true};
      return null;
    }

    static existFunder( control: FormControl ) : {[s:string]:boolean} {
      if(!control.value) return null;
      if(localStorage.getItem('funders')) {
        let funders = JSON.parse(localStorage.getItem('funders'));
        let result = funders.filter(funder => funder.name.toLowerCase() == control.value.toLowerCase());
        if(result.length) return {exist: true};
      }
      return null;
    }

    static existOrganization( control: FormControl ) : {[s:string]:boolean} {
      if(localStorage.getItem('organizations')) {
        let organizations = JSON.parse(localStorage.getItem('organizations'));
        let result = organizations.filter(organization => organization.name.toLowerCase() == control.value.toLowerCase());
        if(result.length) return {exist: true};
      }
      return null;
    }

    static existProject( control: FormControl ) : {[s:string]:boolean} {
      if(localStorage.getItem('projects')) {
        let projects = JSON.parse(localStorage.getItem('projects'));
        let result = projects.filter(project => project.name.toLowerCase() == control.value.toLowerCase());
        if(result.length) return {exist: true};
      }
      return null;
    }

    static getMonth(month : number){
      let period : string;
      switch(month){
        case 0:
          period = 'Enero'
          break;
        case 1:
          period = 'Febrero'
          break;
        case 2:
          period = 'Marzo'
          break;
        case 3:
          period = 'Abril'
          break;
        case 4:
          period = 'Mayo'
          break;
        case 5:
          period = 'Junio'
          break;
        case 6:
          period = 'Julio'
          break;
        case 7:
          period = 'Agosto'
          break;
        case 8:
          period = 'Septiembre'
          break;
        case 9:
          period = 'Octubre'
          break;
        case 10:
          period = 'Noviembre'
          break;
        case 11:
          period = 'Diciembre'
          break;
        default:
          break;
      }
  
      return period;
    }
  

}