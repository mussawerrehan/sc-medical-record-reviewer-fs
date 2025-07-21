import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './components/login/login.component';
import { CaseWorklistComponent } from './components/case-worklist/case-worklist.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, LoginComponent, CaseWorklistComponent],
  template: `
    <div class="min-h-screen bg-background" style="background-color: #fafbfc;">
      <!-- Login Screen -->
      <app-login 
        *ngIf="!isLoggedIn" 
        (login)="handleLogin($event)">
      </app-login>
      
      <!-- Main Application -->
      <div *ngIf="isLoggedIn" class="min-h-screen bg-background">
        <!-- Top Navigation Bar -->
        <header class="bg-white border-b border-gray-200 px-4 lg:px-6 py-3 shadow-sm">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <!-- Mobile Menu Button -->
              <button 
                class="lg:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
                (click)="toggleMobileSidebar()"
              >
                <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              </button>

              <!-- Logo and Title -->
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                </div>
                <div>
                  <h1 class="text-xl font-semibold text-gray-900">SmartCycleAI</h1>
                  <p class="text-xs text-gray-500">Clinical Documentation Intelligence</p>
                </div>
              </div>
            </div>

            <!-- Right Side Header -->
            <div class="flex items-center gap-4">
              <!-- Search -->
              <div class="hidden md:flex relative">
                <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                <input
                  type="text"
                  placeholder="Search cases, patients..."
                  class="pl-10 pr-4 py-2 w-80 border border-gray-200 bg-gray-50 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>

              <!-- Notifications -->
              <button class="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5z"></path>
                </svg>
                <span class="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-medium">3</span>
              </button>

              <!-- User Menu -->
              <div class="flex items-center gap-3">
                <div class="text-right hidden sm:block">
                  <p class="text-sm font-medium text-gray-900">Dr. Johnson</p>
                  <p class="text-xs text-gray-500">CDI Specialist</p>
                </div>
                <div class="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
                  <span class="text-white text-sm font-medium">DJ</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div class="flex">
          <!-- Desktop Sidebar -->
          <aside class="w-64 bg-white border-r border-gray-200 hidden lg:block">
            <!-- Navigation Items -->
            <div class="p-4 space-y-1">
              <div
                *ngFor="let item of navigation"
                class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 cursor-pointer group"
                [class.bg-blue-600]="currentView === item.id"
                [class.text-white]="currentView === item.id"
                [class.shadow-lg]="currentView === item.id"
                [class.text-gray-700]="currentView !== item.id"
                [class.hover:bg-blue-50]="currentView !== item.id"
                [class.hover:text-blue-600]="currentView !== item.id"
                (click)="setCurrentView(item.id)"
              >
                <div class="w-5 h-5 flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
                  <svg class="w-5 h-5 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path [attr.d]="getIconPath(item.icon)" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                  </svg>
                </div>
                <span class="flex-1 text-left font-medium">{{ item.name }}</span>
                <span 
                  *ngIf="item.badge" 
                  class="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-600 text-white"
                >
                  {{ item.badge }}
                </span>
              </div>
            </div>

            <!-- Separator -->
            <div class="mx-4 border-t border-gray-200"></div>

            <!-- Quick Stats -->
            <div class="p-4 mx-4 mt-4 bg-gray-50 rounded-lg shadow-sm">
              <h3 class="text-sm font-semibold text-gray-900 mb-3">Today's Summary</h3>
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <div class="w-2 h-2 rounded-full bg-blue-600"></div>
                    <span class="text-sm text-gray-600">Cases Reviewed</span>
                  </div>
                  <span class="text-sm font-semibold text-gray-900">24</span>
                </div>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <div class="w-2 h-2 rounded-full bg-orange-500"></div>
                    <span class="text-sm text-gray-600">Queries Sent</span>
                  </div>
                  <span class="text-sm font-semibold text-gray-900">8</span>
                </div>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <div class="w-2 h-2 rounded-full bg-green-500"></div>
                    <span class="text-sm text-gray-600">DRG Impact</span>
                  </div>
                  <span class="text-sm font-semibold text-green-600">+$12.4K</span>
                </div>
              </div>
            </div>

            <!-- Separator -->
            <div class="mx-4 mt-4 border-t border-gray-200"></div>

            <!-- User Profile Section -->
            <div class="p-4">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
                  <span class="text-white text-sm font-medium">DJ</span>
                </div>
                <div class="flex-1">
                  <div class="text-sm font-medium text-gray-900">Dr. Johnson</div>
                  <div class="text-xs text-gray-600">CDI Specialist</div>
                </div>
              </div>

              <!-- Logout Button -->
              <button
                class="w-full flex items-center gap-3 px-3 py-2 rounded-md text-left text-red-600 hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                (click)="handleLogout()"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                </svg>
                <span class="font-medium">Logout</span>
              </button>
            </div>
          </aside>

          <!-- Mobile Sidebar Overlay -->
          <div 
            *ngIf="mobileSidebarOpen" 
            class="fixed inset-0 z-50 lg:hidden"
          >
            <!-- Backdrop -->
            <div 
              class="fixed inset-0 bg-black bg-opacity-50"
              (click)="toggleMobileSidebar()"
            ></div>
            
            <!-- Mobile Sidebar -->
            <div class="fixed top-0 left-0 w-64 h-full bg-nav-bg border-r border-nav-border shadow-xl" style="background-color: #ffffff; border-color: #e2e8f0;">
              <!-- Logo Section -->
              <div class="p-4 border-b" style="border-color: #e2e8f0;">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-gradient-to-br from-medical-primary to-medical-info rounded-lg flex items-center justify-center" style="background: linear-gradient(135deg, #2b6cb0 0%, #3182ce 100%);">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                    </svg>
                  </div>
                  <div>
                    <h1 class="text-lg font-semibold text-foreground" style="color: #1a202c;">SmartCycleAI</h1>
                    <p class="text-xs text-muted-foreground" style="color: #718096;">CDI Platform</p>
                  </div>
                </div>
              </div>

              <!-- Navigation Items -->
              <div class="p-4 space-y-1">
                <div
                  *ngFor="let item of navigation"
                  [class]="'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 cursor-pointer group ' + (currentView === item.id ? 'bg-gradient-to-r from-medical-primary to-medical-info text-white shadow-lg' : 'text-slate-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-medical-primary')"
                  [style]="currentView === item.id ? 'background: linear-gradient(135deg, #2b6cb0 0%, #3182ce 100%); color: white; box-shadow: 0 4px 12px rgba(43, 108, 176, 0.25);' : 'color: #334155;'"
                  (click)="setCurrentView(item.id); toggleMobileSidebar()"
                >
                  <div class="w-5 h-5 flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
                    <svg class="w-5 h-5 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path [attr.d]="getIconPath(item.icon)" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                    </svg>
                  </div>
                  <span class="flex-1 text-left font-medium">{{ item.name }}</span>
                  <span 
                    *ngIf="item.badge" 
                    [class]="'text-xs px-2 py-0.5 rounded-full font-medium ' + (item.badge === 'New' ? 'bg-medical-info text-white' : 'bg-muted text-muted-foreground')"
                    [style]="item.badge === 'New' ? 'background-color: #3182ce; color: white;' : 'background-color: #f0f4f8; color: #718096;'"
                  >
                    {{ item.badge }}
                  </span>
                </div>
              </div>

              <!-- Separator -->
              <div class="mx-4 border-t" style="border-color: #e2e8f0;"></div>

              <!-- Quick Stats -->
              <div class="p-4 mx-4 mt-4 bg-content-secondary rounded-lg shadow-sm" style="background-color: #f7fafc;">
                <h3 class="text-sm font-semibold text-foreground mb-3" style="color: #1a202c;">Today's Summary</h3>
                <div class="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <div class="text-lg font-semibold text-foreground" style="color: #1a202c;">24</div>
                    <div class="text-xs text-muted-foreground" style="color: #718096;">Cases</div>
                  </div>
                  <div>
                    <div class="text-lg font-semibold text-foreground" style="color: #1a202c;">8</div>
                    <div class="text-xs text-muted-foreground" style="color: #718096;">Queries</div>
                  </div>
                  <div>
                    <div class="text-lg font-semibold text-medical-secondary" style="color: #38a169;">+$12.4K</div>
                    <div class="text-xs text-muted-foreground" style="color: #718096;">DRG Impact</div>
                  </div>
                </div>
              </div>

              <!-- Separator -->
              <div class="mx-4 mt-4 border-t" style="border-color: #e2e8f0;"></div>

              <!-- User Profile & Logout -->
              <div class="p-4">
                <div class="flex items-center gap-3 mb-4">
                  <div class="w-8 h-8 bg-gradient-to-br from-medical-primary to-medical-info rounded-full flex items-center justify-center" style="background: linear-gradient(135deg, #2b6cb0 0%, #3182ce 100%);">
                    <span class="text-white text-sm font-medium">DJ</span>
                  </div>
                  <div class="flex-1">
                    <div class="text-sm font-medium text-foreground" style="color: #1a202c;">Dr. Johnson</div>
                    <div class="text-xs text-muted-foreground" style="color: #718096;">CDI Specialist</div>
                  </div>
                </div>

                <button
                  class="w-full flex items-center gap-3 px-3 py-2 rounded-md text-left text-destructive hover:bg-medical-error-light transition-colors"
                  style="color: #e53e3e;"
                  (click)="handleLogout(); toggleMobileSidebar()"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                  </svg>
                  <span class="font-medium">Logout</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Main Content -->
          <main class="flex-1 overflow-auto bg-background" style="background-color: #fafbfc;">
            <!-- Breadcrumb -->
            <div class="bg-nav-bg border-b border-nav-border px-6 py-3" style="background-color: #ffffff; border-color: #e2e8f0;">
              <div class="flex items-center gap-2 text-sm">
                <svg class="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #718096;">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                </svg>
                <svg class="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #718096;">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
                <span class="text-foreground" style="color: #1a202c;">{{ getCurrentPageName() }}</span>
              </div>
            </div>

            <!-- Dashboard Content -->
            <div class="p-6 space-y-6" *ngIf="currentView === 'dashboard'">
              <!-- Header with Filters -->
              <div class="flex items-center justify-between">
                <div>
                  <h1 class="text-2xl font-bold text-foreground" style="color: #1a202c;">Dashboard</h1>
                  <p class="text-muted-foreground mt-1" style="color: #718096;">Clinical Documentation Intelligence Overview</p>
                </div>
                <div class="flex items-center gap-3">
                  <div class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #718096;">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
                    </svg>
                    <select class="bg-card border border-border rounded-md px-3 py-1 text-sm" style="background-color: #ffffff; border-color: #e2e8f0;">
                      <option>Last 30 Days</option>
                      <option>Last 7 Days</option>
                      <option>Last 3 Months</option>
                    </select>
                  </div>
                  <button class="flex items-center gap-2 px-3 py-1 border border-border rounded-md text-sm hover:bg-muted" style="border-color: #e2e8f0;">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                    Refresh
                  </button>
                  <button class="flex items-center gap-2 px-4 py-2 bg-medical-primary text-white rounded-md hover:bg-medical-primary/90" style="background-color: #2b6cb0;">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                    View All Cases
                  </button>
                </div>
              </div>

              <!-- Alert Banner -->
              <div class="bg-medical-warning-light border border-medical-warning rounded-lg p-4" style="background-color: #fffaf0; border-color: #dd6b20;">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <svg class="w-5 h-5 text-medical-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #dd6b20;">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                    </svg>
                    <span class="text-medical-warning" style="color: #dd6b20;">
                      <strong>Alert:</strong> Denial rate increased 15% this week. Review high-risk cases immediately.
                    </span>
                  </div>
                  <button class="px-4 py-2 border border-medical-warning text-medical-warning rounded-md hover:bg-medical-warning-light" style="border-color: #dd6b20; color: #dd6b20;">
                    Review Cases
                  </button>
                </div>
              </div>

              <!-- New Feature Banner -->
              <div class="bg-medical-info-light border border-medical-info rounded-lg p-4" style="background-color: #ebf8ff; border-color: #3182ce;">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <svg class="w-5 h-5 text-medical-info" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #3182ce;">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                    </svg>
                    <span class="text-medical-info" style="color: #3182ce;">
                      <strong>New Feature:</strong> Claim Compliance Checker is now available! Validate claims before submission and catch billing errors early.
                    </span>
                  </div>
                  <button class="px-4 py-2 bg-medical-info text-white rounded-md hover:bg-medical-info/90" style="background-color: #3182ce;">
                    Try It Now
                  </button>
                </div>
              </div>

                        <!-- Top Metrics Bar - Exactly as in Figma -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <!-- Card 1: Open Reviews -->
            <div class="bg-content-bg border border-border rounded-lg hover:shadow-md transition-shadow" style="background-color: #ffffff; border-color: #e2e8f0;">
              <div class="p-6">
                <div class="flex items-center justify-between mb-3">
                  <svg class="w-6 h-6 text-medical-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #2b6cb0;">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  <span class="text-sm flex items-center text-muted-foreground" style="color: #718096;">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11l5-5m0 0l5 5m-5-5v12"></path>
                    </svg>
                    +5
                  </span>
                </div>
                <div class="text-3xl font-bold text-foreground mb-1" style="color: #1a202c;">47</div>
                <div class="text-sm font-medium text-foreground mb-1" style="color: #1a202c;">Open Reviews</div>
                <p class="text-xs text-muted-foreground" style="color: #718096;">Cases awaiting review</p>
              </div>
            </div>

            <!-- Card 2: Queries Sent -->
            <div class="bg-content-bg border border-border rounded-lg hover:shadow-md transition-shadow" style="background-color: #ffffff; border-color: #e2e8f0;">
              <div class="p-6">
                <div class="flex items-center justify-between mb-3">
                  <svg class="w-6 h-6 text-medical-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #2b6cb0;">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span class="text-sm flex items-center text-muted-foreground" style="color: #718096;">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11l5-5m0 0l5 5m-5-5v12"></path>
                    </svg>
                    +8
                  </span>
                </div>
                <div class="text-3xl font-bold text-foreground mb-1" style="color: #1a202c;">23</div>
                <div class="text-sm font-medium text-foreground mb-1" style="color: #1a202c;">Queries Sent (Pending Response)</div>
                <p class="text-xs text-muted-foreground" style="color: #718096;">Awaiting physician response</p>
              </div>
            </div>

            <!-- Card 3: DRG Changes -->
            <div class="bg-content-bg border border-border rounded-lg hover:shadow-md transition-shadow" style="background-color: #ffffff; border-color: #e2e8f0;">
              <div class="p-6">
                <div class="flex items-center justify-between mb-3">
                  <svg class="w-6 h-6 text-medical-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #2b6cb0;">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                  </svg>
                  <span class="text-sm flex items-center text-medical-secondary" style="color: #38a169;">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11l5-5m0 0l5 5m-5-5v12"></path>
                    </svg>
                    +12%
                  </span>
                </div>
                <div class="text-3xl font-bold text-foreground mb-1" style="color: #1a202c;">156</div>
                <div class="text-sm font-medium text-foreground mb-1" style="color: #1a202c;">DRG Changes this Month</div>
                <p class="text-xs text-muted-foreground" style="color: #718096;">Documentation improvements</p>
              </div>
            </div>

            <!-- Card 4: Denial Risk Cases -->
            <div class="bg-content-bg border border-border rounded-lg hover:shadow-md transition-shadow" style="background-color: #ffffff; border-color: #e2e8f0;">
              <div class="p-6">
                <div class="flex items-center justify-between mb-3">
                  <svg class="w-6 h-6 text-medical-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #2b6cb0;">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                  </svg>
                  <span class="text-sm flex items-center text-medical-secondary" style="color: #38a169;">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 13l-5 5m0 0l-5-5m5 5V6"></path>
                    </svg>
                    -3
                  </span>
                </div>
                <div class="text-3xl font-bold text-foreground mb-1" style="color: #1a202c;">8</div>
                <div class="text-sm font-medium text-foreground mb-1" style="color: #1a202c;">Denial Risk Cases</div>
                <p class="text-xs text-muted-foreground" style="color: #718096;">High risk for denial</p>
              </div>
            </div>
          </div>

              <!-- Charts Section -->
              <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- DRG Impact Chart -->
                <div class="bg-content-bg border border-border rounded-lg p-6" style="background-color: #ffffff; border-color: #e2e8f0;">
                  <div class="flex items-center gap-2 mb-3">
                    <svg class="w-5 h-5 text-medical-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #2b6cb0;">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                    </svg>
                    <h3 class="text-lg font-medium text-foreground" style="color: #1a202c;">DRG Impact Chart</h3>
                  </div>
                  <p class="text-muted-foreground text-sm mb-4" style="color: #718096;">Documentation improvement impact</p>
                  
                  <div class="space-y-4">
                    <div class="flex justify-between items-center">
                      <span class="text-sm text-muted-foreground" style="color: #718096;">Upgraded</span>
                      <span class="font-semibold text-medical-secondary" style="color: #38a169;">156</span>
                    </div>
                    <div class="w-full bg-muted rounded-full h-2" style="background-color: #f0f4f8;">
                      <div class="bg-medical-secondary h-2 rounded-full" style="width: 65%; background-color: #38a169;"></div>
                    </div>
                    
                    <div class="flex justify-between items-center">
                      <span class="text-sm text-muted-foreground" style="color: #718096;">No Change</span>
                      <span class="font-semibold text-muted-foreground" style="color: #718096;">89</span>
                    </div>
                    <div class="w-full bg-muted rounded-full h-2" style="background-color: #f0f4f8;">
                      <div class="bg-muted-foreground h-2 rounded-full" style="width: 35%; background-color: #718096;"></div>
                    </div>
                    
                    <div class="flex justify-between items-center">
                      <span class="text-sm text-muted-foreground" style="color: #718096;">Downgraded</span>
                      <span class="font-semibold text-medical-error" style="color: #e53e3e;">12</span>
                    </div>
                    <div class="w-full bg-muted rounded-full h-2" style="background-color: #f0f4f8;">
                      <div class="bg-medical-error h-2 rounded-full" style="width: 5%; background-color: #e53e3e;"></div>
                    </div>
                    
                    <p class="text-xs text-muted-foreground mt-3 italic" style="color: #718096;">DRG upgrades increased 12% this month</p>
                  </div>
                </div>

                <!-- Denial Risk Trend -->
                <div class="bg-content-bg border border-border rounded-lg p-6" style="background-color: #ffffff; border-color: #e2e8f0;">
                  <div class="flex items-center gap-2 mb-3">
                    <svg class="w-5 h-5 text-medical-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #38a169;">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path>
                    </svg>
                    <h3 class="text-lg font-medium text-foreground" style="color: #1a202c;">Denial Risk Trend</h3>
                  </div>
                  <p class="text-muted-foreground text-sm mb-4" style="color: #718096;">Risk score over time</p>
                  
                  <div class="text-center mb-4">
                    <div class="text-3xl font-bold text-foreground" style="color: #1a202c;">4.2%</div>
                    <div class="text-sm text-muted-foreground" style="color: #718096;">Current Risk Rate</div>
                  </div>
                  
                  <div class="flex items-center justify-center gap-2 mb-4">
                    <svg class="w-4 h-4 text-medical-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #38a169;">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path>
                    </svg>
                    <span class="text-sm text-medical-secondary" style="color: #38a169;">0.6% decrease</span>
                  </div>
                  
                  <div class="space-y-2">
                    <div class="flex justify-between text-sm">
                      <span class="text-muted-foreground" style="color: #718096;">vs Last Month</span>
                      <span class="text-foreground" style="color: #1a202c;">4.8%</span>
                    </div>
                    <div class="w-full bg-muted rounded-full h-2" style="background-color: #f0f4f8;">
                      <div class="bg-medical-secondary h-2 rounded-full" style="width: 84%; background-color: #38a169;"></div>
                    </div>
                  </div>
                  
                  <p class="text-xs text-muted-foreground mt-3 italic" style="color: #718096;">Denial risk decreased 0.6% since last month</p>
                </div>

                <!-- Query Response Rate -->
                <div class="bg-content-bg border border-border rounded-lg p-6" style="background-color: #ffffff; border-color: #e2e8f0;">
                  <div class="flex items-center gap-2 mb-3">
                    <svg class="w-5 h-5 text-medical-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #2b6cb0;">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                    </svg>
                    <h3 class="text-lg font-medium text-foreground" style="color: #1a202c;">Query Response Rate</h3>
                  </div>
                  <p class="text-muted-foreground text-sm mb-4" style="color: #718096;">Physician engagement metrics</p>
                  
                  <div class="space-y-4">
                    <div>
                      <div class="flex justify-between items-center mb-2">
                        <span class="text-sm font-medium text-foreground" style="color: #1a202c;">Response Rate</span>
                        <span class="text-lg font-bold text-foreground" style="color: #1a202c;">95%</span>
                      </div>
                      <div class="w-full bg-muted rounded-full h-3" style="background-color: #f0f4f8;">
                        <div class="bg-medical-primary h-3 rounded-full" style="width: 95%; background-color: #2b6cb0;"></div>
                      </div>
                    </div>
                    
                    <div>
                      <div class="flex justify-between items-center mb-2">
                        <span class="text-sm font-medium text-foreground" style="color: #1a202c;">Agreement Rate</span>
                        <span class="text-lg font-bold text-foreground" style="color: #1a202c;">80%</span>
                      </div>
                      <div class="w-full bg-muted rounded-full h-3" style="background-color: #f0f4f8;">
                        <div class="bg-medical-secondary h-3 rounded-full" style="width: 80%; background-color: #38a169;"></div>
                      </div>
                    </div>
                  </div>
                  
                  <p class="text-xs text-muted-foreground mt-3 italic" style="color: #718096;">Response rate excellent, agreement improving</p>
                </div>
              </div>

              <!-- Priority Cases Section -->
              <div class="bg-content-bg border border-border rounded-lg p-6" style="background-color: #ffffff; border-color: #e2e8f0;">
                <div class="flex items-center justify-between mb-6">
                  <div class="flex items-center gap-2">
                    <svg class="w-5 h-5 text-medical-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #dd6b20;">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                    </svg>
                    <h3 class="text-lg font-medium text-foreground" style="color: #1a202c;">5 High-Priority Cases Needing Attention</h3>
                  </div>
                  <button class="px-4 py-2 border border-border rounded-md text-sm hover:bg-muted" style="border-color: #e2e8f0;">
                    View Full Worklist
                  </button>
                </div>
                
                <div class="space-y-4">
                  <div class="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted cursor-pointer" style="border-color: #e2e8f0;">
                    <div class="flex items-center gap-3">
                      <span class="px-2 py-1 bg-medical-error text-white text-xs rounded-full" style="background-color: #e53e3e;">High</span>
                      <div>
                        <p class="text-sm font-medium text-foreground" style="color: #1a202c;">CASE-001 - Thompson, M.</p>
                        <p class="text-xs text-muted-foreground" style="color: #718096;">Sepsis documentation incomplete</p>
                      </div>
                    </div>
                    <div class="text-right">
                      <p class="text-sm font-medium text-medical-secondary" style="color: #38a169;">+$3,200</p>
                      <p class="text-xs text-muted-foreground" style="color: #718096;">2 days open</p>
                    </div>
                  </div>
                  
                  <div class="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted cursor-pointer" style="border-color: #e2e8f0;">
                    <div class="flex items-center gap-3">
                      <span class="px-2 py-1 bg-medical-error text-white text-xs rounded-full" style="background-color: #e53e3e;">High</span>
                      <div>
                        <p class="text-sm font-medium text-foreground" style="color: #1a202c;">CASE-002 - Garcia, L.</p>
                        <p class="text-xs text-muted-foreground" style="color: #718096;">AKI staging unclear</p>
                      </div>
                    </div>
                    <div class="text-right">
                      <p class="text-sm font-medium text-medical-secondary" style="color: #38a169;">+$1,800</p>
                      <p class="text-xs text-muted-foreground" style="color: #718096;">1 day open</p>
                    </div>
                  </div>
                  
                  <div class="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted cursor-pointer" style="border-color: #e2e8f0;">
                    <div class="flex items-center gap-3">
                      <span class="px-2 py-1 bg-medical-warning text-white text-xs rounded-full" style="background-color: #dd6b20;">Medium</span>
                      <div>
                        <p class="text-sm font-medium text-foreground" style="color: #1a202c;">CASE-003 - Anderson, P.</p>
                        <p class="text-xs text-muted-foreground" style="color: #718096;">Complications not coded</p>
                      </div>
                    </div>
                    <div class="text-right">
                      <p class="text-sm font-medium text-medical-secondary" style="color: #38a169;">+$2,100</p>
                      <p class="text-xs text-muted-foreground" style="color: #718096;">3 days open</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Case Worklist -->
            <app-case-worklist *ngIf="currentView === 'worklist'"></app-case-worklist>

            <!-- Other Views Placeholder -->
            <div class="p-6" *ngIf="currentView !== 'dashboard' && currentView !== 'worklist'">
              <div class="text-center py-12">
                <h2 class="text-xl font-semibold text-foreground mb-2" style="color: #1a202c;">{{ getCurrentPageName() }}</h2>
                <p class="text-muted-foreground" style="color: #718096;">This feature is coming soon...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .space-y-6 > :not([hidden]) ~ :not([hidden]) { margin-top: 1.5rem; }
    .space-y-4 > :not([hidden]) ~ :not([hidden]) { margin-top: 1rem; }
    .space-y-3 > :not([hidden]) ~ :not([hidden]) { margin-top: 0.75rem; }
    .space-y-2 > :not([hidden]) ~ :not([hidden]) { margin-top: 0.5rem; }
    .space-y-1 > :not([hidden]) ~ :not([hidden]) { margin-top: 0.25rem; }
    .gap-2 { gap: 0.5rem; }
    .gap-3 { gap: 0.75rem; }
    .gap-4 { gap: 1rem; }
    .gap-6 { gap: 1.5rem; }
    .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
    .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    .grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
    .w-64 { width: 16rem; }
    .w-2 { width: 0.5rem; }
    .h-2 { height: 0.5rem; }
    .w-4 { width: 1rem; }
    .h-4 { height: 1rem; }
    .w-5 { width: 1.25rem; }
    .h-5 { height: 1.25rem; }
    .w-6 { width: 1.5rem; }
    .h-6 { height: 1.5rem; }
    .w-8 { width: 2rem; }
    .h-8 { height: 2rem; }
    .flex-1 { flex: 1 1 0%; }
    .flex-shrink-0 { flex-shrink: 0; }
    .mb-2 { margin-bottom: 0.5rem; }
    .mb-3 { margin-bottom: 0.75rem; }
    .mb-4 { margin-bottom: 1rem; }
    .mb-6 { margin-bottom: 1.5rem; }
    .mt-1 { margin-top: 0.25rem; }
    .mt-4 { margin-top: 1rem; }
    .p-2 { padding: 0.5rem; }
    .p-3 { padding: 0.75rem; }
    .p-4 { padding: 1rem; }
    .p-6 { padding: 1.5rem; }
    .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
    .py-0\\.5 { padding-top: 0.125rem; padding-bottom: 0.125rem; }
    .py-2\\.5 { padding-top: 0.625rem; padding-bottom: 0.625rem; }
    .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
    .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
    .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
    .px-4 { padding-left: 1rem; padding-right: 1rem; }
    .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
    .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
    .rounded-full { border-radius: 50%; }
    .rounded-lg { border-radius: 0.5rem; }
    .rounded-md { border-radius: 0.375rem; }
    .shadow-sm { box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); }
    .shadow-xl { box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1); }
    .transition-all { transition-property: all; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
    .duration-200 { transition-duration: 200ms; }
    
    /* Focus styles */
    .focus\\:outline-none:focus { outline: 2px solid transparent; outline-offset: 2px; }
    .focus\\:ring-2:focus { --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color); --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color); box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000); }
    .focus\\:ring-medical-primary:focus { --tw-ring-color: #2b6cb0; }
    .focus\\:ring-red-500:focus { --tw-ring-color: #ef4444; }
    .focus\\:ring-offset-2:focus { --tw-ring-offset-width: 2px; }
    
    /* Hover styles */
    .hover\\:bg-nav-hover:hover { background-color: #f0f4f8; }
    .hover\\:bg-medical-error-light:hover { background-color: #fed7d7; }
    .hover\\:shadow-md:hover { box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); }
    .hover\\:bg-muted:hover { background-color: #f0f4f8; }
    .hover\\:bg-gradient-to-r:hover { background-image: linear-gradient(to right, var(--tw-gradient-stops)); }
    .hover\\:from-blue-50:hover { --tw-gradient-from: #eff6ff; --tw-gradient-to: rgb(239 246 255 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
    .hover\\:to-indigo-50:hover { --tw-gradient-to: #eef2ff; }
    .hover\\:text-medical-primary:hover { color: #2b6cb0; }
    
    /* Gradient styles */
    .bg-gradient-to-r { background-image: linear-gradient(to right, var(--tw-gradient-stops)); }
    .from-medical-primary { --tw-gradient-from: #2b6cb0; --tw-gradient-to: rgb(43 108 176 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
    .to-medical-info { --tw-gradient-to: #3182ce; }
    .from-blue-50 { --tw-gradient-from: #eff6ff; --tw-gradient-to: rgb(239 246 255 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
    .to-indigo-50 { --tw-gradient-to: #eef2ff; }
    
    /* Additional colors */
    .text-slate-700 { color: #334155; }
    .shadow-lg { box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1); }
    
    /* Group hover effects */
    .group:hover .group-hover\\:scale-105 { transform: scale(1.05); }
    .group:hover .group-hover\\:text-medical-primary { color: #2b6cb0; }
    
    /* Transform and transition utilities */
    .transition-transform { transition-property: transform; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
    .transition-colors { transition-property: color, background-color, border-color, text-decoration-color, fill, stroke; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
    .cursor-pointer { cursor: pointer; }
    
    @media (min-width: 640px) {
      .sm\\:block { display: block; }
    }
    
    @media (min-width: 768px) {
      .md\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .md\\:flex { display: flex; }
    }
    
    @media (min-width: 1024px) {
      .lg\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
      .lg\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
      .lg\\:block { display: block; }
      .lg\\:hidden { display: none; }
    }
  `]
})
export class AppComponent {
  title = 'SmartCycleAI';
  isLoggedIn = false;
  selectedTenant = '';
  currentView = 'dashboard';
  mobileSidebarOpen = false;

  private tenants: Record<string, string> = {
    'sunshine-medical': 'Sunshine Medical Center',
    'riverside-health': 'Riverside Health System', 
    'metro-general': 'Metro General Hospital'
  };

  navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: 'home', badge: null },
    { id: 'worklist', name: 'Case Worklist', icon: 'clipboard', badge: '23' },
    { id: 'compliance-checker', name: 'Compliance Checker', icon: 'shield', badge: 'New' },
    { id: 'reporting', name: 'Analytics', icon: 'chart', badge: null },
    { id: 'ai-assistant', name: 'AI Assistant', icon: 'brain', badge: null },
    { id: 'batch-monitoring', name: 'Batch Monitoring', icon: 'activity', badge: null },
    { id: 'admin-panel', name: 'Admin Panel', icon: 'settings', badge: null }
  ];

  handleLogin(tenant: string) {
    this.selectedTenant = tenant;
    this.isLoggedIn = true;
  }

  handleLogout() {
    this.isLoggedIn = false;
    this.selectedTenant = '';
    this.currentView = 'dashboard';
    this.mobileSidebarOpen = false;
  }

  setCurrentView(view: string) {
    this.currentView = view;
  }

  toggleMobileSidebar() {
    this.mobileSidebarOpen = !this.mobileSidebarOpen;
  }

  getFacilityName(tenantId: string): string {
    return this.tenants[tenantId] || 'Healthcare Facility';
  }

  getCurrentPageName(): string {
    const currentPage = this.navigation.find(item => item.id === this.currentView);
    return currentPage?.name || 'Dashboard';
  }

  getIconPath(iconName: string): string {
    const iconPaths: Record<string, string> = {
      home: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
      clipboard: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
      shield: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
      chart: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      brain: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
      activity: 'M22 12h-4l-3 9L9 3l-3 9H2',
      settings: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z'
    };
    return iconPaths[iconName] || iconPaths['home'];
  }
} 