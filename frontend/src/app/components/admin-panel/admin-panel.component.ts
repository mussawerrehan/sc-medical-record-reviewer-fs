import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Subscription } from 'rxjs';

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'super_admin' | 'hospital_admin' | 'department_manager' | 'user';
  status: 'active' | 'inactive' | 'suspended';
  lastLogin?: Date;
  createdAt: Date;
  facilities: string[];
  permissions: string[];
}

export interface Facility {
  id: string;
  name: string;
  type: 'hospital' | 'clinic' | 'outpatient' | 'emergency';
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  contact: {
    phone: string;
    email: string;
    website?: string;
  };
  status: 'active' | 'inactive';
  services: string[];
  certifications: string[];
  createdAt: Date;
}

export interface SystemConfiguration {
  id: string;
  category: 'general' | 'security' | 'compliance' | 'integration';
  name: string;
  value: any;
  description: string;
  lastModified: Date;
  modifiedBy: string;
}

export interface AuditLog {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: any;
  ipAddress: string;
  userAgent: string;
}

export interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalFacilities: number;
  activeFacilities: number;
  totalCases: number;
  activeCases: number;
  systemUptime: number;
  diskUsage: number;
  memoryUsage: number;
  cpuUsage: number;
}

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.scss']
})
export class AdminPanelComponent implements OnInit, OnDestroy {
  
  // State management
  activeTab: 'dashboard' | 'users' | 'facilities' | 'settings' | 'audit' = 'dashboard';
  loading = false;
  error: string | null = null;
  
  // System statistics
  systemStats: SystemStats = {
    totalUsers: 0,
    activeUsers: 0,
    totalFacilities: 0,
    activeFacilities: 0,
    totalCases: 0,
    activeCases: 0,
    systemUptime: 0,
    diskUsage: 0,
    memoryUsage: 0,
    cpuUsage: 0
  };
  
  // User management
  users: AdminUser[] = [];
  filteredUsers: AdminUser[] = [];
  selectedUser: AdminUser | null = null;
  userForm: FormGroup;
  showUserModal = false;
  userFilters = {
    role: 'all',
    status: 'all',
    facility: 'all',
    search: ''
  };
  
  // Facility management
  facilities: Facility[] = [];
  filteredFacilities: Facility[] = [];
  selectedFacility: Facility | null = null;
  facilityForm: FormGroup;
  showFacilityModal = false;
  facilityFilters = {
    type: 'all',
    status: 'all',
    search: ''
  };
  
  // System configuration
  configurations: SystemConfiguration[] = [];
  filteredConfigurations: SystemConfiguration[] = [];
  selectedConfiguration: SystemConfiguration | null = null;
  configForm: FormGroup;
  showConfigModal = false;
  configFilters = {
    category: 'all',
    search: ''
  };
  
  // Audit logs
  auditLogs: AuditLog[] = [];
  filteredAuditLogs: AuditLog[] = [];
  auditFilters = {
    action: 'all',
    dateRange: 'last24h',
    user: 'all',
    search: ''
  };
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  
  // Constants
  roles = [
    { value: 'super_admin', label: 'Super Administrator' },
    { value: 'hospital_admin', label: 'Hospital Administrator' },
    { value: 'department_manager', label: 'Department Manager' },
    { value: 'user', label: 'User' }
  ];
  
  statuses = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'suspended', label: 'Suspended' }
  ];
  
  facilityTypes = [
    { value: 'hospital', label: 'Hospital' },
    { value: 'clinic', label: 'Clinic' },
    { value: 'outpatient', label: 'Outpatient Center' },
    { value: 'emergency', label: 'Emergency Center' }
  ];
  
  configCategories = [
    { value: 'general', label: 'General Settings' },
    { value: 'security', label: 'Security Settings' },
    { value: 'compliance', label: 'Compliance Settings' },
    { value: 'integration', label: 'Integration Settings' }
  ];

  private subscriptions: Subscription[] = [];

  constructor(private fb: FormBuilder) {
    this.userForm = this.createUserForm();
    this.facilityForm = this.createFacilityForm();
    this.configForm = this.createConfigForm();
    this.initializeSampleData();
  }

  ngOnInit() {
    this.loadSystemStats();
    this.loadUsers();
    this.loadFacilities();
    this.loadConfigurations();
    this.loadAuditLogs();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private createUserForm(): FormGroup {
    return this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      role: ['user', Validators.required],
      status: ['active', Validators.required],
      facilities: [[]],
      permissions: [[]]
    });
  }

  private createFacilityForm(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      type: ['hospital', Validators.required],
      address: this.fb.group({
        street: ['', Validators.required],
        city: ['', Validators.required],
        state: ['', Validators.required],
        zipCode: ['', [Validators.required, Validators.pattern(/^\d{5}(-\d{4})?$/)]]
      }),
      contact: this.fb.group({
        phone: ['', [Validators.required, Validators.pattern(/^\(\d{3}\) \d{3}-\d{4}$/)]],
        email: ['', [Validators.required, Validators.email]],
        website: ['']
      }),
      status: ['active', Validators.required],
      services: [[]],
      certifications: [[]]
    });
  }

  private createConfigForm(): FormGroup {
    return this.fb.group({
      category: ['general', Validators.required],
      name: ['', Validators.required],
      value: ['', Validators.required],
      description: ['', Validators.required]
    });
  }

  private initializeSampleData() {
    // Sample users
    this.users = [
      {
        id: '1',
        username: 'admin',
        email: 'admin@hospital.com',
        firstName: 'System',
        lastName: 'Administrator',
        role: 'super_admin',
        status: 'active',
        lastLogin: new Date(Date.now() - 3600000),
        createdAt: new Date(Date.now() - 86400000 * 30),
        facilities: ['facility-1', 'facility-2'],
        permissions: ['all']
      },
      {
        id: '2',
        username: 'dr.smith',
        email: 'dr.smith@hospital.com',
        firstName: 'John',
        lastName: 'Smith',
        role: 'hospital_admin',
        status: 'active',
        lastLogin: new Date(Date.now() - 7200000),
        createdAt: new Date(Date.now() - 86400000 * 15),
        facilities: ['facility-1'],
        permissions: ['user_management', 'case_management']
      }
    ];

    // Sample facilities
    this.facilities = [
      {
        id: 'facility-1',
        name: 'Main Campus Hospital',
        type: 'hospital',
        address: {
          street: '123 Medical Center Dr',
          city: 'Healthcare City',
          state: 'CA',
          zipCode: '90210'
        },
        contact: {
          phone: '(555) 123-4567',
          email: 'info@maincampus.com',
          website: 'https://maincampus.com'
        },
        status: 'active',
        services: ['Emergency', 'Surgery', 'Cardiology', 'Oncology'],
        certifications: ['Joint Commission', 'Magnet', 'HIMSS Level 7'],
        createdAt: new Date(Date.now() - 86400000 * 365)
      }
    ];

    // Sample configurations
    this.configurations = [
      {
        id: '1',
        category: 'security',
        name: 'Password Policy',
        value: { minLength: 8, requireSpecialChars: true, maxAge: 90 },
        description: 'System-wide password requirements',
        lastModified: new Date(Date.now() - 86400000 * 7),
        modifiedBy: 'admin'
      },
      {
        id: '2',
        category: 'compliance',
        name: 'HIPAA Audit Retention',
        value: 2555, // days
        description: 'Number of days to retain audit logs for HIPAA compliance',
        lastModified: new Date(Date.now() - 86400000 * 30),
        modifiedBy: 'admin'
      }
    ];

    // Sample audit logs
    this.auditLogs = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 3600000),
        userId: '1',
        userName: 'admin',
        action: 'USER_LOGIN',
        resource: 'Authentication',
        details: { loginMethod: 'password' },
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0...'
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 7200000),
        userId: '2',
        userName: 'dr.smith',
        action: 'CASE_CREATED',
        resource: 'Case',
        resourceId: 'case-123',
        details: { patientId: 'patient-456', caseType: 'routine' },
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0...'
      }
    ];

    this.updateSystemStats();
  }

  private loadSystemStats() {
    this.loading = true;
    setTimeout(() => {
      this.updateSystemStats();
      this.loading = false;
    }, 1000);
  }

  private updateSystemStats() {
    this.systemStats = {
      totalUsers: this.users.length,
      activeUsers: this.users.filter(u => u.status === 'active').length,
      totalFacilities: this.facilities.length,
      activeFacilities: this.facilities.filter(f => f.status === 'active').length,
      totalCases: 1250, // Mock data
      activeCases: 89, // Mock data
      systemUptime: 99.9, // Mock data
      diskUsage: 65.4, // Mock data
      memoryUsage: 78.2, // Mock data
      cpuUsage: 23.7 // Mock data
    };
  }

  private loadUsers() {
    this.applyUserFilters();
  }

  private loadFacilities() {
    this.applyFacilityFilters();
  }

  private loadConfigurations() {
    this.applyConfigFilters();
  }

  private loadAuditLogs() {
    this.applyAuditFilters();
  }

  // Tab management
  setActiveTab(tab: typeof this.activeTab) {
    this.activeTab = tab;
    this.currentPage = 1;
  }

  // User management
  applyUserFilters() {
    let filtered = [...this.users];

    if (this.userFilters.role !== 'all') {
      filtered = filtered.filter(user => user.role === this.userFilters.role);
    }

    if (this.userFilters.status !== 'all') {
      filtered = filtered.filter(user => user.status === this.userFilters.status);
    }

    if (this.userFilters.search.trim()) {
      const search = this.userFilters.search.toLowerCase();
      filtered = filtered.filter(user =>
        user.username.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search) ||
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(search)
      );
    }

    this.filteredUsers = filtered;
    this.updatePagination();
  }

  createUser() {
    this.selectedUser = null;
    this.userForm.reset();
    this.userForm.patchValue({ role: 'user', status: 'active' });
    this.showUserModal = true;
  }

  editUser(user: AdminUser) {
    this.selectedUser = user;
    this.userForm.patchValue(user);
    this.showUserModal = true;
  }

  saveUser() {
    if (this.userForm.valid) {
      const userData = this.userForm.value;
      
      if (this.selectedUser) {
        // Update existing user
        const updatedUser = { ...this.selectedUser, ...userData };
        this.users = this.users.map(u => u.id === this.selectedUser!.id ? updatedUser : u);
      } else {
        // Create new user
        const newUser: AdminUser = {
          id: Date.now().toString(),
          ...userData,
          lastLogin: undefined,
          createdAt: new Date()
        };
        this.users.unshift(newUser);
      }

      this.applyUserFilters();
      this.updateSystemStats();
      this.closeUserModal();
    }
  }

  deleteUser(user: AdminUser) {
    if (confirm(`Are you sure you want to delete user ${user.username}?`)) {
      this.users = this.users.filter(u => u.id !== user.id);
      this.applyUserFilters();
      this.updateSystemStats();
    }
  }

  // Facility management
  applyFacilityFilters() {
    let filtered = [...this.facilities];

    if (this.facilityFilters.type !== 'all') {
      filtered = filtered.filter(facility => facility.type === this.facilityFilters.type);
    }

    if (this.facilityFilters.status !== 'all') {
      filtered = filtered.filter(facility => facility.status === this.facilityFilters.status);
    }

    if (this.facilityFilters.search.trim()) {
      const search = this.facilityFilters.search.toLowerCase();
      filtered = filtered.filter(facility =>
        facility.name.toLowerCase().includes(search) ||
        facility.address.city.toLowerCase().includes(search)
      );
    }

    this.filteredFacilities = filtered;
    this.updatePagination();
  }

  createFacility() {
    this.selectedFacility = null;
    this.facilityForm.reset();
    this.facilityForm.patchValue({ type: 'hospital', status: 'active' });
    this.showFacilityModal = true;
  }

  editFacility(facility: Facility) {
    this.selectedFacility = facility;
    this.facilityForm.patchValue(facility);
    this.showFacilityModal = true;
  }

  saveFacility() {
    if (this.facilityForm.valid) {
      const facilityData = this.facilityForm.value;
      
      if (this.selectedFacility) {
        // Update existing facility
        const updatedFacility = { ...this.selectedFacility, ...facilityData };
        this.facilities = this.facilities.map(f => f.id === this.selectedFacility!.id ? updatedFacility : f);
      } else {
        // Create new facility
        const newFacility: Facility = {
          id: Date.now().toString(),
          ...facilityData,
          createdAt: new Date()
        };
        this.facilities.unshift(newFacility);
      }

      this.applyFacilityFilters();
      this.updateSystemStats();
      this.closeFacilityModal();
    }
  }

  deleteFacility(facility: Facility) {
    if (confirm(`Are you sure you want to delete facility ${facility.name}?`)) {
      this.facilities = this.facilities.filter(f => f.id !== facility.id);
      this.applyFacilityFilters();
      this.updateSystemStats();
    }
  }

  // Configuration management
  applyConfigFilters() {
    let filtered = [...this.configurations];

    if (this.configFilters.category !== 'all') {
      filtered = filtered.filter(config => config.category === this.configFilters.category);
    }

    if (this.configFilters.search.trim()) {
      const search = this.configFilters.search.toLowerCase();
      filtered = filtered.filter(config =>
        config.name.toLowerCase().includes(search) ||
        config.description.toLowerCase().includes(search)
      );
    }

    this.filteredConfigurations = filtered;
    this.updatePagination();
  }

  createConfiguration() {
    this.selectedConfiguration = null;
    this.configForm.reset();
    this.configForm.patchValue({ category: 'general' });
    this.showConfigModal = true;
  }

  editConfiguration(config: SystemConfiguration) {
    this.selectedConfiguration = config;
    this.configForm.patchValue({
      category: config.category,
      name: config.name,
      value: JSON.stringify(config.value),
      description: config.description
    });
    this.showConfigModal = true;
  }

  saveConfiguration() {
    if (this.configForm.valid) {
      const configData = this.configForm.value;
      
      try {
        // Parse JSON value
        const parsedValue = JSON.parse(configData.value);
        
        if (this.selectedConfiguration) {
          // Update existing configuration
          const updatedConfig = {
            ...this.selectedConfiguration,
            ...configData,
            value: parsedValue,
            lastModified: new Date(),
            modifiedBy: 'current-user'
          };
          this.configurations = this.configurations.map(c => 
            c.id === this.selectedConfiguration!.id ? updatedConfig : c
          );
        } else {
          // Create new configuration
          const newConfig: SystemConfiguration = {
            id: Date.now().toString(),
            ...configData,
            value: parsedValue,
            lastModified: new Date(),
            modifiedBy: 'current-user'
          };
          this.configurations.unshift(newConfig);
        }

        this.applyConfigFilters();
        this.closeConfigModal();
      } catch (error) {
        alert('Invalid JSON format for configuration value');
      }
    }
  }

  deleteConfiguration(config: SystemConfiguration) {
    if (confirm(`Are you sure you want to delete configuration ${config.name}?`)) {
      this.configurations = this.configurations.filter(c => c.id !== config.id);
      this.applyConfigFilters();
    }
  }

  // Audit log management
  applyAuditFilters() {
    let filtered = [...this.auditLogs];

    if (this.auditFilters.search.trim()) {
      const search = this.auditFilters.search.toLowerCase();
      filtered = filtered.filter(log =>
        log.action.toLowerCase().includes(search) ||
        log.userName.toLowerCase().includes(search) ||
        log.resource.toLowerCase().includes(search)
      );
    }

    this.filteredAuditLogs = filtered;
    this.updatePagination();
  }

  // Modal management
  closeUserModal() {
    this.showUserModal = false;
    this.selectedUser = null;
    this.userForm.reset();
  }

  closeFacilityModal() {
    this.showFacilityModal = false;
    this.selectedFacility = null;
    this.facilityForm.reset();
  }

  closeConfigModal() {
    this.showConfigModal = false;
    this.selectedConfiguration = null;
    this.configForm.reset();
  }

  // Utility methods
  private updatePagination() {
    let itemCount = 0;
    switch (this.activeTab) {
      case 'users':
        itemCount = this.filteredUsers.length;
        break;
      case 'facilities':
        itemCount = this.filteredFacilities.length;
        break;
      case 'settings':
        itemCount = this.filteredConfigurations.length;
        break;
      case 'audit':
        itemCount = this.filteredAuditLogs.length;
        break;
    }
    
    this.totalPages = Math.ceil(itemCount / this.itemsPerPage);
    this.currentPage = Math.min(this.currentPage, this.totalPages || 1);
  }

  getRoleLabel(role: string): string {
    return this.roles.find(r => r.value === role)?.label || role;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'active': return '#059669';
      case 'inactive': return '#6b7280';
      case 'suspended': return '#dc2626';
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

  formatConfigValue(value: any): string {
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  }

  // Pagination
  get paginatedItems(): any[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    
    switch (this.activeTab) {
      case 'users':
        return this.filteredUsers.slice(start, end);
      case 'facilities':
        return this.filteredFacilities.slice(start, end);
      case 'settings':
        return this.filteredConfigurations.slice(start, end);
      case 'audit':
        return this.filteredAuditLogs.slice(start, end);
      default:
        return [];
    }
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