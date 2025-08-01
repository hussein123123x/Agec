import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-events',
  imports: [ReactiveFormsModule,
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
    MatIconModule,],
  templateUrl: './events.component.html',
  styleUrl: './events.component.scss'
})
export class EventsComponent {
  searchQuery: string = '';
  searchText: string = '';
  statusFilter: string = '';
  showForm: boolean = false;
  filterFromDate: string = '';
  filterToDate: string = '';
  selectedDateRange: string = '';
  customFromDate: string = '';
  customToDate: string = '';
  range = new FormGroup({
    start: new FormControl(),
    end: new FormControl()
  });

  event: any = { name: '', date: '', details: '', reference: '', time: '' }; // نموذج الحدث الجديد

  events: any[] = [
  {
    name: "كسر زجاج البوابة الخلفية",
    date: "2025-07-15T14:30:00",
    details: "تم تصليح كسر زجاج البوابة الخلفية في المباني الحديثة.",
    reference: "صيانة عامة"
  },
  {
    name: "غياب موظف",
    date: "2025-07-01T08:00:00",
    details: "الموظف أحمد علي تغيّب عن العمل بدون إذن.",
    reference: "شؤون الموظفين"
  },
  {
    name: "سلفة مالية",
    date: "2025-07-10T11:15:00",
    details: "تم صرف سلفة بقيمة 3000 جنيه للمهندس خالد.",
    reference: "الشؤون المالية"
  },
  {
    name: "انتهاء تصنيع لوحة توزيع 400A",
    date: "2025-07-18T16:45:00",
    details: "تم الانتهاء من تصنيع اللوحة وتسليمها للمخزن.",
    reference: "الإنتاج"
  },
  {
    name: "عطل في ماكينة التثقيب",
    date: "2025-07-22T09:20:00",
    details: "توقف ماكينة التثقيب عن العمل بسبب عطل كهربائي.",
    reference: "الصيانة الفنية"
  },
  {
    name: "استلام دفعة من عميل",
    date: "2025-07-25T13:00:00",
    details: "تم استلام مبلغ 50,000 جنيه من شركة المجمعات الحديثة.",
    reference: "المحاسبة"
  },
  {
    name: "دفع دفعة لمورد",
    date: "2025-07-28T10:30:00",
    details: "تم تحويل مبلغ 35,000 جنيه لشركة الكابلات الوطنية.",
    reference: "المشتريات"
  }
];


  constructor(private fb: FormBuilder) {
    this.range = this.fb.group({
      start: [null],
      end: [null]
    });
  }

  applyDateFilter() {
  const { start, end } = this.range.value;

  this.filterFromDate = start
    ? new Date(start).toLocaleDateString('en-CA')  // YYYY-MM-DD format
    : '';

  this.filterToDate = end
    ? new Date(end).toLocaleDateString('en-CA')
    : '';

  console.log("من تاريخ:", this.filterFromDate);
  console.log("إلى تاريخ:", this.filterToDate);
}

clearDateFilter() {
  this.range.reset();             // إعادة تعيين حقول التاريخ
  this.filterFromDate = '';
  this.filterToDate = '';
}

  get filteredEvents() {
  let results = this.events;

  if (this.searchText?.trim()) {
    const lower = this.searchText.toLowerCase();
    results = results.filter(e =>
      e.name?.toLowerCase().includes(lower) ||
      e.details?.toLowerCase().includes(lower) ||
      e.reference?.toLowerCase().includes(lower)
    );
  }

  if (this.filterFromDate) {
    results = results.filter(e => new Date(e.date) >= new Date(this.filterFromDate));
  }

  if (this.filterToDate) {
    const endOfDay = new Date(this.filterToDate);
    endOfDay.setHours(23, 59, 59, 999);
    results = results.filter(e => new Date(e.date) <= endOfDay);
  }

  return results;
}



  saveEvent() {
  const now = new Date();
  const todayDate = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const time = this.event.time || '12:00'; // default to 12:00 if none provided

  const dateTimeString = `${todayDate}T${time}:00`;
  const eventDate = new Date(dateTimeString);

  this.event.date = eventDate.toISOString();

  this.events.push({ ...this.event });

  this.event = {}; // Reset
  this.showForm = false;
}
}
