import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { SocketIoConfig, SocketIoModule } from 'ngx-socket-io';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';
import { MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { UsersComponent } from './components/pages/users/users/users.component';
import { LoginComponent } from './components/pages/login/login.component';
import { IndexComponent } from './components/pages/institutionals/index/index.component';
import { FichasComponent } from './components/pages/fichas/fichas/fichas.component';
import { ReportComponent } from './components/pages/report/report/report.component';
import { ModalsComponent } from './components/shared/modals/modals.component';
import { ProfileComponent } from './components/pages/profile/profile.component';
import { FundersComponent } from './components/pages/funders/funders/funders.component';
import { ProjectsComponent } from './components/pages/projects/projects/projects.component';
import { PartnersComponent } from './components/pages/organization/partners/partners.component';
import { SettingsComponent } from './components/pages/settings/settings/settings.component';
import { NewUsersComponent } from './components/pages/users/new-users/new-users.component';
import { DashboardComponent } from './components/pages/dashboard/dashboard.component';
import { UploadBoxComponent } from './components/shared/upload-box/upload-box.component';
import { UsersViewComponent } from './components/pages/users/users-view/users-view.component';
import { FilterBoxComponent } from './components/shared/filter-box/filter-box.component';
import { DocumentsComponent } from './components/pages/documents/documents/documents.component';
import { IndicatorsComponent } from './components/pages/indicators/indicators/indicators.component';
import { SubToolbarComponent } from './components/shared/sub-toolbar/sub-toolbar.component';
import { NewProjectComponent } from './components/pages/projects/new-project/new-project.component';
import { FunderViewComponent } from './components/pages/funders/funder-view/funder-view.component';
import { ButtonGroupComponent } from './components/shared/button-group/button-group.component';
import { ProjectViewComponent } from './components/pages/projects/project-view/project-view.component';
import { LoadingViewComponent } from './components/shared/loading-view/loading-view.component';
import { NewPasswordComponent } from './components/dialogs/new-password/new-password.component';
import { FundersLinkComponent } from './components/dialogs/funders-link/funders-link.component';
import { FormButtonsComponent } from './components/shared/form-buttons/form-buttons.component';
import { NewIndicatorComponent } from './components/pages/indicators/new-indicator/new-indicator.component';
import { OrganizationsComponent } from './components/pages/organization/organizations/organizations.component';
import { IndicatorViewComponent } from './components/pages/indicators/indicator-view/indicator-view.component';
import { UpdateExecutedComponent } from './components/dialogs/update-executed/update-executed.component';
import { TableAndGraphicComponent } from './components/pages/report/table-and-graphic/table-and-graphic.component';
import { NewOrganizationComponent } from './components/pages/organization/new-organization/new-organization.component';
import { OrganizationViewComponent } from './components/pages/organization/organization-view/organization-view.component';
import { PartnersHistoricComponent } from './components/pages/organization/partners-historic/partners-historic.component';
import { NewOrganizationPreferenceComponent } from './components/dialogs/new-organization-preference/new-organization-preference.component';

/**
 * Material Imports
 */

import { LayoutModule } from '@angular/cdk/layout';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatTreeModule } from '@angular/material/tree';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips'
import { MatRadioModule } from '@angular/material/radio';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDividerModule } from '@angular/material/divider';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

//Configurar Sockets
const config: SocketIoConfig = { url: 'http://localhost:3000', options: {} };

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    UsersComponent,
    IndexComponent,
    ModalsComponent,
    FichasComponent,
    ReportComponent,
    FundersComponent,
    ProfileComponent,
    ProjectsComponent,
    PartnersComponent,
    SettingsComponent,
    NewUsersComponent,
    UsersViewComponent,
    FilterBoxComponent,
    DocumentsComponent,
    UploadBoxComponent,
    DashboardComponent,
    NewProjectComponent,
    IndicatorsComponent,
    SubToolbarComponent,
    FunderViewComponent,
    ButtonGroupComponent,
    NewPasswordComponent,
    ProjectViewComponent,
    FundersLinkComponent,
    LoadingViewComponent,
    FormButtonsComponent,
    NewIndicatorComponent,
    OrganizationsComponent,
    IndicatorViewComponent,
    UpdateExecutedComponent,
    TableAndGraphicComponent,
    NewOrganizationComponent,
    OrganizationViewComponent,
    PartnersHistoricComponent,
    NewOrganizationPreferenceComponent
  ],
  imports: [
    FormsModule,
    LayoutModule,
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
    MatRadioModule,
    NgxChartsModule,
    MatButtonModule,
    MatDialogModule,
    MatSelectModule,
    AppRoutingModule,
    HttpClientModule,
    MatSidenavModule,
    MatStepperModule,
    MatTooltipModule,
    MatToolbarModule,
    MatDividerModule,
    MatCheckboxModule,
    MatSnackBarModule,
    MatGridListModule,
    MatPaginatorModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    BrowserAnimationsModule,
    SocketIoModule.forRoot(config)
  ],
  entryComponents: [
    NewPasswordComponent,
    FundersLinkComponent,
    UpdateExecutedComponent,
    NewOrganizationPreferenceComponent
  ],
  providers: [
    {provide: MAT_DATE_LOCALE, useValue: 'es-EC'},
    {provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: {hasBackdrop: false}}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
