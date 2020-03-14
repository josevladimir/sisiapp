import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-new-organization-preference',
  templateUrl: './new-organization-preference.component.html'
})
export class NewOrganizationPreferenceComponent {

  constructor(
    public dialogRef: MatDialogRef<NewOrganizationPreferenceComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      
    }

  onNoClick(msg : string) : void {
    this.dialogRef.close(msg);
  }
  
}
