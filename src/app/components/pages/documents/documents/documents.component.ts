import { Component, OnDestroy } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { of as observableOf, Subscription } from 'rxjs';
import { FlatTreeControl } from '@angular/cdk/tree';
import { environment } from '../../../../../environments/environment';
import { DocumentsServiceService } from '../../../../services/documents-service.service';

/** File node data with possible child nodes. */
export interface FileNode {
  name: string;
  type: string;
  children?: FileNode[];
  project?: string,
  url?: string;
}

/**
 * Flattened tree node that has been created from a FileNode through the flattener. Flattened
 * nodes include level index and whether they can be expanded or not.
 */
export interface FlatTreeNode {
  name: string;
  type: string;
  url?: string;
  project?: string, 
  level: number;
  expandable: boolean;
}

@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html'
})
export class DocumentsComponent implements OnDestroy {

  URL : string = environment.baseUrl;

  /** The TreeControl controls the expand/collapse state of tree nodes.  */
  treeControl: FlatTreeControl<FlatTreeNode>;

  /** The TreeFlattener is used to generate the flat list of items from hierarchical data. */
  treeFlattener: MatTreeFlattener<FileNode, FlatTreeNode>;

  /** The MatTreeFlatDataSource connects the control and flattener to provide data. */
  dataSource: MatTreeFlatDataSource<FileNode, FlatTreeNode>;

  subscription : Subscription;
  files : any[];

  constructor(private documentsService : DocumentsServiceService) {
    
    this.treeFlattener = new MatTreeFlattener(
      this.transformer,
      this.getLevel,
      this.isExpandable,
      this.getChildren);
      
      this.treeControl = new FlatTreeControl(this.getLevel, this.isExpandable);
      this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
      
      this.subscription = this.documentsService.getDocumentsLocal().subscribe((data : any) => {
        this.files = data.documents;
        this.dataSource.data = this.formatFilesData();
        console.log(this.dataSource);
      });
  }


  formatFilesData() : any{

    if(this.files.length){
      let file_structure : any = [
        {
          name: 'Organizaciones',
          type: 'folder',
          children: []
        },
        {
          name: 'Proyectos',
          type: 'folder',
          children: [{
            name: 'Listas de Beneficiarios',
            type: 'folder',
            children: []
          }]
        }
      ];
      
      let orgFiles : any[] = this.files.filter(file => file.entity == 'Organizaciones');
      let orgFolders : any[] = orgFiles.map(org => org.organization.name);
      let projectsFiles : any[] = this.files.filter(file => file.entity == 'Proyectos');

      console.log(projectsFiles);

      orgFolders.forEach(folder => file_structure[0].children.push({
        name: folder,
        type: 'folder',
        children: []
      }));

      projectsFiles.forEach(file => {
        file_structure[1].children[0].children.push({
          name: file.name,
          type: 'file',
          url: file.file,
          project: file.project.name
        })
      });
      
      file_structure[0].children.forEach(folder => {
        folder.children = orgFiles.filter(file => file.organization.name == folder.name).map(file => this.formatOrgFile(file));
      });

      console.log(file_structure);
      return file_structure;
    }
  
    return [
      {
        name: 'Organizaciones',
        type: 'folder',
        children: []
      },
      {
        name: 'Proyectos',
        type: 'folder',
        children: [{
          name: 'Listas de Beneficiarios',
          type: 'folder',
          children: []
        }]
      }
    ];
  }

  formatOrgFile(file) : any {
    return {
      name: file.name,
      type: 'file',
      url: file.file
    }
  }

  /** Transform the data to something the tree can read. */
  transformer(node: FileNode, level: number) {
    return {
      name: node.name,
      type: node.type,
      level: level,
      url: node.url,
      project: node.project,
      expandable: !!node.children
    };
  }

  /** Get the level of the node */
  getLevel(node: FlatTreeNode) {
    return node.level;
  }

  /** Get whether the node is expanded or not. */
  isExpandable(node: FlatTreeNode) {
    return node.expandable;
  }

  /** Get whether the node has children or not. */
  hasChild(index: number, node: FlatTreeNode) {
    return node.expandable;
  }

  /** Get the children for the node. */
  getChildren(node: FileNode) {
    return observableOf(node.children);
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.subscription.unsubscribe();
  }
  
}
