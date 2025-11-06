import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { WidgetStatCComponent, BadgeComponent } from '@coreui/angular';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  imports: [
    CommonModule, ReactiveFormsModule,
    FormsModule,
    CommonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatNativeDateModule,
    MatInputModule,
    ReactiveFormsModule,
    
],
})
export class ProfileComponent implements OnInit {


  profile: any;
  @ViewChild('ratingChart') ratingChartRef!: ElementRef;
  @ViewChild('monthlyRatingChart') monthlyRatingChartRef!: ElementRef;
  ratingChart: any;
monthlyRatingChart: any;
range: FormGroup;
  monthlyRatings = [
    { month: 'يناير', rating: 40 },
    { month: 'فبراير', rating: 60 },
    { month: 'مارس', rating: 75 },
    { month: 'أبريل', rating: 70 },
    { month: 'مايو', rating: 82 },
    { month: 'يونيو', rating: 88 }
  ];

  constructor(private fb: FormBuilder){
    this.range = this.fb.group({
      start: [null],
      end: [null]
    });
  }
  ngOnInit(): void {
    this.loadProfileData();
    setTimeout(() => {
    this.renderRatingChart();
    this.renderMonthlyRatingChart();
  }, 0);
  }

  getTotalLoans(): number {
  return this.profile.loans
    .filter((loan: any) => loan.status !== 'مرفوضة')
    .reduce((total: number, loan: any) => total + loan.amount, 0);
}

getRemainingSalaryPercentage(): number {
  const used = this.getTotalLoans();
  return Math.max(0, Math.round(((this.profile.salary - used) / this.profile.salary) * 100));
}

getTotalBonuses(): number {
  return this.profile.bonuses.reduce((sum: number, b: any) => sum + b.amount, 0);
}

renderRatingChart() {
  if (this.ratingChart) this.ratingChart.destroy();

  const ctx = this.ratingChartRef.nativeElement.getContext('2d');
  const value = this.profile.rating;

  this.ratingChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['التقييم', 'المتبقي'],
      datasets: [{
        data: [value, 100 - value],
        backgroundColor: ['#28a745', '#e0e0e0'],
        borderWidth: 1
      }]
    },
    options: {
      plugins: {
        legend: { display: false }
      },
      cutout: '70%',
    }
  });
}

requestLeave() {
  alert('فتح نموذج طلب الإجازة...');
}

requestLoan() {
  alert('فتح نموذج طلب السلفة...');
}

getDeductionsTotal(): number {
  if (!this.profile?.deductions?.length) return 0;
  return this.profile.deductions.reduce((total: number, d: any) => total + d.amount, 0);
}

  loadProfileData() {
    this.profile = {
      name: 'محمد السالم',
      phone: '01050180934',
      email: 'm.salem@example.com',
      address: 'مدينة نصر - القاهرة',
      role: 'عامل صيانة',
      joinDate: '2022-03-01',
      image: 'assets/images/avatars/3.jpg',
      leaveBalance: 7,
      events: [
    { date: '13/07', type: 'حضور', details: 'الساعة 8 تأخير نصف ساعة' },
    { date: '25/07', type: 'مأمورية', details: 'الرجوع الساعة 4' },
    { date: '20/07', type: 'انصراف مبكر', details: 'الساعة 2:30' }
  ],
      upcomingLeaves: [
        { date: '2025-07-15', reason: 'إجازة عائلية' },
        { date: '2025-08-01', reason: 'سفر شخصي' }
      ],
      delaysDays: [
        { date: '2025-07-15', reason: '30 دقيقة' },
        { date: '2025-08-01', reason: '1:30 ساعة' }
      ],
      absentsDays: [
        { date: '2025-07-16', reason: 'اجازة عارضة' },
        { date: '2025-08-03', reason: 'بدون عذر' }
      ],
      deductions: [
        { date: '2025-05-15', reason: 'تأخير متكرر', amount: 200 },
        { date: '2025-06-10', reason: 'غياب بدون عذر', amount: 300 }
      ],
      bonuses: [
        { title: 'مكافأة إنجاز مشروع', amount: 1000, date: '2025-06-01' },
        { title: 'تحفيز على الأداء', amount: 500, date: '2025-04-10' }
      ],
      attendanceDays: 20,
      absenceDays: 1,
      delays: 2,
      totalWorkHours: 30,

      rating: 90,
      feedback: 'أداء ممتاز خلال المشاريع الأخيرة، يُظهر التزاماً ومهارة عالية في التنفيذ.',

      projects: [
        { name: 'توسعة محطة 66 ك.ف.', hours: 320 },
        { name: 'تركيب لوحات جهد منخفض', hours: 140 },
        { name: 'مشروع الإسكان - الدمام', hours: 185 }
      ],
      salary: 6000,

      loans: [
        { date: '2024-06-01', amount: 1500, status: 'مدفوعة' },
        { date: '2025-06-15', amount: 1000, status: 'مدفوعة' },
        { date: '2025-06-28', amount: 500, status: 'مرفوضة' }
      ],

      totalLoans: 2500,
      insuranceStatus: 'مسجل بالتأمينات',
      educationLevel: 'بكالوريوس هندسة كهربائية',
      certificates: [
        { title: 'شهادة السلامة المهنية', date: '2023-05-01' },
        { title: 'دورة القيادة الفعالة', date: '2024-03-10' }
      ],
      languages: ['العربية', 'الإنجليزية', 'الفرنسية'],

      familyInfo: {
        maritalStatus: 'متزوج',
        dependents: 2,
        emergencyContact: {
          name: 'أحمد السالم',
          relation: 'أخ',
          phone: '01012345678'
        }
      },

      residence: {
        governorate: 'القاهرة',
        city: 'مدينة نصر',
        street: 'شارع الطيران'
      }
    };
  }

  applyDateFilter(){

  }
  renderMonthlyRatingChart() {
  if (this.monthlyRatingChart) this.monthlyRatingChart.destroy();

  const ctx = this.monthlyRatingChartRef.nativeElement.getContext('2d');
  const labels = this.monthlyRatings.map(m => m.month);
  const data = this.monthlyRatings.map(m => m.rating);

  this.monthlyRatingChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'التقييم الشهري',
        data,
        fill: false,
        borderColor: '#0d6efd',
        tension: 0.3,
        pointBackgroundColor: '#0d6efd'
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100
        }
      }
    }
  });
}


}
