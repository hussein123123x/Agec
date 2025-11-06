import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IconDirective } from '@coreui/icons-angular';
import { NgSelectModule } from '@ng-select/ng-select';
import moment from 'moment-timezone';



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
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { Router } from '@angular/router';
import {UserService} from '../../../../../src/app/core/services/users.service'



@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    IconDirective,  
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    RowComponent,
    ColComponent,
    AvatarComponent,
    WidgetStatCComponent,
    ModalComponent,
    ModalHeaderComponent,
    ModalBodyComponent,
    ModalFooterComponent,
    NgSelectModule,
    FormsModule,
    MatNativeDateModule,
    CommonModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
  ],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  activeTab: string = 'employees';
  vacationForm: FormGroup;
  searchTerm: string = '';
  showExportPopup = false;
  popupPosition = { top: 0, left: 0 };

  showTable: boolean = false;
  filteredEmployees: any[] = [];
  selectedEmployees: number[] = [];
  showVacationForm: boolean = false;
  range: FormGroup;
  // تخزين الإجازات المضافة
  officialVacations: any[] = [];
  totalEmployees = 0;
  
  presentEmployees = 0;
  absentEmployees = 0; // null means "not loaded yet"
  departmentsCount = 0;
  dataLoaded = false; // initially false


  tabs = [
    { key: 'employees', label: 'الموظفون' },
    { key: 'vacations', label: 'الأجازات' },
    { key: 'additional', label: 'الاضافى' },
    { key: 'penalties', label: 'الجزائات' },
    { key: 'applicants', label: 'الارشيف' }
  ];

  // ✅ بيانات الموظفين التجريبية
  // employees = [
  //   {
  //     id: 1,
  //     name: 'احمد محمد علي',
  //     image: 'assets/images/avatars/1.jpg',
  //     code: 'EMP001',
  //     department: 'الإنتاج',
  //     jobTitle: 'مشرف',
  //     hireDate: '2022-01-10',
  //     status: 'نشط',
  //     email: 'G5V9o@example.com',
  //     phone: '0123456789',
  //     age: 25,
  //     address: 'القاهرة',
  //     salary: 12000,           // الراتب
  //     kpi: 88,                 // مؤشر الأداء
  //     absenceDays: 2,         // عدد أيام الغياب
  //     takingMoney: 300,
  //     notes: 'العامل ده بيتأخر دايمًا في تسليم الشغل ومش ملتزم بالميعاد، وكمان تركيزه ضعيف وبيحتاج حد يتابعه باستمرار، ده غير إنه مش بيحس بالمسؤولية وده بيأثر على الفريق كله'
  //   },
  //   {
  //     id: 2,
  //     name: ' صالح عوض محمدى',
  //     image: 'assets/images/avatars/2.jpg',
  //     code: 'EMP002',
  //     department: 'المحاسبة',
  //     jobTitle: 'محاسب أول',
  //     hireDate: '2021-08-22',
  //     status: 'موقوف',
  //     email: 'G5V9o@example.com',
  //     phone: '0123456789',
  //     age: 25,
  //     address: 'القاهرة',
  //     salary: 10500,
  //   kpi: 75,
  //   absenceDays: 5
  //   },
  //   {
  //     id: 3,
  //     name: ' ابراهيم السيد أحمد ',
  //     image: 'assets/images/avatars/3.jpg',
  //     code: 'EMP003',
  //     department: 'الإنتاج',
  //     jobTitle: 'مشرف',
  //     hireDate: '2022-01-10',
  //     status: 'نشط',
  //     email: 'G5V9o@example.com',
  //     phone: '0123456789',
  //     age: 25,
  //     address: 'الاسكندرية',
  //     salary: 12000,           // الراتب
  //   kpi: 88,                 // مؤشر الأداء
  //   absenceDays: 2           // عدد أيام الغياب

  //   },
  //   {
  //     id: 4,
  //     name: 'مصطفى نصرالدين ',
  //     image: 'assets/images/avatars/7.jpg',
  //     code: 'EMP004',
  //     department: 'المحاسبة',
  //     jobTitle: 'محاسب أول',
  //     hireDate: '2021-08-22',
  //     status: 'موقوف',
  //     email: 'G5V9o@example.com',
  //     phone: '0123456789',
  //     age: 25,
  //     address: 'الاسكندرية',
  //     salary: 10500,
  //   kpi: 75,
  //   absenceDays: 5
  //   },
  //   {
  //     id: 5,
  //     name: 'فتحى باهر الحدادى',
  //     image: 'assets/images/avatars/5.jpg',
  //     code: 'EMP005',
  //     department: 'الإنتاج',
  //     jobTitle: 'مشرف',
  //     hireDate: '2022-01-10',
  //     status: 'نشط',
  //     email: 'G5V9o@example.com',
  //     phone: '0123456789',
  //     age: 25,
  //     address: 'القاهرة',
  //     salary: 12000,           // الراتب
  //     kpi: 88,                 // مؤشر الأداء
  //     absenceDays: 2           // عدد أيام الغياب

  //   },
  //   {
  //     id: 6,
  //     name: 'ابراهيم خلف جاد الله',
  //     image: 'assets/images/avatars/6.jpg',
  //     code: 'EMP006',
  //     department: 'المحاسبة',
  //     jobTitle: 'محاسب أول',
  //     hireDate: '2021-08-22',
  //     status: 'موقوف',
  //     email: 'G5V9o@example.com',
  //     phone: '0123456789',
  //     age: 25,
  //     address: 'القاهرة',
  //     salary: 10500,
  //   kpi: 75,
  //   absenceDays: 5
  //   }
  // ];

  employees: any
  users: any

  applicants = [
    { name: 'أحمد جمال', email: 'ahmed@example.com', phone: '01012345678', qualification: 'بكالوريوس تجارة', isPreviousEmployee: true,  notes: 'تمت المقابلة ولم يتم القبول' },
    { name: 'سارة علي', email: 'sara@example.com', phone: '01198765432', qualification: 'دبلوم صناعي', isPreviousEmployee: false,  notes: 'غير مناسبة للوظيفة الحالية' }
  ];

  // ✅ حالة عرض النافذة المنبثقة
  showModal = signal(false);
  selectedEmployee: any = null;

  // ✅ النموذج الخاص بالموظف
  employeeForm: FormGroup;
  editMode: boolean = false;

  constructor(private fb: FormBuilder, private toastr: ToastrService, private router: Router, private userService: UserService) {
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

    this.range = this.fb.group({
      start: [null],
      end: [null]
    });

    this.vacationForm = this.fb.group({
      fromDate: [''],
      toDate: [''],
      selectedEmployees: [[]],
      reason: [''],        // سبب الإجازة
      details: [''],
      type: [''],          // نوع الإجازة 
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
  async ngOnInit() {
    this.employees = await this.userService.getUsers();
    this.getUsersStatics()
    this.dataLoaded = true;
  }

  getUsersStatics() {
    // total employees
    this.totalEmployees = this.employees.length;

    const today = moment(); // ← keep as Moment object, not string

    // --- Count absentees ---
    const absentCount = this.employees.filter((emp: any) =>
      emp.absences?.some((a: any) =>
        moment(a.date, 'DD/MM/YYYY', true).isSame(today, 'day')
      )
    ).length;

    this.absentEmployees = absentCount ?? 0;

    // --- Calculate present employees ---
    this.presentEmployees = (this.totalEmployees ?? 0) - (this.absentEmployees ?? 0);

    // Count unique departments
    const departments = new Set(this.employees.map((emp:any) => emp.departmentName));
    this.departmentsCount = departments.size;

    // Assign for table
    this.filteredEmployees = this.employees.map((emp:any) => ({
      name: emp.fullNameArabic || emp.fullName,
      department: emp.departmentName,
      jobTitle: emp.departmentRole,
      absenceDays: emp.emergency_vacation_days ?? 0,
      kpi: emp.rate ?? 0,
    }));
  }

  exportExcel() {
      console.log("Exporting to Excel...");
      // ضع هنا منطق التصدير إلى Excel
    }

    exportPDF() {
      console.log("Exporting to PDF...");
      // ضع هنا منطق التصدير إلى PDF
    }

    exportPrint() {
      console.log("Printing...");
      // window.print(); // يمكن استبدالها بمنطق الطباعة المخصص
    }

     toggleExportPopup(button: HTMLElement) {
    this.showExportPopup = !this.showExportPopup;
    if (this.showExportPopup) {
      const rect = button.getBoundingClientRect();
      this.popupPosition.top = rect.bottom + window.scrollY + 7; // Just below button
      this.popupPosition.left = rect.left + window.scrollX;  // Align with button
    }
  }

  assignOfficialVacation() {
  const data = this.vacationForm.value;
  const fromDate = moment(data.fromDate).format('YYYY-MM-DD'); 
  const toDate = moment(data.toDate).format('YYYY-MM-DD'); 
  const type = data.type;
  console.log("🚀 ~ UsersComponent ~ assignOfficialVacation ~ type:", type)
  const daysRequested = this.getDateDiffInDays(fromDate, toDate);

  const selectedIds = data.selectedEmployees.includes('all')
    ? this.employees.map((e:any) => e.id)
    : data.selectedEmployees;

  const selectedEmployees = this.employees.filter((emp:any) => selectedIds.includes(emp.id));

  if(type == 'خاصة'){
    // تحقق من كل موظف
    for (const emp of selectedEmployees) {
      const found = this.officialVacations[0]?.employees.find((e:any) => e.id === emp.id);
      const daysRemaining = found?.daysRemaining ?? 0;
  
      if (daysRemaining < daysRequested) {
        this.toastr.error(
          `الموظف ${emp.fullNameArabic} ايام متبقية  ${daysRemaining} يومًا ولا يمكنه أخذ ${daysRequested} أيام.`,
          'رصيد غير كافٍ'
        );
        return; // إلغاء التسجيل
      }
    }
  }

  // إذا مرّ التحقق، أضف الإجازة
  this.officialVacations.push({
    fromDate,
    toDate,
    reason: data.reason,
    details: data.details,
    isAllSelected: data.selectedEmployees.length == this.employees.length ? true : false,
    employees: selectedEmployees
  });
  console.log("🚀 ~ UsersComponent ~ assignOfficialVacation ~ this.officialVacations:", this.officialVacations)
  
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
  this.selectedEmployees = this.employees.map((e:any) => e.id);
  this.vacationForm.get('selectedEmployees')?.setValue(this.selectedEmployees);
}

  showDetails(employee: any) {
    this.selectedEmployee = employee;
    // this.showModal.set(true); // عرض النافذة المنبثقة
    this.router.navigate(['/profile']);
  }

  searchEmployee() {
    const term = this.searchTerm.trim();
    
    if (term) {
      const lowerTerm = term.toLowerCase();
      console.log("🚀 ~ UsersComponent ~ searchEmployee ~ lowerTerm:", lowerTerm)
      console.log("🚀 ~ UsersComponent ~ searchEmployee ~ this.employees:", this.employees)
      
      this.filteredEmployees = this.employees.filter((emp:any) =>
        emp.fullNameArabic.includes(lowerTerm) ||
        emp.id.toLowerCase().includes(lowerTerm) ||
        emp.departmentName.toLowerCase().includes(lowerTerm)
      );
    } else {
      this.filteredEmployees = [...this.employees]; // عرض الكل عند البحث الفارغ
    }
    
    this.showTable = true;
  }

  closeModal() {
    this.showModal.set(false);
    this.selectedEmployee = null;
  }

  // ✅ فتح النموذج
  openForm() {
    // this.employeeForm.reset({
    //   status: 'نشط'
    // });
    // this.showModal.set(true);
    this.router.navigate(['/profile']);
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
    // this.editMode = true;
    // this.employeeForm.patchValue(employee);
    // this.showModal.set(true);
    this.router.navigate(['/profile']);
  }

  deleteEmployee(employee: any) {
    this.employees = this.employees.filter((e:any) => e !== employee);
  }
}
