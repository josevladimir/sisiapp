import { Component, Input, ViewChild, ElementRef, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SisiCoreService } from '../../../services/sisi-core.service';
import { MatSnackBar } from '@angular/material/snack-bar';

import * as Moment from 'moment';

@Component({
  selector: 'app-upload-box',
  templateUrl: './upload-box.component.html'
})
export class UploadBoxComponent implements OnInit{

  @Input() organization_name : string;
  @Input() organization_id : string;
  @Input() organization_files : any[];

  createFolder : boolean = false;

  isFilesPristine : boolean = true;

  fileDir : string[] = [];

  filesForm : FormData = new FormData();
  
  files: any[];

  nameCtrl : FormControl = new FormControl('',Validators.required);
  newFolderForm : FormGroup = new FormGroup({
    name: this.nameCtrl
  });

  constructor(private _service : SisiCoreService,
              private _snackbar : MatSnackBar) {
                let entity = document.location.pathname.split('/')[1];
                this.fileDir.push(entity);
              }
              
  ngOnInit(){
    if(this.organization_files){
      this.files = this.organization_files;
      this.files.forEach(file => file.status = 'Subido');
    }
    else this.files = [];
    this.fileDir.push(this.organization_name);
  }

  /*FILES*/
  onAddNewFile(event){
    if(event.target.files && event.target.files.length > 0){
      
      for(let i = 0; i < event.target.files.length; i++){
        let file = event.target.files[i];
        let name = file.name.split('.');
        this.files.push({
          name: name[0],
          folder: this.organization_name,
          file: file.name,
          ext: name[1],
          type: getTypeFromExt(name[1]),
          description: 'descripcion',
          status: 'Pendiente',
          tamaño: convertSize(file.size),
          fileObj: file 
        });
        this.isFilesPristine = false;
      
      }
    }
  }

  deleteFile (index : number) {
    if(this.files[index].status == 'Subido'){
      if(confirm('Este archivo se encuentra subido en el servidor. Esta acción no se puede deshacer.\n¿Realmente desea eliminarlo?')){
        this._service.deleteFile(this.files[index]._id).subscribe(
          result => {
            if(result.message == 'OK'){
              let organizations = JSON.parse(localStorage.organizations);
              organizations.forEach((organization,i) => {
                if(organization._id == result.organization_id){
                  organizations.splice(i,1);
                  organizations.push(result.organization)
                }
              });
              localStorage.setItem('organizations',JSON.stringify(organizations));
              this.files.splice(index,1);
              this._snackbar.open('Se ha eliminado el Archivo.','ENTENDIDO',{duration: 3000});
            }
          },
          error => this._snackbar.open('Error al eliminar el archivo.','ENTENDIDO',{duration: 3000})
        );
      }
    }else this.files.splice(index,1);
  }

  uploadFiles () {
    this.filesForm = new FormData();
    let details = [];
    this.files.forEach(file => {
      if(file.status == 'Pendiente'){
        let name = `${file.name.replace(/ /g,'-')}_${Moment.now()}.${file.ext}`;
        this.filesForm.append('multi-files',file.fileObj,name);
        details.push({
          name: file.name,
          organization: this.organization_id,
          type: file.type,
          file: name,
          ext: file.ext,
          size: file.tamaño,
          entity: 'Organizaciones'
        });
      }
    });
    this.filesForm.append('details',JSON.stringify(details));
    this.filesForm.append('entity','Organization');
    this.filesForm.append('id',this.organization_id);
    this._service.uploadFile(this.filesForm).subscribe(
      result => {
        if(result.message =="OK"){
          this._service.updateOrganizationsList(null);
          this.isFilesPristine = true;
          let counter = 0;
          this.files.forEach(file => {
            if(file.status == 'Pendiente'){
              file._id = result.documents[counter]._id;
              file.status = 'Subido';
              counter++;
            }
          });
          this._snackbar.open('Archivos Subidos correctamente.','ENTENDIDO',{duration: 3000});
        }
      },error => this._snackbar.open('Ha ocurrido un error.','ENTENDIDO',{duration: 3000})
    );
  }

}

interface Folder {
  name : string,
  files : File[]
}

interface File {
  name : string,
  type : string,
  size : string,
  path : string,
  description : string
}

export function getTypeFromExt(ext : String) : String{
  if(ext == 'jpg' || ext == 'jpeg' || ext == 'png') return 'Imagen';
  else if(ext == 'doc' || ext == 'docx') return 'Word';
  else if(ext == 'xltx' || ext == 'xlsx' || ext == 'xlsx' || ext == 'xltm' || ext == 'xlsm' || ext == 'xlam') return 'Excel';
  else if(ext == 'ppt' || ext == 'pptx' || ext == 'potx' || ext == 'pptm' || ext == 'potm' || ext == 'ppam' || ext == 'ppsx' || ext == 'ppsm') return 'Power Point';
  else if(ext == 'pdf') return 'PDF';
  return 'Archivo';
}

export function convertSize(size) : String{
  if(size > Math.pow(1024,3)) return `${(size / Math.pow(1024,3)).toFixed(1)} GB`;
  else if(size > Math.pow(1024,2)) return `${(size / Math.pow(1024,2)).toFixed(1)} MB`;
  else if(size > 1024) return `${(size / 1024).toFixed(1)} kB`;
  return `${(size).toFixed(1)} B`;
}