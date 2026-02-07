import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';
import { inject } from '@angular/core';
import { Firestore, doc, updateDoc } from '@angular/fire/firestore';
import { isEqual } from 'lodash'; // optional: lodash makes it easy


import Chart from 'chart.js/auto';
import { UserService } from '../../../core/services/users.service';
import moment from 'moment-timezone';

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

  private auth: Auth = inject(Auth); // Inject Auth

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
  userReport: any;
  emptyReport: boolean = false;

  constructor(private fb: FormBuilder, private userService: UserService, private storage: Storage, private firestore: Firestore) {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

    this.range = this.fb.group({
      start: [firstDay],
      end: [today]
    });

    // Auto run filter when user changes dates
  }
  ngOnInit(): void {
    this.loadProfileData();
    this.applyDateFilter();
  //   setTimeout(() => {
  //   this.renderRatingChart();
  //   this.renderMonthlyRatingChart();
  // }, 0);
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

getReadableDate(ts: any) {
  if (!ts) return '';
  const seconds = ts._seconds || ts.seconds; // some SDK versions
  return new Date(seconds * 1000).toLocaleDateString('ar-EG');
}

get delayEvents() {
  return this.profile.events?.filter((e: any) => e.type === 'delay') || [];
}

get hasDelays() {
  return this.delayEvents.length > 0;
}

async onFileSelected(event: Event) {
  // استخرج الملف من الـ event
  const input = event.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) return;

  const file: File = input.files[0];  // هنا النوع صحيح الآن

  try {
    const userId = this.profile.id;
    const path = `profiles/${userId}.jpg`;
    const storageRef = ref(this.storage, path);

    const snapshot = await uploadBytes(storageRef, file);           
    const avatarUrl = await getDownloadURL(snapshot.ref);  

    console.log('Avatar URL:', avatarUrl);

    // تحديث في Firestore
    const userRef = doc(this.firestore, `users/${userId}`);
    await updateDoc(userRef, { avatarUrl });

    this.profile.avatarUrl = avatarUrl;
    console.log('Upload successful:', avatarUrl);
  } catch (error) {
    console.error('Error uploading file:', error);
  }
}



  async loadProfileData() {
    
    const savedProfileStr = localStorage.getItem('profile');
    const savedProfile = savedProfileStr ? JSON.parse(savedProfileStr) : null;
    
    if (savedProfile) {
      this.profile = savedProfile;
    console.log('✅ Loaded profile from localStorage:', this.profile);
  }



  // 2️⃣ جلب المستخدم المحدد من السيرفس
  this.userService.getSelectedUsers().subscribe((selectedUser: any) => {
    if (!selectedUser || Object.keys(selectedUser).length === 0) {
      // ⚠️ لا تحدّث البروفايل إذا كانت البيانات فارغة
      console.log('⚠️ No selected user from service, keeping local profile');
      return;
    }

    // 3️⃣ فقط حدّث البيانات إذا المستخدم مختلف
    if (!savedProfile || savedProfile.agecAccount !== selectedUser.agecAccount) {
      this.profile = selectedUser;

      localStorage.setItem('profile', JSON.stringify(selectedUser));
      console.log('🔄 Updated profile from service:', selectedUser);
    }
  });
    console.log(this.profile)
  }

  isEmptyReport(profile: any): boolean {
  if (!profile || !profile.userReport) return true;

  const report = profile.userReport;

  return (
    (report.cameLate?.length ?? 0) === 0 &&
    (report.leaveEarly?.length ?? 0) === 0 &&
    (report.overTime?.length ?? 0) === 0 &&
    (report.absences?.length ?? 0) === 0 &&
    (report.holidayWork?.length ?? 0) === 0 &&
    (report.reviewDays?.length ?? 0) === 0 &&
    (report.events?.length ?? 0) === 0 &&
    Object.values(report.totals ?? {}).every(v => v === 0) &&
    Object.values(report.kpis ?? {}).every(v => v === 0)
  );
}


  async applyDateFilter() {
    const start = this.range.get('start')?.value;
    const end = this.range.get('end')?.value;

    if (!start || !end) return;

    const startDate = moment(start)
      .startOf('day')
      .format('YYYY-MM-DDTHH:mm:ssZ');
      
      const endDate = moment(end)
      .endOf('day')
      .format('YYYY-MM-DDTHH:mm:ssZ');

    const userEmail = this.profile.agecAccount

    this.userReport = await this.userService.calculateAbsences(
      this.profile.id,
      userEmail,
      startDate,
      endDate
    );

    console.log(this.userReport);
    if(Object.keys(this.userReport).length === 0) {
      this.emptyReport = true
    }

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
