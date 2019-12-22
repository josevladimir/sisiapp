import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FundersComponent } from './components/pages/funders/funders/funders.component';
import { ProjectsComponent } from './components/pages/projects/projects/projects.component';
import { DashboardComponent } from './components/pages/dashboard/dashboard.component';
import { IndicatorsComponent } from './components/pages/indicators/indicators/indicators.component';
import { NewProjectComponent } from './components/pages/projects/new-project/new-project.component';
import { FunderViewComponent } from './components/pages/funders/funder-view/funder-view.component';
import { NewIndicatorComponent } from './components/pages/indicators/new-indicator/new-indicator.component';
import { OrganizationsComponent } from './components/pages/organization/organizations/organizations.component';
import { NewOrganizationComponent } from './components/pages/organization/new-organization/new-organization.component';
import { OrganizationViewComponent } from './components/pages/organization/organization-view/organization-view.component';

const routes: Routes = [
  {path: '', pathMatch: 'full', redirectTo: 'dashboard'},
  {path: 'dashboard', component: DashboardComponent},
  {path: 'funders', component: FundersComponent},
  {path: 'funders/:id', component: FunderViewComponent},
  {path: 'organizations', component: OrganizationsComponent},
  {path: 'organizations/add', component: NewOrganizationComponent},
  {path: 'organizations/:id', component: OrganizationViewComponent},
  {path: 'indicators', component: IndicatorsComponent},
  {path: 'indicators/add', component: NewIndicatorComponent},
  {path: 'projects', component: ProjectsComponent},
  {path: 'projects/add', component: NewProjectComponent},
  {path: 'fichas', component: DashboardComponent},
  {path: 'reports', component: DashboardComponent},
  {path: 'documents', component: DashboardComponent},
  {path: 'institucionales', component: DashboardComponent},
  {path: 'users', component: DashboardComponent},
  {path: 'settings', component: DashboardComponent},
  {path: '**', pathMatch: 'full', redirectTo: 'dashboard'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
