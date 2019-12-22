import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';
import { MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { LoginComponent } from './components/pages/login/login.component';
import { FundersComponent } from './components/pages/funders/funders/funders.component';
import { ProjectsComponent } from './components/pages/projects/projects/projects.component';
import { DashboardComponent } from './components/pages/dashboard/dashboard.component';
import { UploadBoxComponent } from './components/shared/upload-box/upload-box.component';
import { IndicatorsComponent } from './components/pages/indicators/indicators/indicators.component';
import { SubToolbarComponent } from './components/shared/sub-toolbar/sub-toolbar.component';
import { NewProjectComponent } from './components/pages/projects/new-project/new-project.component';
import { FormButtonsComponent } from './components/shared/form-buttons/form-buttons.component';
import { NewIndicatorComponent } from './components/pages/indicators/new-indicator/new-indicator.component';
import { OrganizationsComponent } from './components/pages/organization/organizations/organizations.component';
import { NewOrganizationComponent } from './components/pages/organization/new-organization/new-organization.component';

/**
 * Material Imports
 */

import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatStepperModule } from '@angular/material/stepper';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoadingViewComponent } from './components/shared/loading-view/loading-view.component';
import { FunderViewComponent } from './components/pages/funders/funder-view/funder-view.component';
import { ButtonGroupComponent } from './components/shared/button-group/button-group.component';
import { OrganizationViewComponent } from './components/pages/organization/organization-view/organization-view.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    FundersComponent,
    ProjectsComponent,
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
    OrganizationViewComponent
  ],
  imports: [
    FormsModule,
    BrowserModule,
    MatListModule,
    MatCardModule,
    MatMenuModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    AppRoutingModule,
    HttpClientModule,
    MatSidenavModule,
    MatStepperModule,
    MatToolbarModule,
    MatDividerModule,
    MatCheckboxModule,
    MatSnackBarModule,
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
