import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';

export interface MetricTile {
  id: string;
  title: string;
  value: string | number;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  description: string;
  target?: string;
  drillDownData?: any[];
}

export interface ChartData {
  name: string;
  value?: number;
  change?: number;
  target?: number;
  upgrades?: number;
  downgrades?: number;
  netRevenue?: number;
  queriesSent?: number;
  responseRate?: number;
  agreementRate?: number;
  count?: number;
  fill?: string;
  [key: string]: any;
}

export interface FilterState {
  dateRange: { from: Date; to: Date };
  facilities: string[];
  serviceLines: string[];
  drgCategories: string[];
  payers: string[];
  userRole: string;
}

export interface LookupData {
  facilities: string[];
  serviceLines: string[];
  userRoles: string[];
  priorities: string[];
  statuses: string[];
  workflowStatuses: string[];
}

export interface AnalyticsDashboardData {
  metricTiles: MetricTile[];
  drgImpactData: ChartData[];
  denialReasonsData: ChartData[];
  queryTrendsData: ChartData[];
  productivityData: any[];
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private apiUrl = `${environment.apiUrl}/analytics`;

  constructor(private http: HttpClient) {}

  getDashboardMetrics(filters: FilterState): Observable<AnalyticsDashboardData> {
    let params = new HttpParams();
    
    // Add filters to params
    if (filters.dateRange) {
      params = params.set('from', filters.dateRange.from.toISOString());
      params = params.set('to', filters.dateRange.to.toISOString());
    }
    
    if (filters.facilities && filters.facilities.length > 0 && !filters.facilities.includes('all')) {
      params = params.set('facilities', filters.facilities.join(','));
    }
    
    if (filters.serviceLines && filters.serviceLines.length > 0 && !filters.serviceLines.includes('all')) {
      params = params.set('serviceLines', filters.serviceLines.join(','));
    }
    
    if (filters.userRole) {
      params = params.set('userRole', filters.userRole);
    }

    return this.http.get<AnalyticsDashboardData>(`${this.apiUrl}/dashboard`, { params });
  }

  getComplianceMetrics(filters: FilterState): Observable<any> {
    let params = new HttpParams();
    
    if (filters.dateRange) {
      params = params.set('from', filters.dateRange.from.toISOString());
      params = params.set('to', filters.dateRange.to.toISOString());
    }

    return this.http.get<any>(`${this.apiUrl}/compliance`, { params });
  }

  getFinancialMetrics(filters: FilterState): Observable<any> {
    let params = new HttpParams();
    
    if (filters.dateRange) {
      params = params.set('from', filters.dateRange.from.toISOString());
      params = params.set('to', filters.dateRange.to.toISOString());
    }

    return this.http.get<any>(`${this.apiUrl}/financial`, { params });
  }

  getProductivityMetrics(filters: FilterState): Observable<any> {
    let params = new HttpParams();
    
    if (filters.dateRange) {
      params = params.set('from', filters.dateRange.from.toISOString());
      params = params.set('to', filters.dateRange.to.toISOString());
    }

    return this.http.get<any>(`${this.apiUrl}/productivity`, { params });
  }

  exportDashboard(format: 'pdf' | 'excel' | 'csv', filters: FilterState): Observable<Blob> {
    let params = new HttpParams();
    params = params.set('format', format);
    
    if (filters.dateRange) {
      params = params.set('from', filters.dateRange.from.toISOString());
      params = params.set('to', filters.dateRange.to.toISOString());
    }

    return this.http.get(`${this.apiUrl}/export`, { 
      params, 
      responseType: 'blob' 
    });
  }

  getDrillDownData(metricId: string, filters: FilterState): Observable<any> {
    let params = new HttpParams();
    params = params.set('metricId', metricId);
    
    if (filters.dateRange) {
      params = params.set('from', filters.dateRange.from.toISOString());
      params = params.set('to', filters.dateRange.to.toISOString());
    }

    return this.http.get<any>(`${this.apiUrl}/drill-down`, { params });
  }

  // Sample data method for fallback
  getSampleDashboardData(): AnalyticsDashboardData {
    return {
      metricTiles: [
        {
          id: 'cmi',
          title: 'Case Mix Index (CMI)',
          value: '1.52',
          change: '+3.4% vs Q3',
          changeType: 'positive',
          description: 'Overall case complexity and reimbursement weight',
          target: '1.48'
        },
        {
          id: 'queries',
          title: 'Query Performance',
          value: '847',
          change: '82% response, 76% agreement',
          changeType: 'positive',
          description: 'Physician queries sent with response and agreement rates'
        },
        {
          id: 'drg-upgrades',
          title: 'DRG Upgrades',
          value: '127',
          change: '+$1.8M revenue impact',
          changeType: 'positive',
          description: 'Cases upgraded to higher-paying DRGs'
        },
        {
          id: 'denials',
          title: 'Denial Rate',
          value: '4.8%',
          change: '-1.2% vs target',
          changeType: 'positive',
          description: 'Claims denied for documentation/coding issues',
          target: '6.0%'
        }
      ],
      drgImpactData: [
        { name: 'Oct', upgrades: 42, downgrades: 5, netRevenue: 580000, target: 600000 },
        { name: 'Nov', upgrades: 38, downgrades: 3, netRevenue: 620000, target: 600000 },
        { name: 'Dec', upgrades: 45, downgrades: 2, netRevenue: 680000, target: 600000 },
        { name: 'Jan', upgrades: 47, downgrades: 4, netRevenue: 650000, target: 600000 },
        { name: 'Feb', upgrades: 41, downgrades: 3, netRevenue: 590000, target: 600000 },
        { name: 'Mar', upgrades: 49, downgrades: 1, netRevenue: 720000, target: 600000 }
      ],
      denialReasonsData: [
        { name: 'Medical Necessity', value: 32.1, count: 45, fill: '#ef4444' },
        { name: 'Coding Error', value: 20.0, count: 28, fill: '#f97316' },
        { name: 'Incomplete Documentation', value: 25.0, count: 35, fill: '#eab308' },
        { name: 'Authorization Missing', value: 15.2, count: 21, fill: '#06b6d4' },
        { name: 'Other', value: 7.7, count: 11, fill: '#8b5cf6' }
      ],
      queryTrendsData: [
        { name: 'Oct', queriesSent: 120, responseRate: 78, agreementRate: 72 },
        { name: 'Nov', queriesSent: 135, responseRate: 81, agreementRate: 74 },
        { name: 'Dec', queriesSent: 142, responseRate: 83, agreementRate: 76 },
        { name: 'Jan', queriesSent: 156, responseRate: 85, agreementRate: 78 },
        { name: 'Feb', queriesSent: 148, responseRate: 82, agreementRate: 75 },
        { name: 'Mar', queriesSent: 162, responseRate: 84, agreementRate: 79 }
      ],
      productivityData: [
        { specialist: 'Sarah Chen', casesReviewed: 145, queriesSent: 67, acceptanceRate: 82.1, efficiency: 4.3 },
        { specialist: 'Michael Torres', casesReviewed: 132, queriesSent: 54, acceptanceRate: 78.7, efficiency: 4.1 },
        { specialist: 'Jennifer Kim', casesReviewed: 156, queriesSent: 71, acceptanceRate: 85.9, efficiency: 4.6 },
        { specialist: 'David Thompson', casesReviewed: 128, queriesSent: 49, acceptanceRate: 76.5, efficiency: 3.8 },
        { specialist: 'Lisa Rodriguez', casesReviewed: 139, queriesSent: 63, acceptanceRate: 81.0, efficiency: 4.2 }
      ]
    };
  }
} 