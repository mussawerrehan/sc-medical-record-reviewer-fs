import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { CasesService, Case } from '../../services/cases.service';

// Define simple interfaces for dashboard use
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

enum UserRole {
  CDI_SPECIALIST = 'cdi_specialist',
  PHYSICIAN = 'physician',
  ADMIN = 'admin',
  MANAGER = 'manager'
}

// Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

interface PriorityCase {
  id: string;
  patientName: string;
  age: number;
  sex: 'M' | 'F';
  unit: string;
  primaryDiagnosis: string;
  currentDrg: string;
  suggestedDrg: string;
  formattedImpact: string;
  priority: 'High' | 'Medium' | 'Low' | 'Critical';
  flag: string;
}

interface RecentActivity {
  id: number;
  type: 'review' | 'query' | 'drg' | 'other';
  description: string;
  timeAgo: string;
  status: 'Pending' | 'Completed' | 'In Progress';
}

interface Metric {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: string;
  description: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class DashboardComponent implements OnInit {
  UserRole = UserRole;
  currentUser$: Observable<User | null>;
  timeRange = '30d';

  // Dashboard state
  loading = false;
  error: string | null = null;
  autoRefreshInterval: any;

  // Analytics data
  dashboardData = {
    totalCases: 247,
    pendingCases: 89,
    completedCases: 142,
    rejectedCases: 16,
    totalRevenue: 2450000,
    averageProcessingTime: 3.2,
    complianceRate: 94.5
  };

  // Priority cases for quick access
  priorityCases = [
    {
      id: '001',
      patientName: 'John Smith',
      age: 67,
      sex: 'M',
      unit: 'ICU',
      priority: 'Critical',
      daysRemaining: 2,
      potential: '$15,400',
      primaryDiagnosis: 'Acute Kidney Injury',
      currentDrg: 'DRG 683',
      suggestedDrg: 'DRG 682',
      formattedImpact: '+$15,400',
      flag: 'High Impact'
    },
    {
      id: '002', 
      patientName: 'Sarah Johnson',
      age: 45,
      sex: 'F',
      unit: 'Cardiology',
      priority: 'High',
      daysRemaining: 5,
      potential: '$8,200',
      primaryDiagnosis: 'Myocardial Infarction',
      currentDrg: 'DRG 280',
      suggestedDrg: 'DRG 281',
      formattedImpact: '+$8,200',
      flag: 'Documentation'
    },
    {
      id: '003',
      patientName: 'Michael Brown',
      age: 72,
      sex: 'M',
      unit: 'Emergency',
      priority: 'Medium',
      daysRemaining: 10,
      potential: '$4,100',
      primaryDiagnosis: 'Pneumonia',
      currentDrg: 'DRG 193',
      suggestedDrg: 'DRG 194',
      formattedImpact: '+$4,100',
      flag: 'Coding Opportunity'
    }
  ];

  // Recent activities
  recentActivity = [
    {
      id: 1,
      action: 'Case Completed',
      description: 'John Smith - Cardiology review completed',
      timestamp: '2 minutes ago',
      timeAgo: '2 min',
      type: 'success',
      status: 'Completed'
    },
    {
      id: 2,
      action: 'Query Sent',
      description: 'Sarah Johnson - Additional documentation requested',
      timestamp: '15 minutes ago',
      timeAgo: '15 min',
      type: 'warning',
      status: 'Pending'
    },
    {
      id: 3,
      action: 'New Case',
      description: 'Michael Brown - Emergency admission review',
      timestamp: '1 hour ago',
      timeAgo: '1 hr',
      type: 'info',
      status: 'Open'
    }
  ];

  // Chart data for trends
  drgImpactData = {
    upgraded: 156,
    downgraded: 12,
    noChange: 42,
    insight: 'DRG upgrades showing strong improvement trend this month with 87% success rate.'
  };

  denialRiskData = {
    currentRate: 4.2,
    previousRate: 6.8,
    trend: 'decreasing',
    insight: 'Risk levels continue to improve with proactive CDI interventions.'
  };

  queryMetrics = {
    responseRate: 92,
    agreementRate: 78,
    averageResponseTime: '2.3 days',
    insight: 'Physician engagement remains high with quick response times.'
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit(): void {
    // Component initialization
  }

  navigateTo(path: string, data?: any): void {
    if (data) {
      // Navigate with data - in a real app, you might use a service to pass complex data
      this.router.navigate([path], { state: { data: data } });
    } else {
      this.router.navigate([path]);
    }
  }

  getPriorityBadgeClass(priority: string): string {
    switch (priority.toLowerCase()) {
      case 'critical':
        return 'priority-critical';
      case 'high':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      case 'low':
        return 'priority-low';
      default:
        return 'priority-medium';
    }
  }

  getStatusIcon(status: string): string {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'check-circle';
      case 'pending':
        return 'clock';
      case 'in progress':
        return 'refresh';
      default:
        return 'clock';
    }
  }

  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'completed':
        return '#059669';
      case 'pending':
        return '#d97706';
      case 'in progress':
        return '#3182ce';
      default:
        return '#6b7280';
    }
  }

  getFlagIcon(flag: string): string {
    switch (flag.toLowerCase()) {
      case 'documentation gap':
        return 'file-text';
      case 'severity missing':
        return 'alert-triangle';
      case 'complications':
        return 'shield';
      case 'organ dysfunction':
        return 'heart';
      case 'cc/mcc review':
        return 'star';
      default:
        return 'flag';
    }
  }

  getFlagColor(flag: string): string {
    switch (flag.toLowerCase()) {
      case 'documentation gap':
        return '#dc2626';
      case 'severity missing':
        return '#ea580c';
      case 'complications':
        return '#d97706';
      case 'organ dysfunction':
        return '#dc2626';
      case 'cc/mcc review':
        return '#7c3aed';
      default:
        return '#6b7280';
    }
  }

  onTimeRangeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.timeRange = target.value;
    this.refreshData();
  }

  refreshData(): void {
    // In a real app, this would refresh data from the backend
    console.log('Refreshing dashboard data...');
  }
} 