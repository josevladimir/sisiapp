import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-funders-link',
  templateUrl: './funders-link.component.html'
})
export class FundersLinkComponent {
  
  constructor(
    public dialogRef: MatDialogRef<FundersLinkComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      this.data.seleccion = [];
      for(let i = 0; i < this.data.actualFunders.length; i++){
        for(let j = 0; j < this.data.Funders.length; j++){
          if(this.data.actualFunders[i]._id == this.data.Funders[j]._id){
            this.data.Funders.splice(j,1);
            break;
          }
        }
      }

    }

  onNoClick(msg : string) : void {
    this.dialogRef.close(msg);
  }

  OnFundersListChange(id : string){
    this.data.seleccion.push(id);
  }

}
