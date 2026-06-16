import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JobApplication } from '../models/job-application';

@Injectable({
  providedIn: 'root',
})
export class JobApplicationService {
  private apiUrl = 'http://localhost:5258/api/JobApplications';

  constructor(private http: HttpClient) {}

  getApplications(): Observable<JobApplication[]> {
    return this.http.get<JobApplication[]>(this.apiUrl);
  }

  createApplication(application: Omit<JobApplication, 'id'>): Observable<JobApplication> {
    return this.http.post<JobApplication>(this.apiUrl, application);
  }

  deleteApplication(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  updateApplication(application: JobApplication): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${application.id}`, application);
  }
}
