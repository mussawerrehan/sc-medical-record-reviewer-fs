import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HospitalsListComponent } from './hospitals-list/hospitals-list.component';
import { HospitalFormComponent } from './hospital-form/hospital-form.component';
import { UserRole } from '../../models';
import { AuthGuard } from '../../guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: HospitalsListComponent,
    canActivate: [AuthGuard],
    data: { roles: [UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN] }
  },
  {
    path: 'new',
    component: HospitalFormComponent,
    canActivate: [AuthGuard],
    data: { roles: [UserRole.SUPER_ADMIN] }
  },
  {
    path: ':id',
    loadComponent: () => import('./hospital-details/hospital-details.component')
      .then(m => m.HospitalDetailsComponent),
    canActivate: [AuthGuard],
    data: { roles: [UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN] }
  },
  {
    path: ':id/edit',
    component: HospitalFormComponent,
    canActivate: [AuthGuard],
    data: { roles: [UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN] }
  },
  {
    path: ':id/providers',
    loadComponent: () => import('./hospital-providers/hospital-providers.component')
      .then(m => m.HospitalProvidersComponent),
    canActivate: [AuthGuard],
    data: { roles: [UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN] }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)]
})
export class HospitalsModule { } 