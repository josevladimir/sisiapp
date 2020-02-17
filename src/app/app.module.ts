import { NgModule } from '@angular/core';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';
import { MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { LoginComponent } from './components/pages/login/login.component';
import { FundersComponent } from './components/pages/funders/funders/funders.component';
import { ProjectsComponent } from './components/pages/projects/projects/projects.component';
import { PartnersComponent } from './components/pages/organization/partners/partners.component';
import { DashboardComponent } from './components/pages/dashboard/dashboard.component';
import { UploadBoxComponent } from './components/shared/upload-box/upload-box.component';
import { IndicatorsComponent } from './components/pages/indicators/indicators/indicators.component';
import { SubToolbarComponent } from './components/shared/sub-toolbar/sub-toolbar.component';
import { NewProjectComponent } from './components/pages/projects/new-project/new-project.component';
import { FunderViewComponent } from './components/pages/funders/funder-view/funder-view.component';
import { ButtonGroupComponent } from './components/shared/button-group/button-group.component';
import { LoadingViewComponent } from './components/shared/loading-view/loading-view.component';
import { FormButtonsComponent } from './components/shared/form-buttons/form-buttons.component';
import { NewIndicatorComponent } from './components/pages/indicators/new-indicator/new-indicator.component';
import { OrganizationsComponent } from './components/pages/organization/organizations/organizations.component';
import { NewOrganizationComponent } from './components/pages/organization/new-organization/new-organization.component';
import { OrganizationViewComponent } from './components/pages/organization/organization-view/organization-view.component';
import { PartnersHistoricComponent } from './components/pages/organization/partners-historic/partners-historic.component';

/**
 * Material Imports
 */

import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatTreeModule } from '@angular/material/tree';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips'
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatStepperModule } from '@angular/material/stepper';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ModalsComponent } from './components/shared/modals/modals.component';
import { ProjectViewComponent } from './components/pages/projects/project-view/project-view.component';
import { UpdateExecutedComponent } from './components/dialogs/update-executed/update-executed.component';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    FundersComponent,
    ProjectsComponent,
    PartnersComponent,
    UploadBoxComponent,
    DashboardComponent,
    NewProjectComponent,
    IndicatorsComponent,
    SubToolbarComponent,
    FunderViewComponent,
    ButtonGroupComponent,
    LoadingViewComponent,
    FormButtonsComponent,
    NewIndicatorComponent,
    OrganizationsComponent,
    NewOrganizationComponent,
    OrganizationViewComponent,
    PartnersHistoricComponent,
    ModalsComponent,
    ProjectViewComponent,
    UpdateExecutedComponent
  ],
  imports: [
    FormsModule,
    BrowserModule,
    MatListModule,
    MatCardModule,
    MatMenuModule,
    MatIconModule,
    MatTabsModule,
    MatTreeModule,
    MatChipsModule,
    MatTableModule,
    MatInputModule,
    NgxChartsModule,
    MatButtonModule,
    MatDialogModule,
    MatSelectModule,
    AppRoutingModule,
    HttpClientModule,
    MatSidenavModule,
    MatStepperModule,
    MatToolbarModule,
    MatDividerModule,
    MatCheckboxModule,
    MatSnackBarModule,
    MatPaginatorModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    BrowserAnimationsModule
  ],
  providers: [
    {provide: MAT_DATE_LOCALE, useValue: 'es-EC'}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
