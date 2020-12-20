import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HeadersGenerator } from './headersGenerator.service';
import { environment } from '../../environments/environment.prod';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportServiceService {

  baseUrl : string = environment.baseUrl;

  constructor(private http : HttpClient,
              private headerGenerator : HeadersGenerator) { }

  getReports(project_id : string) : Observable<any> {
    return this.http.get(`${this.baseUrl}/Reporte/project/${project_id}`,{headers: this.headerGenerator.generateAuthHeader()});
  }

}
