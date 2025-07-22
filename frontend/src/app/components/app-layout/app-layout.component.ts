import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { filter } from 'rxjs/operators';

export interface NavigationItem {
  id: string;
  name: string;
  route: string;
  icon: string;
  description: string;
  badge: string | null;
}

export interface UserInfo {
  name: string;
  role: string;
  facility: string;
}

export interface Notification {
  id: number;
  type: 'info' | 'warning' | 'success' | 'error';
  message: string;
  time: string;
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app-layout.component.html',
  styleUrls: ['./app-layout.component.scss']
})
export class AppLayoutComponent implements OnInit {
  @Input() currentView = 'dashboard';
  @Input() selectedCase: any = null;
  @Input() user: UserInfo = {
    name: 'Dr. Johnson',
    role: 'CDI Specialist',
    facility: 'Memorial Healthcare'
  };

  @Output() navigate = new EventEmitter<string>();
  @Output() logout = new EventEmitter<void>();

  sidebarOpen = false;
  currentRoute = '';
  
  navigation: NavigationItem[] = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      route: '/dashboard',
      icon: 'home',
      description: 'Overview and key metrics',
      badge: null
    },
    {
      id: 'worklist',
      name: 'Case Worklist',
      route: '/claims',
      icon: 'clipboard',
      description: 'Review pending cases',
      badge: '23'
    },
    {
      id: 'compliance-checker',
      name: 'Compliance Checker',
      route: '/compliance',
      icon: 'shield',
      description: 'Claim validation and audit',
      badge: 'New'
    },
    {
      id: 'reporting',
      name: 'Analytics',
      route: '/analytics',
      icon: 'chart',
      description: 'Reports and insights',
      badge: null
    },
    {
      id: 'ai-assistant',
      name: 'AI Assistant',
      route: '/ai-assistant',
      icon: 'brain',
      description: 'Get help and guidance',
      badge: null
    },
    {
      id: 'batch-monitoring',
      name: 'Batch Monitoring',
      route: '/batch-monitoring',
      icon: 'activity',
      description: 'Monitor jobs and system logs',
      badge: null
    },
    {
      id: 'admin-panel',
      name: 'Admin Panel',
      route: '/admin',
      icon: 'settings',
      description: 'User management and settings',
      badge: null
    }
  ];

  notifications: Notification[] = [
    {
      id: 1,
      type: 'info',
      message: 'Query response from Dr. Smith',
      time: '5 min ago'
    },
    {
      id: 2,
      type: 'warning',
      message: '3 claims require attention',
      time: '12 min ago'
    },
    {
      id: 3,
      type: 'success',
      message: 'Batch processing complete',
      time: '1 hour ago'
    }
  ];

  // Today's summary data
  todaySummary = {
    casesReviewed: 24,
    queriesSent: 8,
    drgImpact: '+$12.4K'
  };

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Listen to route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentRoute = event.url;
      this.updateCurrentView();
    });

    // Set initial route
    this.currentRoute = this.router.url;
    this.updateCurrentView();
  }

  private updateCurrentView() {
    const currentNavItem = this.navigation.find(item => 
      this.currentRoute.startsWith(item.route)
    );
    if (currentNavItem) {
      this.currentView = currentNavItem.id;
    }
  }

  get currentPage(): NavigationItem | undefined {
    return this.navigation.find(item => item.id === this.currentView);
  }

  getCurrentPageName(): string {
    const page = this.currentPage;
    return page ? page.name : 'Dashboard';
  }

  get userInitials(): string {
    return this.user.name
      .split(' ')
      .map(n => n[0])
      .join('');
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  navigateTo(route: string, itemId?: string) {
    this.router.navigate([route]);
    this.sidebarOpen = false;
    if (itemId) {
      this.currentView = itemId;
      this.navigate.emit(itemId);
    }
  }

  isActiveRoute(route: string): boolean {
    return this.currentRoute.startsWith(route);
  }

  handleLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
    this.sidebarOpen = false;
    this.logout.emit();
  }

  getNotificationDotColor(type: string): string {
    switch (type) {
      case 'success': return 'var(--medical-secondary)';
      case 'warning': return 'var(--medical-warning)';
      case 'error': return 'var(--medical-error)';
      case 'info':
      default: return 'var(--medical-info)';
    }
  }
} 