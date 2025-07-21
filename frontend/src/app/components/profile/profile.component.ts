import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Profile</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <p>Profile component works!</p>
      </mat-card-content>
    </mat-card>
  `
})
export class ProfileComponent {} 