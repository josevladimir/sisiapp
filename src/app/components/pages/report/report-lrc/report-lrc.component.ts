import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { MonacoEditorConstructionOptions, MonacoEditorLoaderService, MonacoStandaloneCodeEditor, MonacoEditorComponent } from '@materia-ui/ngx-monaco-editor';
import { filter, take } from 'rxjs/operators';
import { tokens, colorRules, getSuggestions } from 'src/app/models/LRC';

@Component({
  selector: 'app-report-lrc',
  templateUrl: './report-lrc.component.html',
  styleUrls: ['./report-lrc.component.css']
})
export class ReportLRCComponent {

  @ViewChild(MonacoEditorComponent, {static: false}) monacoEditorComponent: MonacoEditorComponent;

  pseudoQuerys : string[] = [];

	editorOptions: MonacoEditorConstructionOptions = {
		theme: 'lrcTheme',
		language: 'lrc',
		roundedSelection: true,
    autoIndent: true,
    minimap: {
      enabled: false
    },
    wordWrap: 'on'
	};
  editor: MonacoStandaloneCodeEditor;
  userCode: string = '';

  monaco;
  
  constructor(private monacoLoaderService: MonacoEditorLoaderService) {
    this.monacoLoaderService.isMonacoLoaded$.pipe(
      filter(isLoaded => isLoaded),
      take(1),
    ).subscribe(() => {
        // here, we retrieve monaco-editor instance
        this.monaco = ((window as any).monaco);
        
        this.monaco.languages.register({id: 'lrc'});
        
        monaco.languages.setMonarchTokensProvider('lrc', {
          ignoreCase: false,
          tokenizer: {
            root: tokens
          }
        });

        // Define a new theme that contains only rules that match this language
        monaco.editor.defineTheme('lrcTheme', {
        	base: 'vs',
        	inherit: false,
        	rules: colorRules,
          colors: {}
        });

        // Register a completion item provider for the new language
        monaco.languages.registerCompletionItemProvider('lrc', {
          provideCompletionItems: () => new Promise((resolve) => resolve({suggestions: getSuggestions()}))
        });
      });
	}

  ngOnInit(): void { }
  
  initEditor() {
    // Here you can access editor instance
    this.editor = this.monacoEditorComponent.editor;
  }

  listStyle : any = {
    height: '250px',
    width: '100%' //width of the list defaults to 300
  }

  addQuery : () => void = () => {
    this.pseudoQuerys.push(this.userCode);
    this.userCode = '';
  }

  prepareQuery : (i : number) => void = (index : number) => {
    this.monaco.editor.colorizeElement()
  }

  getUp : (i : number) => void = (index : number) => {
    let aux = this.pseudoQuerys[index - 1];
    this.pseudoQuerys[index - 1] = this.pseudoQuerys[index];
    this.pseudoQuerys[index] = aux; 
  }

  getDown : (i : number) => void = (index : number) => {
    let aux = this.pseudoQuerys[index + 1];
    this.pseudoQuerys[index + 1] = this.pseudoQuerys[index];
    this.pseudoQuerys[index] = aux; 
  }

  getReport :  () => void = () => {
    let querys : string[] = this.translateQuerys();
    console.log(querys);
  }

  translateQuerys : () => string[] = () => {
    let querys : string[] = [];

    for(let i = 0; i < this.pseudoQuerys.length; i++){
      let query = this.pseudoQuerys[i];
      querys.push(query);
    }
    
    return querys;
  }

}
