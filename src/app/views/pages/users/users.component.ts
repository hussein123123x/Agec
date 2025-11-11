import { Component, ElementRef, OnInit, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IconDirective } from '@coreui/icons-angular';
import { NgSelectModule } from '@ng-select/ng-select';
import moment from 'moment-timezone';
import * as XLSX from 'xlsx';


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

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

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
      try {
        console.log('Export to EXCEL :', this.filteredEmployees);

        if (!this.filteredEmployees || this.filteredEmployees.length === 0) {
          this.toastr.warning('لا توجد بيانات لتصديرها', 'تنبيه');
          return;
        }

        const exportData = this.filteredEmployees.map((emp: any, index: number) => ({
          'الرقم التعريفي': emp.id || '',
          'الاسم الكامل': emp.fullName || '',
          'الاسم الكامل بالعربية': emp.fullNameArabic || '',
          'الجنس': emp.gender || '',
          'الحالة الاجتماعية': emp.maritalStatus || '',
          'الرقم القومي': emp.nationalId || '',
          'البريد الإلكتروني': emp.email || '',
          'رقم الهاتف': emp.phone || '',
          'رقم هاتف إضافي': emp.additionalPhone || '',
          'العنوان': emp.address || '',
          'المحافظة': emp.city || '',
          'المسمى الوظيفي': emp.role || '',
          'الإدارة': emp.departmentName || '',
          'القسم': emp.departmentRole || '',
          'الدور داخل القسم': emp.departmentRole || '',
          'الصلاحيات':  '',
          'سوف يستخدم البرنامج': '',
          'الحالة': emp.status || '',
          'تاريخ الإضافة': emp.addedAt
            ? new Date(
                emp.addedAt._seconds ? emp.addedAt._seconds * 1000 : emp.addedAt
              ).toLocaleDateString('ar-EG')
            : '',
          'تاريخ التحديث': emp.updatedAt
            ? new Date(
                emp.updatedAt._seconds ? emp.updatedAt._seconds * 1000 : emp.updatedAt
              ).toLocaleDateString('ar-EG')
            : '',
          'تاريخ الميلاد': emp.dateOfBirth || '',
          'تاريخ التوظيف': emp.hiredAt
            ? new Date(
                emp.hiredAt._seconds ? emp.hiredAt._seconds * 1000 : emp.hiredAt
              ).toLocaleDateString('ar-EG')
            : '',
          'العمر': emp.age || '',
          'سنوات الخبرة': emp.yearsOfExperience || '',
          'عدد سنوات العمل بالشركة': emp.yearsInCompany || '',
          'التقييم': emp.rate || '',
          'الغيابات': Array.isArray(emp.absences) ? emp.absences.length : 0,
          'اللغات': Array.isArray(emp.languages) ? emp.languages.join(', ') : '',
          'الدورات': Array.isArray(emp.courses) ? emp.courses.join(', ') : '',
          'الشهادات': Array.isArray(emp.certifications)
            ? emp.certifications.join(', ')
            : '',
          'رابط السيرة الذاتية': emp.cvLink || '',
          'صورة الملف الشخصي': emp.avatarUrl || '',
          'الحساب البنكي': emp.bankAccount || emp.bankAccount_encrypted || '',
          'الراتب': emp.salary || emp.salary_encrypted || '',
          'عملة الراتب': emp.salaryCurrency || '',
          'رابط فيسبوك': emp.facebookLink || '',
          'أفراد العائلة': Array.isArray(emp.family)
            ? emp.family.map((f: any) => f.name || '').join(', ')
            : '',
          'الملاحظات': emp.notes || '',
          'بيانات إضافية': JSON.stringify(emp.metadata || {}),
          'يمتلك سيارة': emp.hasCar ? 'نعم' : 'لا',
          'مهارات الحاسوب': Array.isArray(emp.computerSkills)
            ? emp.computerSkills.join(', ')
            : '',
          'المستوى التعليمي': emp.educationLevel || '',
          'الشركات السابقة': Array.isArray(emp.lastCompanies)
            ? emp.lastCompanies.join(', ')
            : '',
        }));

        /// 🔹 تحويل البيانات إلى ورقة Excel
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Employees');

        // 🔹 تنزيل الملف مباشرة بدون file-saver
        const fileName = `employees_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(workbook, fileName);

        this.toastr.success('تم تصدير البيانات بنجاح', 'تمت العملية');
        this.showExportPopup = false;
      } catch (error) {
        console.error('❌ فشل تصدير البيانات:', error);
        this.toastr.error('حدث خطأ أثناء تصدير البيانات', 'خطأ');
      }
    }


    exportPrint() {
      console.log("Printing...");
      this.showExportPopup = false;
      setTimeout(() => {
        window.print(); // يمكن استبدالها بمنطق الطباعة المخصص
      }, 1000);
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

    
    console.log("🚀 ~ UsersComponent ~ showDetails ~ this.selectedEmployee:", this.selectedEmployee)
    this.userService.setUsers(this.selectedEmployee);

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
      console.log("🚀 ~ UsersComponent ~ searchEmployee ~ this.filteredEmployees:", this.filteredEmployees)
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

  importData() {
    // فتح ال file picker
    this.fileInput.nativeElement.value = ''; // عشان يشتغل لو اختار نفس الملف تاني
    this.fileInput.nativeElement.click();
  }
  
  async onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = async (e: any) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        if (!workbook.SheetNames?.length) {
          throw new Error('ملف Excel لا يحتوي على أي شيتات');
        }

        const wsName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[wsName];
        if (!worksheet) {
          throw new Error(`الشيت "${wsName}" غير موجود أو فارغ`);
        }

        const rows: any[] = XLSX.utils.sheet_to_json(worksheet, {
          header: 0,
          defval: ''
        });

        if (!rows.length) {
          throw new Error('ملف Excel لا يحتوي على بيانات');
        }

        const users: any[] = rows.map(row => this.mapRowToUser(row));
        const cleanedUsers = users.map(user => this.normalizeObject(user));

        this.toastr.success(
          `تم استيراد ${cleanedUsers.length} موظف بنجاح`,
          'تمت العملية بنجاح'
        );

        console.log('✅ Cleaned Users:', cleanedUsers);

        // 🧩 إرسال المستخدمين واحدًا تلو الآخر
        let successCount = 0;
        let failCount = 0;

        for (const user of cleanedUsers) {
          try {
            await this.userService.createUser(user);
            successCount++;
          } catch (err) {
            console.error('❌ فشل إنشاء المستخدم:', user.fullName, err);
            failCount++;
          }
        }

        // ✅ إشعار نهائي بالنتيجة
        this.toastr.info(
          `تم إنشاء ${successCount} مستخدم بنجاح، وفشل ${failCount}`,
          'نتيجة الاستيراد'
        );
      } catch (error: any) {
        console.error('❌ خطأ أثناء قراءة الملف:', error);
        this.toastr.error(
          error.message || 'حدث خطأ أثناء قراءة ملف Excel',
          'فشل في الاستيراد'
        );
      }
    };

    reader.onerror = () => {
      this.toastr.error('حدث خطأ أثناء تحميل الملف', 'خطأ في القراءة');
    };

    reader.readAsArrayBuffer(file);
  }



  private mapRowToUser(row: any): any {
  const user: any = {
    // 🔐 Identity
    id: this.toStringOrUndefined(row['الرقم تعريفي']),
    fullName: this.requiredString(row['الاسم الكامل'], 'الاسم الكامل'),
    fullNameArabic: this.toStringOrUndefined(row['الاسم الكامل بالعربية']),
    gender: this.requiredString(row['الجنس'], 'الجنس') as 'Male' | 'Female',
    maritalStatus: this.toStringOrUndefined(row['الحالة الاجتماعية']) as
      | 'Single'
      | 'Married'
      | 'Divorced'
      | 'Widowed'
      | undefined,
    nationalId: this.toStringOrUndefined(row['الرقم القومي']),

    email: this.toStringOrUndefined(row['البريد الإلكتروني']),
    phone: this.requiredString(row['رقم الهاتف'], 'رقم الهاتف'),
    additionalPhone: this.toStringOrUndefined(row['رقم هاتف إضافي']),
    address: this.toStringOrUndefined(row['العنوان']),
    city: this.toStringOrUndefined(row['المحافظة']),

    // 👥 Role & Organization
    role: this.requiredString(row['المسمى الوظيفي'], 'المسمى الوظيفي'),
    departmentName: this.toStringOrUndefined(row['الإدارة']),
    departmentRole: this.toStringOrUndefined(row['الدور داخل القسم']) as
      | 'Manager'
      | 'Supervisor'
      | 'Team Leader'
      | 'Member'
      | undefined,
    status: (this.toStringOrUndefined(row['الحالة']) as
      | 'active'
      | 'inactive'
      | 'suspended') ?? 'active',

    // 🕒 Dates
    // لو مفيش في الإكسل تاريخ إضافة، ممكن تحط الآن
    addedAt: this.toIsoDate(row['تاريخ الإضافة']) ?? new Date().toISOString(),
    updatedAt: this.toIsoDate(row['تاريخ التحديث']) ?? undefined,
    dateOfBirth: this.toDateOnly(row['تاريخ الميلاد']) ?? undefined,
    hiredAt: this.toIsoDate(row['تاريخ التوظيف']) ?? undefined,

    // 💼 Experience & Skills
    age: this.toNumberOrUndefined(row['العمر']),
    yearsOfExperience: this.toNumberOrUndefined(row['سنوات الخبرة']),
    yearsInCompany: this.toNumberOrUndefined(row['عدد سنوات العمل بالشركة']),
    rate: this.toNumberOrUndefined(row['التقييم']),
    absences: this.toStringArray(row['الغيابات']),      // لو عندكها في العمود

    languages: this.toStringArray(row['اللغات']),
    courses: this.toStringArray(row['الدورات']),
    certifications: this.toStringArray(row['الشهادات']),

    // مفيش تفاصيل تعليمية منفصلة في الأعمدة، هنسيبها undefined
    educations: undefined,

    // 🧾 Work Assets
    cvLink: this.toStringOrUndefined(row['رابط السيرة الذاتية']),
    avatarUrl: this.toStringOrUndefined(row['صورة الملف الشخصي']),

    // 💵 Financial
    bankAccount: this.toStringOrUndefined(row['الحساب البنكي']),
    salary: this.toStringOrUndefined(row['الراتب']),
    salaryCurrency: this.toStringOrUndefined(row['عملة الراتب']),

    // 🌐 Social
    facebookLink: this.toStringOrUndefined(row['رابط فيسبوك']),

    // 👨‍👩‍👧 Family & Others
    family: this.parseFamily(row['أفراد العائلة']),
    employeeIds: this.toStringArray(row['المعرفات الوظيفية']),
    notes: this.toStringOrUndefined(row['الملاحظات']),

    // 🏷️ Tags/Customization
    tags: this.toStringArray(row['الوسوم']),
    metadata: this.parseMetadata(row['بيانات إضافية']),

    hasCar: this.toBoolean(row['يمتلك سيارة']),
    computerSkills: this.toStringOrUndefined(row['مهارات الحاسوب']) as
      | 'Beginner'
      | 'Intermediate'
      | 'Advanced'
      | 'Expert'
      | undefined,
    educationLevel: this.toStringOrUndefined(row['المستوى التعليمي']),
    lastCompanies: this.toStringArray(row['الشركات السابق']),
  };

  return user;
}

private normalizeObject(obj: any): any {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    // لو value undefined/null نحولها حسب نوعها المتوقع
    if (value === undefined || value === null) {
      // لو اسم الحقل يشير إلى array → نخلي []
      if (
        ['absences', 'languages', 'courses', 'certifications', 'employeeIds',
         'tags', 'lastCompanies', 'family', 'metadata', 'notes', 'computerSkills'].includes(key)
      ) {
        acc[key] = [];
      } else {
        acc[key] = ''; // باقي الحقول نص فارغ
      }
      return acc;
    }

    // لو array ننظف العناصر الداخلية
    if (Array.isArray(value)) {
      acc[key] = value.map(v =>
        typeof v === 'object' ? this.normalizeObject(v) : v
      );
    } 
    // لو object ننظفه داخليًا
    else if (typeof value === 'object' && !(value instanceof Date)) {
      acc[key] = this.normalizeObject(value);
    } 
    // باقي القيم نحطها كما هي
    else {
      acc[key] = value;
    }

    return acc;
  }, {} as any);
}




  // Helpers للتحويل

  private requiredString(value: any, fieldName: string): string {
  const v = String(value ?? '').trim();
  if (!v) {
    // هنا تقدر ترمي Error أو تخزن errors وتعرضها للمستخدم
    console.warn(`حقل إلزامي مفقود في الإكسل: ${fieldName}`);
  }
  return v;
}

private toStringOrUndefined(value: any): string | undefined {
  if (value === null || value === undefined) return undefined;
  const v = String(value).trim();
  return v || undefined;
}

private toIsoDate(value: any): string | null {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  if (isNaN(d.getTime())) return null;
  return d.toISOString();
}

private toDateOnly(value: any): string | null {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().split('T')[0];
}

private toNumberOrUndefined(value: any): number | undefined {
  if (value === null || value === undefined || value === '') return undefined;
  const n = Number(value);
  return isNaN(n) ? undefined : n;
}

private toStringArray(value: any): string[] {
  if (!value) return [];
  return String(value)
    .split(/[,،;؛]/) // فواصل عربية وإنجليزية
    .map(v => v.trim())
    .filter(v => v.length > 0);
}

private toBoolean(value: any): boolean | undefined {
  if (value === null || value === undefined || value === '') return undefined;
  const v = String(value).trim().toLowerCase();
  if (['1', 'true', 'نعم', 'yes', 'y'].includes(v)) return true;
  if (['0', 'false', 'لا', 'no', 'n'].includes(v)) return false;
  return undefined;
}

// لو عمود "أفراد العائلة" مكتوب فيه JSON
// أو فورمات مثل: "Father:Ali:+2010...,Mother:Fatma"
private parseFamily(value: any): any[] | undefined {
  if (!value) return undefined;

  const str = String(value).trim();
  if (!str) return undefined;

  try {
    // لو المستخدم حاطط JSON كامل في الخلية
    const parsed = JSON.parse(str);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (_) {
    // مش JSON، نجرّب فورمات بسيط
  }

  // مثال فورمات نصي بسيط: "Father-Ali-010...,Mother-Fatma"
  const members: any[] = str.split(/[,،;]/).map(ch => {
    const parts = ch.split('-').map(p => p.trim());
    return {
      relation: parts[0] || '',
      fullName: parts[1] || '',
      phone: parts[2] || undefined,
      notes: parts[3] || undefined,
    };
  });

  return members.filter(m => m.relation && m.fullName);
}

// لو عمود "بيانات إضافية" فيه JSON، نخزنه في metadata
private parseMetadata(value: any): Record<string, any> | undefined {
  if (!value) return undefined;
  const str = String(value).trim();
  if (!str) return undefined;

  try {
    const parsed = JSON.parse(str);
    if (parsed && typeof parsed === 'object') return parsed;
  } catch (_) {}

  // لو مش JSON نخزنه في key واحدة
  return { raw: str };
}
}
