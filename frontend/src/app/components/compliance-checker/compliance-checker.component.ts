import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Subscription } from 'rxjs';

export interface ComplianceRule {
  id: string;
  name: string;
  category: 'CMS' | 'Joint Commission' | 'HIPAA' | 'OSHA' | 'FDA' | 'Custom';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  description: string;
  requirements: string[];
  automated: boolean;
  lastUpdated: Date;
  version: string;
}

export interface ComplianceCheck {
  id: string;
  ruleId: string;
  rule: ComplianceRule;
  caseId?: string;
  patientId?: string;
  facilityId?: string;
  status: 'Passed' | 'Failed' | 'Warning' | 'In Progress' | 'Not Applicable';
  score: number; // 0-100
  findings: ComplianceFinding[];
  checkedAt: Date;
  checkedBy: string;
  reviewRequired: boolean;
  reviewedAt?: Date;
  reviewedBy?: string;
  notes?: string;
}

export interface ComplianceFinding {
  id: string;
  type: 'Violation' | 'Warning' | 'Recommendation' | 'Info';
  message: string;
  details: string;
  location?: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  remediation?: string;
  evidence?: string[];
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
}

export interface ComplianceReport {
  id: string;
  title: string;
  period: {
    start: Date;
    end: Date;
  };
  scope: 'Facility' | 'Department' | 'Case' | 'Patient' | 'Global';
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  warningChecks: number;
  overallScore: number;
  trends: ComplianceTrend[];
  recommendations: string[];
  generatedAt: Date;
  generatedBy: string;
}

export interface ComplianceTrend {
  date: Date;
  score: number;
  category: string;
  passed: number;
  failed: number;
  warnings: number;
}

export interface ComplianceDashboard {
  overallScore: number;
  totalRules: number;
  activeChecks: number;
  criticalViolations: number;
  pendingReviews: number;
  recentChecks: ComplianceCheck[];
  categoryScores: { [category: string]: number };
  trends: ComplianceTrend[];
}

@Component({
  selector: 'app-compliance-checker',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './compliance-checker.component.html',
  styleUrls: ['./compliance-checker.component.scss']
})
export class ComplianceCheckerComponent implements OnInit, OnDestroy {
  
  // State management
  activeTab: 'dashboard' | 'rules' | 'checks' | 'reports' | 'audit' = 'dashboard';
  loading = false;
  error: string | null = null;
  
  // Dashboard data
  dashboard: ComplianceDashboard = {
    overallScore: 0,
    totalRules: 0,
    activeChecks: 0,
    criticalViolations: 0,
    pendingReviews: 0,
    recentChecks: [],
    categoryScores: {},
    trends: []
  };
  
  // Rules management
  rules: ComplianceRule[] = [];
  filteredRules: ComplianceRule[] = [];
  selectedRule: ComplianceRule | null = null;
  ruleFilters = {
    category: 'all',
    severity: 'all',
    automated: 'all',
    search: ''
  };
  
  // Compliance checks
  checks: ComplianceCheck[] = [];
  filteredChecks: ComplianceCheck[] = [];
  selectedCheck: ComplianceCheck | null = null;
  checkFilters = {
    status: 'all',
    severity: 'all',
    dateRange: 'last30',
    facility: 'all',
    search: ''
  };
  
  // Reports
  reports: ComplianceReport[] = [];
  selectedReport: ComplianceReport | null = null;
  
  // UI state
  showRuleModal = false;
  showCheckModal = false;
  showReportModal = false;
  runningChecks: string[] = [];
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  
  // Constants
  categories = [
    'CMS', 'Joint Commission', 'HIPAA', 'OSHA', 'FDA', 'Custom'
  ];
  
  severities = [
    'Low', 'Medium', 'High', 'Critical'
  ];
  
  statuses = [
    'Passed', 'Failed', 'Warning', 'In Progress', 'Not Applicable'
  ];

  private subscriptions: Subscription[] = [];

  constructor() {
    this.initializeSampleData();
  }

  ngOnInit() {
    this.loadDashboard();
    this.loadRules();
    this.loadChecks();
    this.loadReports();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private initializeSampleData() {
    // Sample compliance rules
    const sampleRules: ComplianceRule[] = [
      {
        id: '1',
        name: 'Principal Diagnosis Documentation',
        category: 'CMS',
        severity: 'High',
        description: 'Ensure principal diagnosis is properly documented and coded according to CMS guidelines',
        requirements: [
          'Principal diagnosis must be listed first',
          'Diagnosis must be supported by clinical documentation',
          'ICD-10 coding must be accurate and specific'
        ],
        automated: true,
        lastUpdated: new Date(Date.now() - 86400000),
        version: '2024.1'
      },
      {
        id: '2',
        name: 'Patient Safety Goals Compliance',
        category: 'Joint Commission',
        severity: 'Critical',
        description: 'Verify compliance with Joint Commission National Patient Safety Goals',
        requirements: [
          'Patient identification verification',
          'Communication effectiveness',
          'Medication safety protocols'
        ],
        automated: false,
        lastUpdated: new Date(Date.now() - 172800000),
        version: '2024.1'
      },
      {
        id: '3',
        name: 'PHI Protection Audit',
        category: 'HIPAA',
        severity: 'Critical',
        description: 'Audit protected health information access and handling',
        requirements: [
          'Access logs maintained',
          'Minimum necessary standard applied',
          'Patient consent documented'
        ],
        automated: true,
        lastUpdated: new Date(Date.now() - 259200000),
        version: '2024.1'
      }
    ];

    // Sample compliance checks
    const sampleChecks: ComplianceCheck[] = [
      {
        id: '1',
        ruleId: '1',
        rule: sampleRules[0],
        caseId: 'case-001',
        status: 'Passed',
        score: 95,
        findings: [
          {
            id: '1',
            type: 'Info',
            message: 'Principal diagnosis properly documented',
            details: 'ICD-10 code I21.9 correctly assigned for acute myocardial infarction',
            severity: 'Low',
            resolved: true
          }
        ],
        checkedAt: new Date(Date.now() - 3600000),
        checkedBy: 'Automated System',
        reviewRequired: false
      },
      {
        id: '2',
        ruleId: '2',
        rule: sampleRules[1],
        facilityId: 'facility-001',
        status: 'Failed',
        score: 65,
        findings: [
          {
            id: '2',
            type: 'Violation',
            message: 'Patient identification protocol not followed',
            details: 'Patient wristband missing date of birth verification',
            severity: 'High',
            remediation: 'Update patient identification procedure and retrain staff',
            resolved: false
          }
        ],
        checkedAt: new Date(Date.now() - 7200000),
        checkedBy: 'Dr. Johnson',
        reviewRequired: true
      }
    ];

    this.rules = sampleRules;
    this.checks = sampleChecks;
    this.updateDashboard();
  }

  private loadDashboard() {
    this.loading = true;
    // Simulate API call
    setTimeout(() => {
      this.updateDashboard();
      this.loading = false;
    }, 1000);
  }

  private updateDashboard() {
    const totalChecks = this.checks.length;
    const passedChecks = this.checks.filter(c => c.status === 'Passed').length;
    const failedChecks = this.checks.filter(c => c.status === 'Failed').length;
    const warningChecks = this.checks.filter(c => c.status === 'Warning').length;
    const criticalViolations = this.checks.filter(c => 
      c.status === 'Failed' && c.findings.some(f => f.severity === 'Critical')
    ).length;
    const pendingReviews = this.checks.filter(c => c.reviewRequired && !c.reviewedAt).length;

    const overallScore = totalChecks > 0 ? 
      Math.round(this.checks.reduce((sum, check) => sum + check.score, 0) / totalChecks) : 0;

    // Calculate category scores
    const categoryScores: { [category: string]: number } = {};
    this.categories.forEach(category => {
      const categoryChecks = this.checks.filter(c => c.rule.category === category);
      if (categoryChecks.length > 0) {
        categoryScores[category] = Math.round(
          categoryChecks.reduce((sum, check) => sum + check.score, 0) / categoryChecks.length
        );
      }
    });

    // Generate sample trends
    const trends: ComplianceTrend[] = [];
    for (let i = 30; i >= 0; i--) {
      const date = new Date(Date.now() - i * 86400000);
      trends.push({
        date,
        score: Math.floor(Math.random() * 20) + 80, // 80-100
        category: 'Overall',
        passed: Math.floor(Math.random() * 10) + 15,
        failed: Math.floor(Math.random() * 3) + 1,
        warnings: Math.floor(Math.random() * 5) + 2
      });
    }

    this.dashboard = {
      overallScore,
      totalRules: this.rules.length,
      activeChecks: totalChecks,
      criticalViolations,
      pendingReviews,
      recentChecks: this.checks.slice(0, 5),
      categoryScores,
      trends
    };
  }

  private loadRules() {
    this.applyRuleFilters();
  }

  private loadChecks() {
    this.applyCheckFilters();
  }

  private loadReports() {
    // Sample reports would be loaded here
    this.reports = [
      {
        id: '1',
        title: 'Monthly Compliance Report - January 2025',
        period: {
          start: new Date(2025, 0, 1),
          end: new Date(2025, 0, 31)
        },
        scope: 'Facility',
        totalChecks: 150,
        passedChecks: 135,
        failedChecks: 10,
        warningChecks: 5,
        overallScore: 88,
        trends: [],
        recommendations: [
          'Improve patient identification procedures',
          'Update documentation standards',
          'Conduct additional staff training'
        ],
        generatedAt: new Date(),
        generatedBy: 'Compliance Manager'
      }
    ];
  }

  // Tab management
  setActiveTab(tab: typeof this.activeTab) {
    this.activeTab = tab;
  }

  // Rule management
  applyRuleFilters() {
    let filtered = [...this.rules];

    if (this.ruleFilters.category !== 'all') {
      filtered = filtered.filter(rule => rule.category === this.ruleFilters.category);
    }

    if (this.ruleFilters.severity !== 'all') {
      filtered = filtered.filter(rule => rule.severity === this.ruleFilters.severity);
    }

    if (this.ruleFilters.automated !== 'all') {
      const isAutomated = this.ruleFilters.automated === 'true';
      filtered = filtered.filter(rule => rule.automated === isAutomated);
    }

    if (this.ruleFilters.search.trim()) {
      const search = this.ruleFilters.search.toLowerCase();
      filtered = filtered.filter(rule =>
        rule.name.toLowerCase().includes(search) ||
        rule.description.toLowerCase().includes(search)
      );
    }

    this.filteredRules = filtered;
    this.updatePagination();
  }

  // Check management
  applyCheckFilters() {
    let filtered = [...this.checks];

    if (this.checkFilters.status !== 'all') {
      filtered = filtered.filter(check => check.status === this.checkFilters.status);
    }

    if (this.checkFilters.search.trim()) {
      const search = this.checkFilters.search.toLowerCase();
      filtered = filtered.filter(check =>
        check.rule.name.toLowerCase().includes(search) ||
        check.id.toLowerCase().includes(search)
      );
    }

    this.filteredChecks = filtered;
    this.updatePagination();
  }

  private updatePagination() {
    const itemCount = this.activeTab === 'rules' ? this.filteredRules.length : this.filteredChecks.length;
    this.totalPages = Math.ceil(itemCount / this.itemsPerPage);
    this.currentPage = Math.min(this.currentPage, this.totalPages || 1);
  }

  // Rule actions
  viewRule(rule: ComplianceRule) {
    this.selectedRule = rule;
    this.showRuleModal = true;
  }

  runRuleCheck(rule: ComplianceRule) {
    this.runningChecks.push(rule.id);
    
    // Simulate check execution
    setTimeout(() => {
      this.runningChecks = this.runningChecks.filter(id => id !== rule.id);
      
      // Create a new check result
      const newCheck: ComplianceCheck = {
        id: Date.now().toString(),
        ruleId: rule.id,
        rule: rule,
        status: Math.random() > 0.3 ? 'Passed' : 'Failed',
        score: Math.floor(Math.random() * 40) + 60, // 60-100
        findings: [
          {
            id: Date.now().toString(),
            type: Math.random() > 0.5 ? 'Info' : 'Warning',
            message: 'Automated compliance check completed',
            details: 'Check executed successfully with sample results',
            severity: 'Low',
            resolved: false
          }
        ],
        checkedAt: new Date(),
        checkedBy: 'Automated System',
        reviewRequired: Math.random() > 0.7
      };

      this.checks.unshift(newCheck);
      this.applyCheckFilters();
      this.updateDashboard();
    }, 3000);
  }

  // Check actions
  viewCheck(check: ComplianceCheck) {
    this.selectedCheck = check;
    this.showCheckModal = true;
  }

  reviewCheck(check: ComplianceCheck, approved: boolean) {
    const updatedCheck = {
      ...check,
      reviewRequired: false,
      reviewedAt: new Date(),
      reviewedBy: 'Current User',
      notes: approved ? 'Review completed - approved' : 'Review completed - requires action'
    };

    this.checks = this.checks.map(c => c.id === check.id ? updatedCheck : c);
    this.applyCheckFilters();
    this.updateDashboard();
  }

  resolveFinding(check: ComplianceCheck, finding: ComplianceFinding) {
    const updatedFinding = {
      ...finding,
      resolved: true,
      resolvedAt: new Date(),
      resolvedBy: 'Current User'
    };

    const updatedCheck = {
      ...check,
      findings: check.findings.map(f => f.id === finding.id ? updatedFinding : f)
    };

    this.checks = this.checks.map(c => c.id === check.id ? updatedCheck : c);
    this.applyCheckFilters();
  }

  // Report actions
  generateReport() {
    this.loading = true;
    
    setTimeout(() => {
      const newReport: ComplianceReport = {
        id: Date.now().toString(),
        title: `Compliance Report - ${new Date().toLocaleDateString()}`,
        period: {
          start: new Date(Date.now() - 30 * 86400000),
          end: new Date()
        },
        scope: 'Facility',
        totalChecks: this.checks.length,
        passedChecks: this.checks.filter(c => c.status === 'Passed').length,
        failedChecks: this.checks.filter(c => c.status === 'Failed').length,
        warningChecks: this.checks.filter(c => c.status === 'Warning').length,
        overallScore: this.dashboard.overallScore,
        trends: this.dashboard.trends,
        recommendations: [
          'Continue monitoring high-risk areas',
          'Implement automated compliance checks',
          'Regular staff training updates'
        ],
        generatedAt: new Date(),
        generatedBy: 'Current User'
      };

      this.reports.unshift(newReport);
      this.loading = false;
    }, 2000);
  }

  viewReport(report: ComplianceReport) {
    this.selectedReport = report;
    this.showReportModal = true;
  }

  exportReport(report: ComplianceReport) {
    // Simulate report export
    const reportContent = `
Compliance Report: ${report.title}
Period: ${report.period.start.toLocaleDateString()} - ${report.period.end.toLocaleDateString()}
Overall Score: ${report.overallScore}%
Total Checks: ${report.totalChecks}
Passed: ${report.passedChecks}
Failed: ${report.failedChecks}
Warnings: ${report.warningChecks}

Recommendations:
${report.recommendations.map(r => `- ${r}`).join('\n')}
    `;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.title.replace(/\s+/g, '_')}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  // Modal management
  closeRuleModal() {
    this.showRuleModal = false;
    this.selectedRule = null;
  }

  closeCheckModal() {
    this.showCheckModal = false;
    this.selectedCheck = null;
  }

  closeReportModal() {
    this.showReportModal = false;
    this.selectedReport = null;
  }

  // Utility methods
  getSeverityColor(severity: string): string {
    switch (severity) {
      case 'Critical': return '#dc2626';
      case 'High': return '#ea580c';
      case 'Medium': return '#d97706';
      case 'Low': return '#65a30d';
      default: return '#6b7280';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Passed': return '#059669';
      case 'Failed': return '#dc2626';
      case 'Warning': return '#d97706';
      case 'In Progress': return '#2563eb';
      case 'Not Applicable': return '#6b7280';
      default: return '#6b7280';
    }
  }

  formatDateTime(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  isRuleRunning(ruleId: string): boolean {
    return this.runningChecks.includes(ruleId);
  }

  // Pagination
  get paginatedRules(): ComplianceRule[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredRules.slice(start, start + this.itemsPerPage);
  }

  get paginatedChecks(): ComplianceCheck[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredChecks.slice(start, start + this.itemsPerPage);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  previousPage() {
    this.goToPage(this.currentPage - 1);
  }

  nextPage() {
    this.goToPage(this.currentPage + 1);
  }

  get pageNumbers(): number[] {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);
    
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  trackByFn(index: number, item: any): any {
    return item.id;
  }
} 