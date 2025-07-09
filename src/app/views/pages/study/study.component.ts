import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { NgSelectModule } from '@ng-select/ng-select';
import { ToastrService } from 'ngx-toastr';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-study',
  imports: [
    ReactiveFormsModule,
    NgSelectModule,
    ReactiveFormsModule,
    FormsModule,
    FormsModule,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule,
    MatFormFieldModule,
    CommonModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './study.component.html',
  styleUrl: './study.component.scss',
})
export class StudyComponent {
  searchQuery: string = '';
  statusFilter: string = '';
  showForm: boolean = false;
  filterFromDate: string = '';
  filterToDate: string = '';
  selectedDateRange: string = '';
  customFromDate: string = '';
  customToDate: string = '';
  range: FormGroup;
  suppliedProjects: Set<number> = new Set();



  newProject: any = {
    name: '',
    cost: '',
    client: '',
    offerNumber: '',
    consultantName: '',
    consultantPhone: '',
    financialModel: '',
    createdAt: new Date()
  };

  projects: any[] = [
  {
    name: 'مشروع محطة معالجة المياه',
    cost: 1500000,
    client: 'شركة النيل للمقاولات',
    offerNumber: '1',
    consultantName: 'م. أحمد سالم',
    consultantPhone: '01012345678',
    financialModelFile: null, // أو يمكن إضافة ملف وهمي لاحقًا
    extraDetails: 'المشروع يتضمن توسعة الشبكة وربط المحطة الجديدة بالشبكة القديمة.',
    createdAt: new Date(),
    extraFiles: [],
  }
];


  constructor(private fb: FormBuilder,private toastr: ToastrService){
    this.range = this.fb.group({
    start: [null],
    end: [null]
  });
  }

  saveProject() {
    const { name, cost, deliveryDate } = this.newProject;

  if (!name ) {
    this.toastr.warning('يرجى إدخال اسم المشروع', 'تنبيه');
    return;
  }

  if (!cost || cost <= 100) {
    this.toastr.warning(' يرجى إدخال تكلفة المشروع صحيحة', 'تنبيه');
    return;
  }

  if (!deliveryDate) {
    this.toastr.warning('يرجى إدخال تاريخ التسليم', 'تنبيه');
    return;
  }
    this.newProject.createdAt = new Date();
    this.newProject.offerNumber = (this.projects.length + 1).toString();

    this.projects.push({ ...this.newProject });
    this.toastr.success("تم انشاء دراسة مشروع بنجاح", 'دراسة مشروع ناجحة');
    this.newProject = {
      name: '',
      cost: '',
      client: '',
      offerNumber: '', // ← سيتم توليده تلقائيًا
      consultantName: '',
      consultantPhone: '',
      financialModelFile: null,
      extraFiles: [],
      extraDetails: '',
      deliveryDate: '' 
    };
    this.showForm = false;
  }

  filteredProjects(): any[] {
  const query = this.searchQuery.toLowerCase().trim();
  const { start, end } = this.range.value;

  return this.projects.filter(project => {
    // فلترة حسب التاريخ
    const created = new Date(project.createdAt).getTime();
    const inDateRange =
      (!start || !end) || (
        created >= new Date(start).getTime() &&
        created <= new Date(end).getTime()
      );

    // فلترة حسب النص
    const matchesQuery =
      !query ||
      project.name.toLowerCase().includes(query) ||
      (project.client && project.client.toLowerCase().includes(query));

    // فلترة حسب الحالة (إذا كنت تستخدم statusFilter)
    const matchesStatus =
      !this.statusFilter || project.status === this.statusFilter;

    return inDateRange && matchesQuery && matchesStatus;
  });
}


  applyDateFilter() {
    const { start, end } = this.range.value;
    this.filterFromDate = start ? start.toISOString() : '';
    this.filterToDate = end ? end.toISOString() : '';
  }
  onExtraFilesSelected(event: any) {
    const files = Array.from(event.target.files);
    this.newProject.extraFiles = files;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.newProject.financialModelFile = file;
    }
  }

  getFileUrl(file: File): string {
    return URL.createObjectURL(file);
  }

  viewProject(project: any) {
    project.supplyDate = new Date();
    this.suppliedProjects.add(project.offerNumber); // or project.id if you have one
    this.toastr.success(`تم انشاء امر التوريد لمشروع ${project.name} بنجاح`, 'أمر توريد ناجح');
  }
}
