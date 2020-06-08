import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'forFunders'
})
export class ForFundersPipe implements PipeTransform {

  transform(value: unknown, args: string): unknown {
    if(args == 'criteria'){
      switch(value){
        case 'individual': return 'Individual';
        case 'type': return 'Por Tipo';
        case 'sector': return 'Por Sector';
        default: return value;
      }
    }
    return value;
  }

}
