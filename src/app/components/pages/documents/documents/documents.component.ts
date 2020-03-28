import { Component } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { of as observableOf } from 'rxjs';
import { FlatTreeControl } from '@angular/cdk/tree';
//import { files } from './example-data';
import { environment } from '../../../../../environments/environment';

/** File node data with possible child nodes. */
export interface FileNode {
  name: string;
  type: string;
  children?: FileNode[];
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
  level: number;
  expandable: boolean;
}

@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.css']
})
export class DocumentsComponent {

  URL : string = environment.baseUrl;

  /** The TreeControl controls the expand/collapse state of tree nodes.  */
  treeControl: FlatTreeControl<FlatTreeNode>;

  /** The TreeFlattener is used to generate the flat list of items from hierarchical data. */
  treeFlattener: MatTreeFlattener<FileNode, FlatTreeNode>;

  /** The MatTreeFlatDataSource connects the control and flattener to provide data. */
  dataSource: MatTreeFlatDataSource<FileNode, FlatTreeNode>;

  constructor() {
    this.treeFlattener = new MatTreeFlattener(
      this.transformer,
      this.getLevel,
      this.isExpandable,
      this.getChildren);

    this.treeControl = new FlatTreeControl(this.getLevel, this.isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
    this.dataSource.data = this.formatFilesData();

    
  }


  formatFilesData() : any{
    let files : any[] = localStorage.getItem('files') ? JSON.parse(localStorage.getItem('files')) : [];

    if(files.length){
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
      
      let orgFiles : any[] = files.filter(file => file.entity == 'Organizaciones');
      let orgFolders : any[] = orgFiles.map(org => org.folder.name);
      let projectsFiles : any[] = files.filter(file => file.entity == 'Proyectos');

      orgFolders.forEach(folder => file_structure[0].children.push({
        name: folder,
        type: 'folder',
        children: []
      }));

      projectsFiles.forEach(file => {
        file_structure[1].children[0].children.push({
          name: file.name,
          type: 'file',
          url: file.file
        })
      });
      
      file_structure[0].children.forEach(folder => {
        folder.children = orgFiles.filter(file => file.folder.name == folder.name).map(file => this.formatOrgFile(file));
      });

      console.log(file_structure);
      return file_structure;
    }

    return [];
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
}