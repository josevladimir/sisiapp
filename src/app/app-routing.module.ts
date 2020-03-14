import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ReportComponent } from './components/pages/report/report/report.component';
import { FichasComponent } from './components/pages/fichas/fichas/fichas.component';
import { FundersComponent } from './components/pages/funders/funders/funders.component';
import { ProjectsComponent } from './components/pages/projects/projects/projects.component';
import { PartnersComponent } from './components/pages/organization/partners/partners.component';
import { DashboardComponent } from './components/pages/dashboard/dashboard.component';
import { IndicatorsComponent } from './components/pages/indicators/indicators/indicators.component';
import { NewProjectComponent } from './components/pages/projects/new-project/new-project.component';
import { FunderViewComponent } from './components/pages/funders/funder-view/funder-view.component';
import { ProjectViewComponent } from './components/pages/projects/project-view/project-view.component';
import { NewIndicatorComponent } from './components/pages/indicators/new-indicator/new-indicator.component';
import { OrganizationsComponent } from './components/pages/organization/organizations/organizations.component';
import { NewOrganizationComponent } from './components/pages/organization/new-organization/new-organization.component';
import { OrganizationViewComponent } from './components/pages/organization/organization-view/organization-view.component';
import { PartnersHistoricComponent } from './components/pages/organization/partners-historic/partners-historic.component';
import { IndicatorViewComponent } from './components/pages/indicators/indicator-view/indicator-view.component';
import { UsersComponent } from './components/pages/users/users/users.component';
import { NewUsersComponent } from './components/pages/users/new-users/new-users.component';
import { UsersViewComponent } from './components/pages/users/users-view/users-view.component';

const routes: Routes = [
  {path: '', pathMatch: 'full', redirectTo: 'dashboard'},
  {path: 'dashboard', component: DashboardComponent},
  {path: 'funders', component: FundersComponent},
  {path: 'funders/:id', component: FunderViewComponent},
  {path: 'organizations', component: OrganizationsComponent},
  {path: 'organizations/add', component: NewOrganizationComponent},
  {path: 'organizations/:id', component: OrganizationViewComponent},
  {path: 'organizations/:id/partners', component: PartnersComponent},
  {path: 'organizations/:id/partners/historic', component: PartnersHistoricComponent},
  {path: 'indicators', component: IndicatorsComponent},
  {path: 'indicators/add', component: NewIndicatorComponent},
  {path: 'indicators/:id', component: IndicatorViewComponent},
  {path: 'projects', component: ProjectsComponent},
  {path: 'projects/add', component: NewProjectComponent},
  {path: 'projects/:id', component: ProjectViewComponent},
  {path: 'schemas', component: FichasComponent},
  {path: 'reports', component: ReportComponent},
  {path: 'documents', component: DashboardComponent},
  {path: 'institucionales', component: DashboardComponent},
  {path: 'users', component: UsersComponent},
  {path: 'users/add', component: NewUsersComponent},
  {path: 'users/:id', component: UsersViewComponent},
  {path: 'settings', component: DashboardComponent},
  {path: '**', pathMatch: 'full', redirectTo: 'dashboard'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
