import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserModule } from '@angular/platform-browser';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,
    FormsModule,
    CommonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatNativeDateModule,
    MatInputModule,
    ReactiveFormsModule,
    BrowserModule
  ],
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss']
})
export class CustomersComponent {
  projects = [
  {
    id: 1,
    expanded: false,
    projectNumber: 'PRJ-001',
    projectName: 'إنشاء برج سكني', // Arabic text still fine for display
    projectValue: 5000000,
    amountPaid: 2000000,
    amountDue: 3000000,
    details: [
      { item: 'أعمال الحفر', cost: 200000, quantity: 1, status: 'تم التسليم', eligibleForPayment: true },
      { item: 'الخرسانة المسلحة', cost: 500000, quantity: 1, status: 'قيد التنفيذ', eligibleForPayment: false },
      { item: 'التشطيبات', cost: 300000, quantity: 1, status: 'لم يبدأ', eligibleForPayment: false }
    ]
  },
  {
    id: 2,
    expanded: false,
    projectNumber: 'PRJ-002',
    projectName: 'توسعة مصنع حديد',
    projectValue: 8000000,
    amountPaid: 3500000,
    amountDue: 4500000,
    details: [
      { item: 'إعداد الموقع', cost: 150000, quantity: 1, status: 'تم التسليم', eligibleForPayment: true },
      { item: 'تركيب المعدات', cost: 2000000, quantity: 1, status: 'جاهز', eligibleForPayment: true }
    ]
  }
];


  toggleDetails(project:any) {
    project.expanded = !project.expanded;
  }

  // ✅ حساب الإجمالي لكل بند
  calcTotal(d:any): number {
    return (d.تكلفة || 0) * (d.كمية || 0);
  }
}
