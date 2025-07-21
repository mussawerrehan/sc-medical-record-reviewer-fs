import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from './guards/auth.guard';
import { UserRole } from './models';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./components/dashboard/dashboard.module').then(m => m.DashboardModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'claims',
    loadChildren: () => import('./components/claims/claims.module').then(m => m.ClaimsModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'hospitals',
    loadChildren: () => import('./components/hospitals/hospitals.module').then(m => m.HospitalsModule),
    canActivate: [AuthGuard],
    data: { roles: [UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN] }
  },
  {
    path: 'providers',
    loadChildren: () => import('./components/providers/providers.module').then(m => m.ProvidersModule),
    canActivate: [AuthGuard],
    data: { roles: [UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN] }
  },
  {
    path: 'profile',
    loadChildren: () => import('./components/profile/profile.module').then(m => m.ProfileModule),
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
