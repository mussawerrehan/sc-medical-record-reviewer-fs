import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AnalyticsService, MetricTile, ChartData, FilterState, AnalyticsDashboardData } from '../../services/analytics.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss']
})
export class AnalyticsComponent implements OnInit, OnDestroy {
  
  // State variables
  activeView = 'overview';
  selectedMetric: string | null = null;
  drillDownData: any = null;
  isCustomizing = false;
  loading = false;
  
  // Filter state
  filters: FilterState = {
    dateRange: { from: new Date(2024, 0, 1), to: new Date() },
    facilities: ['all'],
    serviceLines: ['all'],
    drgCategories: ['all'],
    payers: ['all'],
    userRole: 'cdi-manager'
  };

  // Widget visibility
  visibleWidgets = {
    cmiTile: true,
    queryTile: true,
    drgTile: true,
    denialTile: true,
    drgImpactChart: true,
    denialReasonsChart: true,
    queryTrendsChart: true,
    productivityChart: true
  };

  // Data arrays
  metricTiles: MetricTile[] = [];
  drgImpactData: ChartData[] = [];
  denialReasonsData: ChartData[] = [];
  queryTrendsData: ChartData[] = [];
  productivityData: any[] = [];

  // Filter options
  facilities = ['All Facilities', 'Main Campus', 'North Campus', 'South Campus', 'Outpatient Centers'];
  serviceLines = ['All Service Lines', 'Medicine', 'Surgery', 'Cardiology', 'Orthopedics', 'Neurology', 'Oncology'];
  drgCategories = ['All Categories', 'Cardiovascular', 'Respiratory', 'Digestive', 'Musculoskeletal', 'Nervous System'];
  payers = ['All Payers', 'Medicare', 'Medicaid', 'Commercial', 'BCBS', 'Aetna', 'UnitedHealth'];

  private subscriptions = new Subscription();

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit() {
    this.loadAnalyticsData();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  loadAnalyticsData() {
    this.loading = true;
    
    this.subscriptions.add(
      this.analyticsService.getDashboardMetrics(this.filters).subscribe({
        next: (data: AnalyticsDashboardData) => {
          this.metricTiles = data.metricTiles;
          this.drgImpactData = data.drgImpactData;
          this.denialReasonsData = data.denialReasonsData;
          this.queryTrendsData = data.queryTrendsData;
          this.productivityData = data.productivityData;
          this.loading = false;
        },
        error: (error: any) => {
          console.error('Error loading analytics data:', error);
          this.loadSampleData();
          this.loading = false;
        }
      })
    );
  }

  private loadSampleData() {
    // Sample data fallback
    this.metricTiles = [
      {
        id: 'cmi',
        title: 'Case Mix Index (CMI)',
        value: '1.52',
        change: '+3.4% vs Q3',
        changeType: 'positive',
        description: 'Overall case complexity and reimbursement weight',
        target: '1.48',
        drillDownData: [
          { facility: 'Main Campus', baseline: 1.45, current: 1.53, change: 5.5 },
          { facility: 'North Campus', baseline: 1.44, current: 1.51, change: 4.9 },
          { facility: 'South Campus', baseline: 1.46, current: 1.52, change: 4.1 }
        ]
      },
      {
        id: 'queries',
        title: 'Query Performance',
        value: '847',
        change: '82% response, 76% agreement',
        changeType: 'positive',
        description: 'Physician queries sent with response and agreement rates',
        drillDownData: [
          { physician: 'Dr. Smith', sent: 23, responded: 21, agreed: 18, rate: 78.3 },
          { physician: 'Dr. Johnson', sent: 19, responded: 19, agreed: 15, rate: 78.9 },
          { physician: 'Dr. Williams', sent: 31, responded: 28, agreed: 24, rate: 77.4 }
        ]
      },
      {
        id: 'drg-upgrades',
        title: 'DRG Upgrades',
        value: '127',
        change: '+$1.8M revenue impact',
        changeType: 'positive',
        description: 'Cases upgraded to higher-paying DRGs',
        drillDownData: [
          { month: 'Jan 2024', upgrades: 45, downgrades: 3, netImpact: 650000 },
          { month: 'Feb 2024', upgrades: 38, downgrades: 2, netImpact: 580000 },
          { month: 'Mar 2024', upgrades: 44, downgrades: 1, netImpact: 640000 }
        ]
      },
      {
        id: 'denials',
        title: 'Denial Rate',
        value: '4.8%',
        change: '-1.2% vs target',
        changeType: 'positive',
        description: 'Claims denied for documentation/coding issues',
        target: '6.0%',
        drillDownData: [
          { reason: 'Medical Necessity', count: 45, percentage: 32.1, amount: 125000 },
          { reason: 'Coding Error', count: 28, percentage: 20.0, amount: 78000 },
          { reason: 'Incomplete Documentation', count: 35, percentage: 25.0, amount: 95000 }
        ]
      }
    ];

    this.drgImpactData = [
      { name: 'Oct', upgrades: 42, downgrades: 5, netRevenue: 580000, target: 600000 },
      { name: 'Nov', upgrades: 38, downgrades: 3, netRevenue: 620000, target: 600000 },
      { name: 'Dec', upgrades: 45, downgrades: 2, netRevenue: 680000, target: 600000 },
      { name: 'Jan', upgrades: 47, downgrades: 4, netRevenue: 650000, target: 600000 },
      { name: 'Feb', upgrades: 41, downgrades: 3, netRevenue: 590000, target: 600000 },
      { name: 'Mar', upgrades: 49, downgrades: 1, netRevenue: 720000, target: 600000 }
    ];

    this.denialReasonsData = [
      { name: 'Medical Necessity', value: 32.1, count: 45, fill: '#ef4444' },
      { name: 'Coding Error', value: 20.0, count: 28, fill: '#f97316' },
      { name: 'Incomplete Documentation', value: 25.0, count: 35, fill: '#eab308' },
      { name: 'Authorization Missing', value: 15.2, count: 21, fill: '#06b6d4' },
      { name: 'Other', value: 7.7, count: 11, fill: '#8b5cf6' }
    ];

    this.queryTrendsData = [
      { name: 'Oct', queriesSent: 120, responseRate: 78, agreementRate: 72 },
      { name: 'Nov', queriesSent: 135, responseRate: 81, agreementRate: 74 },
      { name: 'Dec', queriesSent: 142, responseRate: 83, agreementRate: 76 },
      { name: 'Jan', queriesSent: 156, responseRate: 85, agreementRate: 78 },
      { name: 'Feb', queriesSent: 148, responseRate: 82, agreementRate: 75 },
      { name: 'Mar', queriesSent: 162, responseRate: 84, agreementRate: 79 }
    ];

    this.productivityData = [
      { specialist: 'Sarah Chen', casesReviewed: 145, queriesSent: 67, acceptanceRate: 82.1, efficiency: 4.3 },
      { specialist: 'Michael Torres', casesReviewed: 132, queriesSent: 54, acceptanceRate: 78.7, efficiency: 4.1 },
      { specialist: 'Jennifer Kim', casesReviewed: 156, queriesSent: 71, acceptanceRate: 85.9, efficiency: 4.6 },
      { specialist: 'David Thompson', casesReviewed: 128, queriesSent: 49, acceptanceRate: 76.5, efficiency: 3.8 },
      { specialist: 'Lisa Rodriguez', casesReviewed: 139, queriesSent: 63, acceptanceRate: 81.0, efficiency: 4.2 }
    ];
  }

  onFilterChange() {
    this.loadAnalyticsData();
  }

  handleMetricClick(metricId: string) {
    const metric = this.metricTiles.find(m => m.id === metricId);
    if (metric?.drillDownData) {
      this.drillDownData = {
        type: metricId,
        title: `${metric.title} - Detailed Breakdown`,
        data: metric.drillDownData,
        columns: Object.keys(metric.drillDownData[0] || {})
      };
    }
  }

  closeDrillDown() {
    this.drillDownData = null;
  }

  handleExport(format: 'pdf' | 'excel' | 'csv') {
    this.analyticsService.exportDashboard(format, this.filters).subscribe({
      next: (response: Blob) => {
        // Handle file download
        console.log(`Exporting dashboard as ${format}`);
      },
      error: (error: any) => {
        console.error('Export failed:', error);
      }
    });
  }

  getRoleBasedView() {
    switch (this.filters.userRole) {
      case 'compliance-officer':
        return {
          primaryCharts: ['denialReasonsChart', 'queryTrendsChart'],
          primaryTiles: ['denials', 'queries'],
          title: 'Compliance Dashboard'
        };
      case 'executive':
        return {
          primaryCharts: ['drgImpactChart', 'denialReasonsChart'],
          primaryTiles: ['cmi', 'drg-upgrades'],
          title: 'Executive Summary'
        };
      default:
        return {
          primaryCharts: ['drgImpactChart', 'queryTrendsChart', 'productivityChart'],
          primaryTiles: ['cmi', 'queries', 'drg-upgrades'],
          title: 'CDI Manager Dashboard'
        };
    }
  }

  getChangeColor(changeType: string): string {
    switch (changeType) {
      case 'positive': return '#10b981';
      case 'negative': return '#ef4444';
      default: return '#6b7280';
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`;
  }

  onFromDateChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.filters.dateRange.from = new Date(target.value);
    this.onFilterChange();
  }

  onToDateChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.filters.dateRange.to = new Date(target.value);
    this.onFilterChange();
  }
} 