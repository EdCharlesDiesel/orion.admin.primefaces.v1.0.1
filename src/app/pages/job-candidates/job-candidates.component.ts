import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import {JobCandidatesService} from "./job-candidates.service";
import { JobCandidate } from '../../core/models/job-candidate.model';


@Component({
  selector: 'app-job-candidates',
  templateUrl: './job-candidates.component.html',
  styleUrls: ['./job-candidates.component.scss'],
  providers: [MessageService]})
export class JobCandidatesComponent implements OnInit {
  systemInfoList: JobCandidate[] = [];
  selectedSystemInfo!: JobCandidate | null;
  displayDialog: boolean = false;
  systemInfoForm!: FormGroup;
  editing: boolean = false;
  loading: boolean = false;
  cols: any[] = [];

  constructor(
    private fb: FormBuilder,
    private service: JobCandidatesService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.cols = [
      { field: 'JobCandidateID', header: 'ID' },
      { field: 'postTime', header: 'Post Time' },
      { field: 'databaseUser', header: 'Database User' },
      { field: 'event', header: 'Event' },
      { field: 'schema', header: 'Schema' },
      { field: 'object', header: 'Object' },
      { field: 'tsql', header: 'TSQL' },
      { field: 'xmlEvent', header: 'XML Event' }
    ];

    this.systemInfoForm = this.fb.group({
      postTime: [new Date().toISOString(), Validators.required],
      databaseUser: ['', Validators.required],
      event: ['', Validators.required],
      schema: [''],
      object: [''],
      tsql: [''],
      xmlEvent: ['']
    });

    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.service.getJobCandidate().subscribe({
      next: data => {
        this.systemInfoList = data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  refresh() {
    this.loadData();
  }

  openNew() {
    this.systemInfoForm.reset({
      postTime: new Date().toISOString() // reset with current time
    });
    this.displayDialog = true;
    this.editing = false;
    this.selectedSystemInfo = null;
  }

  editSystemInfo(systemInfo: JobCandidate) {
    this.systemInfoForm.patchValue(systemInfo);
    this.selectedSystemInfo = systemInfo;
    this.displayDialog = true;
    this.editing = true;
  }

  saveSystemInfo() {
    if (this.systemInfoForm.invalid) return;

    const formValue = this.systemInfoForm.value;

    if (this.editing && this.selectedSystemInfo && this.selectedSystemInfo.businessEntityID) {
      // Update existing log
      this.service.updateJobCandidate(this.selectedSystemInfo.businessEntityID, formValue).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Log updated successfully' });
          this.loadData();
          this.hideDialog();
        },
        error: (err) => {
          console.error(err);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update log' });
        }
      });
    } else {
      // Create new log
      this.service.createJobCandidate(formValue).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Created', detail: 'Log added successfully' });
          this.loadData();
          this.hideDialog();
        },
        error: (err) => {
          console.error(err);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create log' });
        }
      });
    }
  }

  deleteSystemInfo(systemInfo: JobCandidate) {
    if (!systemInfo.businessEntityID) return;
    this.service.deleteJobCandidate(systemInfo.businessEntityID).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Log deleted successfully' });
        this.loadData();
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete log' });
      }
    });
  }

  hideDialog() {
    this.displayDialog = false;
    this.selectedSystemInfo = null;
  }

  onRowSelect(event: any) {
    this.selectedSystemInfo = event.data;
    this.displayDialog = true;
  }
}
