import { catchError, Observable, of, shareReplay, tap } from 'rxjs';
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpErrorService } from '../../shared/http-error.service';
import { Result } from 'postcss';
import { map } from 'rxjs/operators';
import { Department } from '../../core/models/department.model';

@Injectable({
    providedIn: 'root'
})
export class DepartmentsService {
    private apiUrl = 'http://localhost:9100/api/Department';
    private tempId = 17;
    private http = inject(HttpClient);
    private errorService = inject(HttpErrorService);

    public departmentsResult$ = this.http.get<Department[]>(this.apiUrl).pipe(
        map((p) => ({ data: p }) as unknown as Result<Department[]>),
        tap((p) => console.log(JSON.stringify(p))),
        shareReplay(1),
        catchError((err: any) =>
            of({
                data: [],
                error: this.errorService.formatError(err)
            } as unknown as Result<Department[]>)
        )
    );

    public createDepartment(info: Department): Observable<Department> {
        this.tempId += 1;
        info.DepartmentID = this.tempId; // increments each call
        return this.http.post<Department>(this.apiUrl, info);
    }
    public getDepartments(): Observable<Department[]> {
        return this.http.get<Department[]>(this.apiUrl);
    }

    public getDepartmentById(id: number): Observable<Department> {
        return this.http.get<Department>(`${this.apiUrl}/${id}`);
    }
    public updateDepartment(id: number, payload: any): Observable<Department> {
        return this.http.put<Department>(`${this.apiUrl}/${id}`, payload);
    }

    public deleteDepartment(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
