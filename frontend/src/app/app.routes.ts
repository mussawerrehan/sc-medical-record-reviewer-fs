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
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'claims',
    loadChildren: () => import('./components/claims/claims.module').then(m => m.ClaimsModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'compliance',
    loadComponent: () => import('./components/compliance-checker/compliance-checker.component').then(m => m.ComplianceCheckerComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'analytics',
    loadComponent: () => import('./components/analytics/analytics.component').then(m => m.AnalyticsComponent),
    canActivate: [AuthGuard],
    data: { title: 'Analytics' }
  },
  {
    path: 'ai-assistant',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard],
    data: { title: 'AI Assistant' }
  },
  {
    path: 'batch-monitoring',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard],
    data: { title: 'Batch Monitoring' }
  },
  {
    path: 'admin',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard],
    data: { roles: [UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN], title: 'Admin Panel' }
  },
  {
    path: 'case-review',
    loadComponent: () => import('./components/case-details/case-details.component').then(m => m.CaseDetailsComponent),
    canActivate: [AuthGuard]
  },
  // Legacy routes for backward compatibility
  {
    path: 'hospitals',
    redirectTo: 'admin',
    pathMatch: 'full'
  },
  {
    path: 'providers',
    redirectTo: 'admin',
    pathMatch: 'full'
  },
  {
    path: 'profile',
    redirectTo: 'admin',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
