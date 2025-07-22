import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserRole, User } from '../../models';
import { Observable } from 'rxjs';

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
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class DashboardComponent implements OnInit {
  UserRole = UserRole;
  currentUser$: Observable<User | null>;
  timeRange = '30d';

  // Top Metrics Bar - Exactly as shown in Figma
  topMetrics: Metric[] = [
    {
      title: 'Open Reviews',
      value: '47',
      change: '+5',
      changeType: 'neutral',
      icon: 'clipboard',
      description: 'Cases awaiting review'
    },
    {
      title: 'Queries Sent (Pending Response)',
      value: '23',
      change: '+8',
      changeType: 'neutral',
      icon: 'help',
      description: 'Awaiting physician response'
    },
    {
      title: 'DRG Changes this Month',
      value: '156',
      change: '+12%',
      changeType: 'positive',
      icon: 'trending-up',
      description: 'Documentation improvements'
    },
    {
      title: 'Denial Risk Cases',
      value: '8',
      change: '-3',
      changeType: 'positive',
      icon: 'alert-triangle',
      description: 'High risk for denial'
    }
  ];

  // Priority Cases - Matching Figma design exactly
  priorityCases: PriorityCase[] = [
    {
      id: '1',
      patientName: 'Sarah Martinez',
      age: 67,
      sex: 'F',
      unit: 'Cardiology',
      primaryDiagnosis: 'Acute MI',
      currentDrg: 'DRG 291',
      suggestedDrg: 'DRG 280',
      formattedImpact: '+$3,200',
      priority: 'High',
      flag: 'Documentation Gap'
    },
    {
      id: '2',
      patientName: 'Robert Chen',
      age: 45,
      sex: 'M',
      unit: 'Respiratory',
      primaryDiagnosis: 'Pneumonia',
      currentDrg: 'DRG 177',
      suggestedDrg: 'DRG 175',
      formattedImpact: '+$1,800',
      priority: 'High',
      flag: 'Severity Missing'
    },
    {
      id: '3',
      patientName: 'Linda Thompson',
      age: 69,
      sex: 'F',
      unit: 'Neurology',
      primaryDiagnosis: 'Stroke',
      currentDrg: 'DRG 064',
      suggestedDrg: 'DRG 062',
      formattedImpact: '+$2,400',
      priority: 'Medium',
      flag: 'Complications'
    },
    {
      id: '4',
      patientName: 'James Wilson',
      age: 78,
      sex: 'M',
      unit: 'ICU',
      primaryDiagnosis: 'Sepsis',
      currentDrg: 'DRG 870',
      suggestedDrg: 'DRG 871',
      formattedImpact: '+$4,100',
      priority: 'Critical',
      flag: 'Organ Dysfunction'
    },
    {
      id: '5',
      patientName: 'Maria Rodriguez',
      age: 62,
      sex: 'F',
      unit: 'Surgery',
      primaryDiagnosis: 'Hip Fracture',
      currentDrg: 'DRG 481',
      suggestedDrg: 'DRG 480',
      formattedImpact: '+$1,500',
      priority: 'Medium',
      flag: 'CC/MCC Review'
    }
  ];

  // Recent Activity data
  recentActivity: RecentActivity[] = [
    {
      id: 1,
      type: 'review',
      description: 'Case review completed for Patient ID: 12847',
      timeAgo: '2 minutes ago',
      status: 'Completed'
    },
    {
      id: 2,
      type: 'query',
      description: 'CDI query sent to Dr. Martinez',
      timeAgo: '15 minutes ago',
      status: 'Pending'
    },
    {
      id: 3,
      type: 'drg',
      description: 'DRG updated from 291 to 280 (+$3,200)',
      timeAgo: '1 hour ago',
      status: 'Completed'
    },
    {
      id: 4,
      type: 'review',
      description: 'New case assigned to review queue',
      timeAgo: '2 hours ago',
      status: 'In Progress'
    },
    {
      id: 5,
      type: 'query',
      description: 'Physician response received for Case #98432',
      timeAgo: '3 hours ago',
      status: 'Completed'
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