import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Subscription, interval } from 'rxjs';

export interface BatchJob {
  id: string;
  name: string;
  type: 'file-upload' | 'data-import' | 'coding-analysis' | 'compliance-check' | 'financial-analysis' | 'report-generation';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'paused';
  progress: number;
  totalItems: number;
  processedItems: number;
  failedItems: number;
  startTime: Date;
  endTime?: Date;
  estimatedCompletion?: Date;
  duration?: number;
  createdBy: string;
  errorMessage?: string;
  logs: BatchJobLog[];
  metadata: { [key: string]: any };
}

export interface BatchJobLog {
  id: string;
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'debug';
  message: string;
  details?: any;
}

export interface BatchStats {
  totalJobs: number;
  runningJobs: number;
  completedJobs: number;
  failedJobs: number;
  totalItemsProcessed: number;
  averageProcessingTime: number;
  successRate: number;
}

export interface BatchFilter {
  status?: string;
  type?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  createdBy?: string;
}

@Component({
  selector: 'app-batch-monitoring',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './batch-monitoring.component.html',
  styleUrls: ['./batch-monitoring.component.scss']
})
export class BatchMonitoringComponent implements OnInit, OnDestroy {
  
  // Data properties
  batchJobs: BatchJob[] = [];
  filteredJobs: BatchJob[] = [];
  selectedJob: BatchJob | null = null;
  batchStats: BatchStats = {
    totalJobs: 0,
    runningJobs: 0,
    completedJobs: 0,
    failedJobs: 0,
    totalItemsProcessed: 0,
    averageProcessingTime: 0,
    successRate: 0
  };

  // UI state
  loading = false;
  showCreateModal = false;
  showJobDetails = false;
  autoRefresh = true;
  refreshInterval = 5000; // 5 seconds
  
  // Filters
  filters: BatchFilter = {};
  statusFilter = 'all';
  typeFilter = 'all';
  searchTerm = '';
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  
  // Job types and statuses
  jobTypes = [
    { value: 'file-upload', label: 'File Upload', icon: 'upload' },
    { value: 'data-import', label: 'Data Import', icon: 'database' },
    { value: 'coding-analysis', label: 'Coding Analysis', icon: 'code' },
    { value: 'compliance-check', label: 'Compliance Check', icon: 'shield' },
    { value: 'financial-analysis', label: 'Financial Analysis', icon: 'chart' },
    { value: 'report-generation', label: 'Report Generation', icon: 'document' }
  ];
  
  statuses = [
    { value: 'pending', label: 'Pending', color: '#f59e0b' },
    { value: 'running', label: 'Running', color: '#3b82f6' },
    { value: 'completed', label: 'Completed', color: '#10b981' },
    { value: 'failed', label: 'Failed', color: '#ef4444' },
    { value: 'cancelled', label: 'Cancelled', color: '#6b7280' },
    { value: 'paused', label: 'Paused', color: '#f59e0b' }
  ];

  private subscriptions: Subscription[] = [];
  private refreshSubscription?: Subscription;

  constructor() {
    this.initializeSampleData();
  }

  ngOnInit() {
    this.loadBatchJobs();
    this.startAutoRefresh();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.stopAutoRefresh();
  }

  private initializeSampleData() {
    const sampleJobs: BatchJob[] = [
      {
        id: '1',
        name: 'Medical Records Upload - Batch #001',
        type: 'file-upload',
        status: 'running',
        progress: 65,
        totalItems: 150,
        processedItems: 98,
        failedItems: 2,
        startTime: new Date(Date.now() - 1800000), // 30 minutes ago
        estimatedCompletion: new Date(Date.now() + 900000), // 15 minutes from now
        createdBy: 'Dr. Smith',
        logs: [
          {
            id: '1',
            timestamp: new Date(Date.now() - 300000),
            level: 'info',
            message: 'Processing file batch started',
            details: { batchSize: 150 }
          },
          {
            id: '2',
            timestamp: new Date(Date.now() - 120000),
            level: 'warning',
            message: 'Invalid format detected in 2 files',
            details: { files: ['record_123.pdf', 'record_456.pdf'] }
          }
        ],
        metadata: {
          facilityId: 'facility-001',
          serviceLine: 'Cardiology',
          uploadSource: 'EMR System'
        }
      },
      {
        id: '2',
        name: 'DRG Coding Analysis Q4 2024',
        type: 'coding-analysis',
        status: 'completed',
        progress: 100,
        totalItems: 500,
        processedItems: 500,
        failedItems: 0,
        startTime: new Date(Date.now() - 7200000), // 2 hours ago
        endTime: new Date(Date.now() - 3600000), // 1 hour ago
        duration: 3600000, // 1 hour
        createdBy: 'Coding Manager',
        logs: [
          {
            id: '3',
            timestamp: new Date(Date.now() - 7200000),
            level: 'info',
            message: 'DRG analysis started for Q4 2024 cases',
            details: { quarter: 'Q4', year: 2024 }
          },
          {
            id: '4',
            timestamp: new Date(Date.now() - 3600000),
            level: 'info',
            message: 'Analysis completed successfully',
            details: { optimizationOpportunities: 45, potentialRevenue: 125000 }
          }
        ],
        metadata: {
          quarter: 'Q4 2024',
          analysisType: 'DRG Optimization',
          reportGenerated: true
        }
      },
      {
        id: '3',
        name: 'Compliance Audit - January 2025',
        type: 'compliance-check',
        status: 'failed',
        progress: 25,
        totalItems: 200,
        processedItems: 50,
        failedItems: 50,
        startTime: new Date(Date.now() - 900000), // 15 minutes ago
        errorMessage: 'Database connection timeout during compliance verification',
        createdBy: 'Compliance Officer',
        logs: [
          {
            id: '5',
            timestamp: new Date(Date.now() - 900000),
            level: 'info',
            message: 'Compliance audit started',
            details: { auditPeriod: 'January 2025' }
          },
          {
            id: '6',
            timestamp: new Date(Date.now() - 600000),
            level: 'error',
            message: 'Database connection timeout',
            details: { errorCode: 'DB_TIMEOUT', retryAttempts: 3 }
          }
        ],
        metadata: {
          auditPeriod: 'January 2025',
          complianceStandards: ['CMS', 'Joint Commission'],
          priority: 'High'
        }
      }
    ];

    this.batchJobs = sampleJobs;
    this.updateStats();
    this.applyFilters();
  }

  private loadBatchJobs() {
    this.loading = true;
    // In a real app, this would call the backend service
    setTimeout(() => {
      this.updateStats();
      this.applyFilters();
      this.loading = false;
    }, 1000);
  }

  private updateStats() {
    this.batchStats = {
      totalJobs: this.batchJobs.length,
      runningJobs: this.batchJobs.filter(job => job.status === 'running').length,
      completedJobs: this.batchJobs.filter(job => job.status === 'completed').length,
      failedJobs: this.batchJobs.filter(job => job.status === 'failed').length,
      totalItemsProcessed: this.batchJobs.reduce((sum, job) => sum + job.processedItems, 0),
      averageProcessingTime: this.calculateAverageProcessingTime(),
      successRate: this.calculateSuccessRate()
    };
  }

  private calculateAverageProcessingTime(): number {
    const completedJobs = this.batchJobs.filter(job => job.status === 'completed' && job.duration);
    if (completedJobs.length === 0) return 0;
    
    const totalTime = completedJobs.reduce((sum, job) => sum + (job.duration || 0), 0);
    return Math.round(totalTime / completedJobs.length / 1000 / 60); // Convert to minutes
  }

  private calculateSuccessRate(): number {
    const completedOrFailed = this.batchJobs.filter(job => 
      job.status === 'completed' || job.status === 'failed'
    );
    if (completedOrFailed.length === 0) return 0;
    
    const completed = this.batchJobs.filter(job => job.status === 'completed').length;
    return Math.round((completed / completedOrFailed.length) * 100);
  }

  private startAutoRefresh() {
    if (this.autoRefresh && !this.refreshSubscription) {
      this.refreshSubscription = interval(this.refreshInterval).subscribe(() => {
        this.refreshData();
      });
    }
  }

  private stopAutoRefresh() {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
      this.refreshSubscription = undefined;
    }
  }

  private refreshData() {
    // Simulate progress updates for running jobs
    this.batchJobs = this.batchJobs.map(job => {
      if (job.status === 'running' && job.progress < 100) {
        const increment = Math.random() * 5; // 0-5% progress increment
        const newProgress = Math.min(job.progress + increment, 100);
        const newProcessedItems = Math.floor((newProgress / 100) * job.totalItems);
        
        return {
          ...job,
          progress: newProgress,
          processedItems: newProcessedItems,
          status: newProgress >= 100 ? 'completed' : 'running',
          endTime: newProgress >= 100 ? new Date() : undefined,
          duration: newProgress >= 100 ? Date.now() - job.startTime.getTime() : undefined
        };
      }
      return job;
    });
    
    this.updateStats();
    this.applyFilters();
  }

  // Filter and search methods
  applyFilters() {
    let filtered = [...this.batchJobs];

    // Status filter
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(job => job.status === this.statusFilter);
    }

    // Type filter
    if (this.typeFilter !== 'all') {
      filtered = filtered.filter(job => job.type === this.typeFilter);
    }

    // Search filter
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(job =>
        job.name.toLowerCase().includes(term) ||
        job.createdBy.toLowerCase().includes(term) ||
        job.id.toLowerCase().includes(term)
      );
    }

    this.filteredJobs = filtered;
    this.updatePagination();
  }

  private updatePagination() {
    this.totalPages = Math.ceil(this.filteredJobs.length / this.itemsPerPage);
    this.currentPage = Math.min(this.currentPage, this.totalPages || 1);
  }

  get paginatedJobs(): BatchJob[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredJobs.slice(start, start + this.itemsPerPage);
  }

  // Job actions
  viewJobDetails(job: BatchJob) {
    this.selectedJob = job;
    this.showJobDetails = true;
  }

  retryJob(job: BatchJob) {
    if (job.status === 'failed') {
      const updatedJob = {
        ...job,
        status: 'pending' as const,
        progress: 0,
        processedItems: 0,
        failedItems: 0,
        errorMessage: undefined,
        logs: [
          ...job.logs,
          {
            id: Date.now().toString(),
            timestamp: new Date(),
            level: 'info' as const,
            message: 'Job restarted by user',
            details: { retriedBy: 'Current User' }
          }
        ]
      };

      this.batchJobs = this.batchJobs.map(j => j.id === job.id ? updatedJob : j);
      this.applyFilters();
    }
  }

  cancelJob(job: BatchJob) {
    if (job.status === 'running' || job.status === 'pending') {
      const updatedJob = {
        ...job,
        status: 'cancelled' as const,
        endTime: new Date(),
        logs: [
          ...job.logs,
          {
            id: Date.now().toString(),
            timestamp: new Date(),
            level: 'warning' as const,
            message: 'Job cancelled by user',
            details: { cancelledBy: 'Current User' }
          }
        ]
      };

      this.batchJobs = this.batchJobs.map(j => j.id === job.id ? updatedJob : j);
      this.applyFilters();
    }
  }

  pauseJob(job: BatchJob) {
    if (job.status === 'running') {
      const updatedJob = {
        ...job,
        status: 'paused' as const,
        logs: [
          ...job.logs,
          {
            id: Date.now().toString(),
            timestamp: new Date(),
            level: 'info' as const,
            message: 'Job paused by user',
            details: { pausedBy: 'Current User' }
          }
        ]
      };

      this.batchJobs = this.batchJobs.map(j => j.id === job.id ? updatedJob : j);
      this.applyFilters();
    }
  }

  resumeJob(job: BatchJob) {
    if (job.status === 'paused') {
      const updatedJob = {
        ...job,
        status: 'running' as const,
        logs: [
          ...job.logs,
          {
            id: Date.now().toString(),
            timestamp: new Date(),
            level: 'info' as const,
            message: 'Job resumed by user',
            details: { resumedBy: 'Current User' }
          }
        ]
      };

      this.batchJobs = this.batchJobs.map(j => j.id === job.id ? updatedJob : j);
      this.applyFilters();
    }
  }

  deleteJob(job: BatchJob) {
    if (job.status !== 'running') {
      this.batchJobs = this.batchJobs.filter(j => j.id !== job.id);
      this.applyFilters();
      
      if (this.selectedJob?.id === job.id) {
        this.showJobDetails = false;
        this.selectedJob = null;
      }
    }
  }

  // UI methods
  toggleAutoRefresh() {
    this.autoRefresh = !this.autoRefresh;
    if (this.autoRefresh) {
      this.startAutoRefresh();
    } else {
      this.stopAutoRefresh();
    }
  }

  refreshManually() {
    this.loadBatchJobs();
  }

  clearFilters() {
    this.statusFilter = 'all';
    this.typeFilter = 'all';
    this.searchTerm = '';
    this.applyFilters();
  }

  closeJobDetails() {
    this.showJobDetails = false;
    this.selectedJob = null;
  }

  // Utility methods
  getStatusColor(status: string): string {
    return this.statuses.find(s => s.value === status)?.color || '#6b7280';
  }

  getJobTypeLabel(type: string): string {
    return this.jobTypes.find(t => t.value === type)?.label || type;
  }

  getJobTypeIcon(type: string): string {
    return this.jobTypes.find(t => t.value === type)?.icon || 'default';
  }

  formatDuration(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
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

  getEstimatedTimeRemaining(job: BatchJob): string {
    if (!job.estimatedCompletion) return 'Unknown';
    
    const now = new Date();
    const remaining = job.estimatedCompletion.getTime() - now.getTime();
    
    if (remaining <= 0) return 'Completing...';
    
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  }

  // Pagination methods
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

  trackJob(index: number, job: BatchJob): string {
    return job.id;
  }

  // Helper methods for template
  getRunningTime(job: BatchJob): string {
    if (job.status !== 'running') return '';
    const now = Date.now();
    const runningTime = now - job.startTime.getTime();
    return this.formatDuration(runningTime);
  }

  getMetadataEntries(): [string, any][] {
    if (!this.selectedJob?.metadata) return [];
    return Object.entries(this.selectedJob.metadata);
  }

  hasMetadata(): boolean {
    if (!this.selectedJob?.metadata) return false;
    return Object.keys(this.selectedJob.metadata).length > 0;
  }
} 