import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'forProjects'
})
export class ForProjectsPipe implements PipeTransform {

  transform(value: unknown, args: string): unknown {
    if(args){
      switch(args){
        case 'baseline-diff-type':
          if(value == 'individual') return 'Individual';
          if(value == 'grupos') return 'Agrupada';
        case 'baseline-diff-by':
          if(value == 'sectors') return 'Sector';
          if(value == 'types') return 'Tipo';
        case 'organizations-diff':
          if(value == 'newer') return 'Nueva';
          if(value == 'older') return 'Antigua';
        case 'baseline-value':
          if(!value) return 'N/A';
        default:
          return value;
      }
    } 
    return value;
  }

}
