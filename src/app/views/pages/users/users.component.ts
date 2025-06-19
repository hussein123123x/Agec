import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IconDirective } from '@coreui/icons-angular';


import {
  CardComponent,
  CardBodyComponent,
  CardHeaderComponent,
  ModalComponent,
  AvatarComponent,
  BadgeComponent,
  RowComponent,
  ColComponent,
  WidgetStatCComponent,
  ModalHeaderComponent,
  ModalBodyComponent,
  ModalFooterComponent,
} from '@coreui/angular';



@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    IconDirective,  
    CommonModule,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    ReactiveFormsModule,
    RowComponent,
    ColComponent,
    BadgeComponent,
    AvatarComponent,
    WidgetStatCComponent,
    ModalComponent,
    ModalHeaderComponent,
    ModalBodyComponent,
    ModalFooterComponent,
  ],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent {
  // ✅ بيانات الموظفين التجريبية
  employees = [
    {
      name: 'أحمد علي',
      image: 'assets/images/avatars/1.jpg',
      code: 'EMP001',
      department: 'الإنتاج',
      jobTitle: 'مشرف',
      hireDate: '2022-01-10',
      status: 'نشط',
      email: 'G5V9o@example.com',
      phone: '0123456789',
      age: 25,
      address: 'القاهرة',
      salary: 12000,           // الراتب
      kpi: 88,                 // مؤشر الأداء
      absenceDays: 2,         // عدد أيام الغياب
      takingMoney: 300,
      notes: 'العامل ده بيتأخر دايمًا في تسليم الشغل ومش ملتزم بالميعاد، وكمان تركيزه ضعيف وبيحتاج حد يتابعه باستمرار، ده غير إنه مش بيحس بالمسؤولية وده بيأثر على الفريق كله'
    },
    {
      name: 'منى صالح',
      image: 'assets/images/avatars/2.jpg',
      code: 'EMP002',
      department: 'المحاسبة',
      jobTitle: 'محاسب أول',
      hireDate: '2021-08-22',
      status: 'موقوف',
      email: 'G5V9o@example.com',
      phone: '0123456789',
      age: 25,
      address: 'القاهرة',
      salary: 10500,
    kpi: 75,
    absenceDays: 5
    },
    {
      name: 'أحمد علي',
      image: 'assets/images/avatars/3.jpg',
      code: 'EMP003',
      department: 'الإنتاج',
      jobTitle: 'مشرف',
      hireDate: '2022-01-10',
      status: 'نشط',
      email: 'G5V9o@example.com',
      phone: '0123456789',
      age: 25,
      address: 'القاهرة',
      salary: 12000,           // الراتب
    kpi: 88,                 // مؤشر الأداء
    absenceDays: 2           // عدد أيام الغياب

    },
    {
      name: 'منى صالح',
      image: 'assets/images/avatars/7.jpg',
      code: 'EMP004',
      department: 'المحاسبة',
      jobTitle: 'محاسب أول',
      hireDate: '2021-08-22',
      status: 'موقوف',
      email: 'G5V9o@example.com',
      phone: '0123456789',
      age: 25,
      address: 'القاهرة',
      salary: 10500,
    kpi: 75,
    absenceDays: 5
    },
    {
      name: 'أحمد علي',
      image: 'assets/images/avatars/5.jpg',
      code: 'EMP005',
      department: 'الإنتاج',
      jobTitle: 'مشرف',
      hireDate: '2022-01-10',
      status: 'نشط',
      email: 'G5V9o@example.com',
      phone: '0123456789',
      age: 25,
      address: 'القاهرة',
      salary: 12000,           // الراتب
    kpi: 88,                 // مؤشر الأداء
    absenceDays: 2           // عدد أيام الغياب

    },
    {
      name: 'منى صالح',
      image: 'assets/images/avatars/6.jpg',
      code: 'EMP006',
      department: 'المحاسبة',
      jobTitle: 'محاسب أول',
      hireDate: '2021-08-22',
      status: 'موقوف',
      email: 'G5V9o@example.com',
      phone: '0123456789',
      age: 25,
      address: 'القاهرة',
      salary: 10500,
    kpi: 75,
    absenceDays: 5
    }
  ];

  // ✅ حالة عرض النافذة المنبثقة
  showModal = signal(false);
  selectedEmployee: any = null;


  // ✅ النموذج الخاص بالموظف
  employeeForm: FormGroup;
  editMode: boolean = false;

  constructor(private fb: FormBuilder) {
    this.employeeForm = this.fb.group({
      name: ['', Validators.required],
      email: [''],
      phone: [''],
      code: ['', Validators.required],
      department: [''],
      jobTitle: [''],
      status: ['نشط'],
      salary: [0],
      kpi: [0],
      absenceDays: [0],
      address: ['']
    });
  }

  showDetails(employee: any) {
    this.selectedEmployee = employee;
    this.showModal.set(true); // عرض النافذة المنبثقة
  }

  closeModal() {
    this.showModal.set(false);
    this.selectedEmployee = null;
  }

  // ✅ فتح النموذج
  openForm() {
    this.employeeForm.reset({
      status: 'نشط'
    });
    this.showModal.set(true);
  }

  // ✅ حفظ البيانات (بشكل مبدئي فقط)
  save() {
    if (this.employeeForm.valid) {
      const newEmployee = this.employeeForm.value;
      newEmployee.image = 'assets/images/avatars/default.jpg'; // صورة افتراضية
      newEmployee.hireDate = new Date().toISOString().slice(0, 10);
      this.employees.push(newEmployee);
      this.showModal.set(false);
    }
  }

  editEmployee(employee: any) {
    this.editMode = true;
    this.employeeForm.patchValue(employee);
    this.showModal.set(true);
  }

  deleteEmployee(employee: any) {
    this.employees = this.employees.filter(e => e !== employee);
  }
}
