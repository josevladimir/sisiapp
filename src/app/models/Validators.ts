import { FormControl } from '@angular/forms';

export abstract class MyValidators {
    
    static isBlank( control: FormControl ) : {[s:string]:boolean} {
      if(!(control.value.trim()).length) return {isBlank: true};
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

}