import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClaimsListComponent } from './claims-list/claims-list.component';

const routes: Routes = [
  {
    path: '',
    component: ClaimsListComponent
  },
  {
    path: 'new',
    loadComponent: () => import('./claim-form/claim-form.component')
      .then(m => m.ClaimFormComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./claim-details/claim-details.component')
      .then(m => m.ClaimDetailsComponent)
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./claim-form/claim-form.component')
      .then(m => m.ClaimFormComponent)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)]
})
export class ClaimsModule { } 