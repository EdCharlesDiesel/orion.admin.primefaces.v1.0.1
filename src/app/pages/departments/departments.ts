import { Component, OnInit, signal, ViewChild } from '@angular/core';
import {  ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CommonModule, CurrencyPipe, NgIf } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';
import { Toolbar } from 'primeng/toolbar';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DepartmentsService } from './departments.service';
import { tap } from 'rxjs';
import { DatePickerModule } from 'primeng/datepicker';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SelectButtonModule } from 'primeng/selectbutton';
import { InputGroupModule } from 'primeng/inputgroup';
import { FluidModule } from 'primeng/fluid';
import { FloatLabelModule } from 'primeng/floatlabel';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { InputNumberModule } from 'primeng/inputnumber';
import { SliderModule } from 'primeng/slider';
import { RatingModule } from 'primeng/rating';
import { ColorPickerModule } from 'primeng/colorpicker';
import { KnobModule } from 'primeng/knob';
import { SelectModule } from 'primeng/select';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TreeSelectModule } from 'primeng/treeselect';
import { MultiSelectModule } from 'primeng/multiselect';
import { ListboxModule } from 'primeng/listbox';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { TextareaModule } from 'primeng/textarea';
import { Department } from '../../core/models/department.model';

interface Column {
    field: string;
    header: string;
    customExportHeader?: string;
}

interface ExportColumn {
    title: string;
    dataKey: string;
}

@Component({
    selector: 'app-departments',
    standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    ButtonModule,
    CheckboxModule,
    RadioButtonModule,
    SelectButtonModule,
    InputGroupModule,
    FluidModule,
    IconFieldModule,
    InputIconModule,
    FloatLabelModule,
    AutoCompleteModule,
    InputNumberModule,
    SliderModule,
    RatingModule,
    ColorPickerModule,
    KnobModule,
    SelectModule,
    DatePickerModule,
    ToggleButtonModule,
    ToggleSwitchModule,
    TreeSelectModule,
    MultiSelectModule,
    ListboxModule,
    InputGroupAddonModule,
    TextareaModule,
    Toolbar,
    TableModule,
    ConfirmDialogModule,
    DialogModule
  ],
    templateUrl: 'departments.html',
    providers: [MessageService, DepartmentsService, ConfirmationService]
})
export class Departments implements OnInit {
    departmentDialog: boolean = false;

    departments = signal<Department[]>([]);

    department!: Department;

    selectedDepartments!: Department[] | null;

    submitted: boolean = false;

    statuses!: any[];

    @ViewChild('dt') dt!: Table;

    exportColumns!: ExportColumn[];

    cols!: Column[];

    constructor(
        private departmentService: DepartmentsService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    exportCSV() {
        this.dt.exportCSV();
    }

    ngOnInit() {
        this.loadDemoData();
    }

    loadDemoData() {
        this.departmentService.getDepartments().pipe(
            tap((p) => console.log(JSON.stringify(p))),
        ).subscribe((data) => {
            this.departments.set(data);

        //
        // this.departmentService.getDepartments().then((data) => {
        //     this.departments.set(data);
        // });

        // this.departmentService.departmentsResult$.subscribe(
        //     (data: any) => {
        //         this.departments.set(data);
             }
        );

        this.statuses = [
            { label: 'INSTOCK', value: 'instock' },
            { label: 'LOWSTOCK', value: 'lowstock' },
            { label: 'OUTOFSTOCK', value: 'outofstock' }
        ];

        this.cols = [
            { field: 'Department ID', header: 'Code', customExportHeader: 'Department Code' },
            { field: 'Name', header: 'Name' },
            { field: 'GroupName', header: 'Group Name' },
            { field: 'ModifiedDate', header: 'Modified Date' },
        ];

        this.exportColumns = this.cols.map((col) => ({ title: col.header, dataKey: col.field }));
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    public openNew() {
        this.department = {
            DepartmentID : 0,
            Name : "",
            GroupName :"",
            ModifiedDate: new Date()
        };
        this.submitted = false;
        this.departmentDialog = true;
    }

    public editDepartment(department: Department) {
        this.department = { ...department };
        this.departmentDialog = true;
    }

    public deleteSelectedDepartments() {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete the selected departments?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.departments.set(this.departments().filter((val) => !this.selectedDepartments?.includes(val)));
                this.selectedDepartments = null;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Departments Deleted',
                    life: 3000
                });
            }
        });
    }

    public hideDialog() {
        this.departmentDialog = false;
        this.submitted = false;
    }

    public deleteDepartment(department: Department) {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete ' + department.Name + '?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.departments.set(this.departments().filter((val) => val.DepartmentID !== department.DepartmentID));
                this.department = {
                    DepartmentID : 0,
                    Name : "",
                    GroupName :"",
                    ModifiedDate: new Date(),
                };
                this.messageService.add({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Department Deleted',
                    life: 3000
                });
            }
        });
    }

    private findIndexById(id: number): number {
        let index = -1;
        for (let i = 0; i < this.departments().length; i++) {
            if (this.departments()[i].DepartmentID === id) {
                index = i;
                break;
            }
        }

        return index;
    }

    private createId(): number {
        let id = 17;
        return ++id;
    }

    public getSeverity(status: string) {
        switch (status) {
            case 'INSTOCK':
                return 'success';
            case 'LOWSTOCK':
                return 'warn';
            case 'OUTOFSTOCK':
                return 'danger';
            default:
                return 'info';
        }
    }

    public saveDepartment() {
        this.submitted = true;
        let _departments = this.departments();
        if (this.department.Name?.trim()) {
            if (this.department.DepartmentID) {
                _departments[this.findIndexById(this.department.DepartmentID)] = this.department;
                this.departments.set([..._departments]);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Department Updated',
                    life: 3000
                });
            } else {
                this.department.DepartmentID = this.createId();
                this.messageService.add({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Department Created',
                    life: 3000
                });
                this.departments.set([..._departments, this.department]);
            }

            this.departmentDialog = false;
            this.department = {
                DepartmentID : 0,
                Name : "",
                GroupName :"",
                ModifiedDate: new Date(),
            };
        }
    }
}

