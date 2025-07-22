import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-compliance-checker',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './compliance-checker.component.html',
  styleUrls: ['./compliance-checker.component.scss']
})
export class ComplianceCheckerComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    // Component initialization logic
  }

} 