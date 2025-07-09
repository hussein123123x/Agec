import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IconDirective } from '@coreui/icons-angular';
import { NgSelectModule } from '@ng-select/ng-select';



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
import { ToastrService } from 'ngx-toastr';



@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    IconDirective,  
    CommonModule,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    RowComponent,
    ColComponent,
    BadgeComponent,
    AvatarComponent,
    WidgetStatCComponent,
    ModalComponent,
    ModalHeaderComponent,
    ModalBodyComponent,
    ModalFooterComponent,
    NgSelectModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent {
  activeTab: string = 'employees';
  vacationForm: FormGroup;
  selectedEmployees: number[] = [];
  showVacationForm: boolean = false;

  // تخزين الإجازات المضافة
  officialVacations: any[] = [];

  // ✅ بيانات الموظفين التجريبية
  employees = [
    {
      id: 1,
      name: ' علي',
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
      id: 2,
      name: ' صالح',
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
      id: 3,
      name: 'أحمد ',
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
      id: 4,
      name: 'منى ',
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
      id: 5,
      name: 'فتحى',
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
      id: 6,
      name: 'ابراهيم ',
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

  applicants = [
    { name: 'أحمد جمال', email: 'ahmed@example.com', phone: '01012345678', qualification: 'بكالوريوس تجارة', notes: 'تمت المقابلة ولم يتم القبول' },
    { name: 'سارة علي', email: 'sara@example.com', phone: '01198765432', qualification: 'دبلوم صناعي', notes: 'غير مناسبة للوظيفة الحالية' }
  ];

  // ✅ حالة عرض النافذة المنبثقة
  showModal = signal(false);
  selectedEmployee: any = null;

  // ✅ النموذج الخاص بالموظف
  employeeForm: FormGroup;
  editMode: boolean = false;

  constructor(private fb: FormBuilder, private toastr: ToastrService) {
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

    this.vacationForm = this.fb.group({
      fromDate: [''],
      toDate: [''],
      selectedEmployees: [[]],
      reason: [''],        // سبب الإجازة
      details: ['']   
    });

    this.officialVacations = [
        {
          fromDate: '2025-07-20',
          toDate: '2025-07-23',
          reason: 'عطلة عيد الأضحى',
          details: 'إجازة رسمية بمناسبة عيد الأضحى المبارك وفقًا للتقويم الحكومي',
          isAllSelected: true,
          employees: [
            { id: 1, name: 'علي', daysRemaining: 14 },
            { id: 2, name: 'صالح', daysRemaining: 3 },
            { id: 3, name: 'أحمد', daysRemaining: 4 },
            { id: 4, name: 'منى', daysRemaining: 2 },
            { id: 5, name: 'فتحى', daysRemaining: 1 },
            { id: 6, name: 'ابراهيم', daysRemaining: 5 } 
          ]
        }
    ];

  }

  assignOfficialVacation() {
  const data = this.vacationForm.value;
  const fromDate = data.fromDate;
  const toDate = data.toDate;
  const daysRequested = this.getDateDiffInDays(fromDate, toDate);

  const selectedIds = data.selectedEmployees.includes('all')
    ? this.employees.map((e: any) => e.id)
    : data.selectedEmployees;

  const selectedEmployees = this.employees.filter(emp => selectedIds.includes(emp.id));

  // تحقق من كل موظف
  for (const emp of selectedEmployees) {
    const found = this.officialVacations[0]?.employees.find((e: any) => e.id === emp.id);
    const daysRemaining = found?.daysRemaining ?? 0;

    if (daysRemaining < daysRequested) {
      this.toastr.error(
        `الموظف ${emp.name} ايام متبقية  ${daysRemaining} يومًا ولا يمكنه أخذ ${daysRequested} أيام.`,
        'رصيد غير كافٍ'
      );
      return; // إلغاء التسجيل
    }
  }

  // إذا مرّ التحقق، أضف الإجازة
  this.officialVacations.push({
    fromDate,
    toDate,
    reason: data.reason,
    details: data.details,
    isAllSelected: data.selectedEmployees.includes('all'),
    employees: selectedEmployees
  });

  this.toastr.success('تم تسجيل الإجازة بنجاح', 'نجاح');
  this.vacationForm.reset();
  this.selectedEmployees = [];
  this.showVacationForm = false;
}



  toggleEmployee(id: number): void {
  const index = this.selectedEmployees.indexOf(id);
  if (index === -1) {
    this.selectedEmployees.push(id);
  } else {
    this.selectedEmployees.splice(index, 1);
  }

  // تحديث قيمة الفورم
  this.vacationForm.get('selectedEmployees')?.setValue(this.selectedEmployees);
}

getDateDiffInDays(from: string, to: string): number {
  const fromDate = new Date(from);
  const toDate = new Date(to);
  const diffInMs = Math.abs(toDate.getTime() - fromDate.getTime());
  return Math.ceil(diffInMs / (1000 * 60 * 60 * 24)) + 1;
}

selectAllEmployees(): void {
  this.selectedEmployees = this.employees.map(e => e.id);
  this.vacationForm.get('selectedEmployees')?.setValue(this.selectedEmployees);
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
