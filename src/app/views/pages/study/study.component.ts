import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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
import {StudyService} from './study.service'
import { UserService } from 'src/app/core/services/users.service';

@Component({
  selector: 'app-study',
  imports: [
    ReactiveFormsModule,
    NgSelectModule,
    ReactiveFormsModule,
    FormsModule,
    MatInputModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    CommonModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './study.component.html',
  styleUrl: './study.component.scss',
})
export class StudyComponent implements OnInit {
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
  selectedProject: any = null;
  objectKeys = Object.keys;

  editingProject: any = null;
  newProject: any = {
    projectName: '',
    projectCost: '',
    client: '',
    projectNumber: '',
    consultantName: '',
    consultantPhone: '',
    studyEngineerName: '',
    productEngineerName: '',
    deliveryDate: '',
    extraDetails: '',
    financialModelFile: null,
    extraFiles: []
  };

  savedProject:any
  projects: any;
  username: string = '';
  userEmail: string = '';

  projectNumber: string = '';



  constructor(private fb: FormBuilder,private toastr: ToastrService, private studyService: StudyService, private userService: UserService) {
    this.range = this.fb.group({
    start: [null],
    end: [null]
  });
  }

  ngOnInit(): void {
    const profileString = localStorage.getItem('profile');
    if (profileString) {
      const profile = JSON.parse(profileString);
      this.username = profile.fullNameArabic;
      this.userEmail = profile.agecAccount;
    }

    this.loadProjects();
  }

  async loadProjects(){
    this.projects = await this.studyService.getStudy()
    this.generateProjectNumber();

    console.log("🚀 ~ StudyComponent ~ loadProjects ~ this.projects:", this.projects)
  }

  generateProjectNumber() {
    const year = new Date().getFullYear(); // 2025
    const nextIndex = this.projects.length + 1; // رقم المشروع التالي

    return this.projectNumber = `${year}-P-${nextIndex}`;
  }
  

 async saveProject() {
    console.log("🚀 ~ StudyComponent ~ saveProject ~ this.newProject:", this.newProject)

  if (!this.newProject.projectName) {
    this.toastr.warning('يرجى إدخال اسم المشروع', 'تنبيه');
    return;
  }

  if (!this.newProject.projectCost || this.newProject.projectCost <= 100) {
    this.toastr.warning('يرجى إدخال تكلفة المشروع صحيحة', 'تنبيه');
    return;
  }

  if (!this.newProject.deliveryDate) {
    this.toastr.warning('يرجى إدخال تاريخ التسليم', 'تنبيه');
    return;
  }

  try {
    let savedProject: any;

    if (this.editingProject) {
      // تعديل مشروع موجود
      if (this.newProject.financialModelFile || this.newProject.extraFiles.length) {
        // رفع الملفات + تعديل المشروع
        const formData = this.buildFormData(this.newProject);
        savedProject = await this.studyService.uploadStudyFiles(formData);

      } else {
        savedProject = await this.studyService.updateStudy(this.editingProject.id, this.newProject, this.username);
      }

      const index = this.projects.findIndex((p: any) => p.id === this.editingProject.id);
      this.projects[index] = { ...savedProject };
      this.toastr.success('تم تحديث المشروع بنجاح', 'تعديل ناجح');
    } else {
      // إنشاء مشروع جديد
      this.newProject.createdAt = new Date();
      this.newProject.projectNumber = this.generateProjectNumber();

      if (this.newProject.financialModelFile || this.newProject.extraFiles.length) {
        // رفع الملفات + إنشاء المشروع
        console.log("🚀 ~ StudyComponent ~ saveProject ~ this.newProject:", this.newProject)
        const formData:any = this.buildFormData(this.newProject);

        savedProject = await this.studyService.uploadStudyFiles(formData);
        console.log("🚀 ~ StudyComponent ~ saveProject ~ savedProject:", savedProject)

      } else {
        savedProject = await this.studyService.createStudy(this.newProject);
      }

      this.projects.push(savedProject);
      this.toastr.success('تم انشاء دراسة مشروع بنجاح', 'دراسة مشروع ناجحة');
    }

    // إعادة ضبط الفورم
    this.newProject = {
      projectName: '',
      projectCost: '',
      client: '',
      projectNumber: '',
      consultantName: '',
      consultantPhone: '',
      studyEngineerName: '',
      productEngineerName: '',
      deliveryDate: '',
      extraDetails: '',
      financialModelFile: null,
      extraFiles: []
    };
    this.editingProject = null;
    this.showForm = false;
  } catch (err) {
    console.error(err);
    this.toastr.error('حدث خطأ أثناء حفظ المشروع', 'خطأ');
  }
}


  buildFormData(data: any) {
    const formData = new FormData();

    formData.append('projectName', data.projectName);
    formData.append('projectCost', data.projectCost);
    formData.append('client', data.client);
    formData.append('projectNumber', data.projectNumber);
    formData.append('consultantName', data.consultantName);
    formData.append('consultantPhone', data.consultantPhone);
    formData.append('studyEngineerName', data.studyEngineerName);
    formData.append('productEngineerName', data.productEngineerName);
    formData.append('deliveryDate', data.deliveryDate);
    formData.append('extraDetails', data.extraDetails);
    formData.append('history', JSON.stringify(data.history || []));

    if (data.financialModelFile) {
      formData.append('financialModelFile', data.financialModelFile);
    }

    if (data.extraFiles?.length) {
      data.extraFiles.forEach((file: File) => {
        formData.append('extraFiles', file);
      });
    }

    return formData;
  }




  filteredProjects(): any[] {
  const query = this.searchQuery.toLowerCase().trim();
  const { start, end } = this.range.value;

  return this.projects?.filter((project:any) => {
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

  openFolder() {
    if (this.selectedProject?.folderUrl) {
      window.open(this.selectedProject.folderUrl, '_blank');
    }
  }

  openProject(project:any){
    this.selectedProject = project;
  }
  editProject(project:any){
    this.editingProject = project;          // نحدد المشروع الجاري تعديله
    this.newProject = { ...project };       // نملأ الفورم بالبيانات
    this.showForm = true;                   
  }

  applyDateFilter() {
    const { start, end } = this.range.value;
    this.filterFromDate = start ? start.toISOString() : '';
    this.filterToDate = end ? end.toISOString() : '';
  }
  onExtraFilesSelected(event: any) {
    const files: any = Array.from(event.target.files);
    files.forEach((file:any) => {
      file.previewUrl = URL.createObjectURL(file); // store blob URL
    });
    this.newProject.extraFiles = files;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      file.previewUrl = URL.createObjectURL(file); // store the blob URL
      this.newProject.financialModelFile = file;
    }
  }

  clearFiles() {
    if (this.newProject.financialModelFile?.previewUrl) {
      URL.revokeObjectURL(this.newProject.financialModelFile.previewUrl);
    }
    this.newProject.extraFiles.forEach((file:any) => URL.revokeObjectURL(file.previewUrl));
    this.newProject.financialModelFile = null;
    this.newProject.extraFiles = [];
  }

  getFileUrl(file: File): string {
    return URL.createObjectURL(file);
  }

  async convertToReady(project: any) {
  console.log("🚀 ~ StudyComponent ~ convertToReady ~ project:", project)

    project.supplyDate = new Date();
    this.suppliedProjects.add(project.offerNumber); // or project.id if you have one
    
    const notifyData:any = { email: this.userEmail, notifications: [{title: "أمر توريد جديد", message: "يوجد امر توريد جديد ", isRead: false, createdAt: new Date()}]}
    await this.userService.updateUser(notifyData)

    await this.studyService.createProject(project)
    this.toastr.success(`تم انشاء امر التوريد لمشروع ${project.projectName} بنجاح`, 'أمر توريد ناجح');
  }
}
