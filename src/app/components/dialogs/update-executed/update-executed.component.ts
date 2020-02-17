import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'app-update-executed',
  templateUrl: './update-executed.component.html'
})
export class UpdateExecutedComponent  {

  constructor(
    public dialogRef: MatDialogRef<UpdateExecutedComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}
