import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

import { JobApplication } from '../../models/job-application';
import { JobApplicationService } from '../../services/job-application';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  applications: JobApplication[] = [];

  statusOptions = [
    'Applied',
    'Phone Screen',
    'Interview',
    'Second Interview',
    'Offer',
    'Rejected',
    'No Response',
  ];

  editingStatusId: number | null = null;
  showAddModal = false;
  selectedStatus = 'All';
  searchTerm = '';
  isSaving = false;
  updatingStatusId: number | null = null;

  newApplication: Omit<JobApplication, 'id' | 'userId'> = {
    companyName: '',
    position: '',
    status: 'Applied',
    dateApplied: new Date().toISOString().split('T')[0],
    notes: '',
  };

  userEmail = localStorage.getItem('email') ?? '';

  constructor(
    private jobService: JobApplicationService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadApplications();
  }

  loadApplications(): void {
    this.jobService.getApplications().subscribe({
      next: (data: JobApplication[]) => {
        this.applications = data.sort(
          (a, b) => new Date(b.dateApplied).getTime() - new Date(a.dateApplied).getTime(),
        );
        this.cdr.detectChanges();
      },
      error: (error: unknown) => {
        console.error(error);
      },
    });
  }

  addApplication(): void {
    this.isSaving = true;

    this.jobService.createApplication(this.newApplication).subscribe({
      next: () => {
        this.loadApplications();

        this.newApplication = {
          companyName: '',
          position: '',
          status: 'Applied',
          dateApplied: new Date().toISOString().split('T')[0],
          notes: '',
        };

        this.isSaving = false;
        this.showAddModal = false;
      },
      error: (error: unknown) => {
        this.isSaving = false;
        console.error(error);
      },
    });
  }

  deleteApplication(id: number): void {
    this.jobService.deleteApplication(id).subscribe({
      next: () => {
        this.applications = this.applications.filter((app) => app.id !== id);
        this.cdr.detectChanges();
      },
      error: (error: unknown) => {
        console.error(error);
      },
    });
  }

  updateStatus(application: JobApplication): void {
    this.updatingStatusId = application.id;

    this.jobService.updateApplication(application).subscribe({
      next: () => {
        this.updatingStatusId = null;
        this.editingStatusId = null;
        this.loadApplications();
      },
      error: (error: unknown) => {
        this.updatingStatusId = null;
        console.error(error);
        alert('Status update failed. Please try again.');
        this.loadApplications();
      },
    });
  }

  get filteredApplications(): JobApplication[] {
    let filtered = this.applications;

    if (this.selectedStatus !== 'All') {
      filtered = filtered.filter((app) => app.status === this.selectedStatus);
    }

    if (this.searchTerm.trim()) {
      filtered = filtered.filter((app) =>
        app.companyName.toLowerCase().includes(this.searchTerm.toLowerCase()),
      );
    }

    return filtered;
  }

  get appliedCount(): number {
    return this.applications.filter((app) => app.status === 'Applied').length;
  }

  get interviewCount(): number {
    return this.applications.filter(
      (app) =>
        app.status === 'Interview' ||
        app.status === 'Second Interview' ||
        app.status === 'Phone Screen',
    ).length;
  }

  get offerCount(): number {
    return this.applications.filter((app) => app.status === 'Offer').length;
  }

  get rejectedCount(): number {
    return this.applications.filter((app) => app.status === 'Rejected').length;
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Offer':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'Rejected':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'Interview':
      case 'Second Interview':
      case 'Phone Screen':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  }
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
