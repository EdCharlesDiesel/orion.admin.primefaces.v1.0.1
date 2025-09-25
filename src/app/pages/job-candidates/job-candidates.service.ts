import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JobCandidate } from '../../core/models/job-candidate.model';


@Injectable({
  providedIn: 'root'
})
export class JobCandidatesService {
  private apiUrl = 'http://localhost:9010/api/JobCandidate';

  constructor(private http: HttpClient) {}//localhost:9010/
  //TODO: Need to fix Not recommended hence I need to start using Guid to begin with.
  private tempId = 100;
  createJobCandidate(data: JobCandidate): Observable<JobCandidate> {
    data.businessEntityID = ++this.tempId; // negative IDs as temp placeholders
    return this.http.post<JobCandidate>(this.apiUrl, data);
  }
  getJobCandidate(): Observable<JobCandidate[]> {
    return this.http.get<JobCandidate[]>(this.apiUrl);
  }

  getJobCandidateById(id: number): Observable<JobCandidate> {
    return this.http.get<JobCandidate>(`${this.apiUrl}/${id}`);
  }


  updateJobCandidate(id: number, data: JobCandidate): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, data);
  }

  deleteJobCandidate(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
