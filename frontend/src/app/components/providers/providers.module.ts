import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProvidersListComponent } from './providers-list/providers-list.component';
import { ProviderFormComponent } from './provider-form/provider-form.component';
import { UserRole } from '../../models';
import { AuthGuard } from '../../guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: ProvidersListComponent,
    canActivate: [AuthGuard],
    data: { roles: [UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN] }
  },
  {
    path: 'new',
    component: ProviderFormComponent,
    canActivate: [AuthGuard],
    data: { roles: [UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN] }
  },
  {
    path: ':id',
    loadComponent: () => import('./provider-details/provider-details.component')
      .then(m => m.ProviderDetailsComponent),
    canActivate: [AuthGuard],
    data: { roles: [UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN] }
  },
  {
    path: ':id/edit',
    component: ProviderFormComponent,
    canActivate: [AuthGuard],
    data: { roles: [UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN] }
  },
  {
    path: ':id/hospitals',
    loadComponent: () => import('./provider-hospitals/provider-hospitals.component')
      .then(m => m.ProviderHospitalsComponent),
    canActivate: [AuthGuard],
    data: { roles: [UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN] }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)]
})
export class ProvidersModule { } 