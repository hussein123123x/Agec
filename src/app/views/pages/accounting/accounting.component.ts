import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartjsComponent } from '@coreui/angular-chartjs';
import { IconDirective } from '@coreui/icons-angular';


import {
  CardComponent, CardHeaderComponent, CardBodyComponent,
  RowComponent, ColComponent, WidgetStatCComponent,
  ButtonGroupComponent,
  FormCheckLabelDirective,
  AvatarComponent,
  ButtonDirective,
  CardFooterComponent,
  GutterDirective,
  ProgressComponent,
  TableDirective,
  BadgeComponent
} from '@coreui/angular';
import { Chart } from 'chart.js/auto';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';


@Component({
  selector: 'app-accounting',
  standalone: true,
  imports: [
     ReactiveFormsModule,
     ChartjsComponent,
     WidgetStatCComponent,
    CardComponent,
    CardBodyComponent,
    IconDirective,
    RowComponent,
    ColComponent,
    ButtonGroupComponent,
    FormCheckLabelDirective,
    ButtonDirective,
    ButtonGroupComponent,
    CardBodyComponent,
    CardComponent,
    CardHeaderComponent,
    ColComponent,
    BadgeComponent,
    FormCheckLabelDirective,
    RowComponent,
    FormsModule,
    CommonModule,
  ],
  templateUrl: './accounting.component.html',
  styleUrls: ['./accounting.component.scss']
})
export class AccountingComponent implements AfterViewInit {

  totalRevenue = 120000;
  totalExpenses = 75000;
  netProfit = this.totalRevenue - this.totalExpenses;
  cashBalance = 50000;
  debtAccounts = 30000;
  creditAccounts = 20000;
  transactionTypeFilter: string = '';
  searchText: string = '';
  assets = 150000;
  liabilities = 70000;
  equity = this.assets - this.liabilities;
  trafficRadioGroup!: FormGroup;
  chartInstance: any;

  transactions = [
  {
    date: '2025-06-18',
    type: 'مصروف',
    category: 'شراء مكونات إلكترونية',
    description: 'شراء لوحات تحكم ذكية (Smart Panels)',
    amount: -15000,
    balanceAfter: 435000,
    user: 'خالد السيد'
  },
  {
    date: '2025-06-18',
    type: 'مصروف',
    category: 'سلفة موظف',
    description: 'سلفة مالية للموظف محمد حسين',
    amount: -2000,
    balanceAfter: 433000,
    user: 'إدارة الموارد البشرية'
  },
  {
    date: '2025-06-17',
    type: 'إيراد',
    category: 'بيع لوحة كهربائية',
    description: 'بيع لوحة توزيع ذكية لعميل صناعي',
    amount: 22000,
    balanceAfter: 450000,
    user: 'سارة عبد الله'
  },
  {
    date: '2025-06-17',
    type: 'مصروف',
    category: 'إكرامية',
    description: 'إكرامية لفريق التركيب بعد انتهاء المشروع',
    amount: -1500,
    balanceAfter: 448500,
    user: 'ليلى عمر'
  },
  {
    date: '2025-06-16',
    type: 'مصروف',
    category: 'فواتير مرافق',
    description: 'دفع فاتورة كهرباء الورشة الرئيسية',
    amount: -3200,
    balanceAfter: 445300,
    user: 'خدمة الحسابات'
  },
  {
    date: '2025-06-15',
    type: 'إيراد',
    category: 'توريد مشاريع',
    description: 'توريد 5 لوحات إلكترونية لمشروع بناء جديد',
    amount: 48000,
    balanceAfter: 431000,
    user: 'ليلى عمر'
  },
  {
    date: '2025-06-14',
    type: 'مصروف',
    category: 'شراء دوائر كهربائية',
    description: 'شراء دوائر تحكم PLC للورشة',
    amount: -18500,
    balanceAfter: 383000,
    user: 'عمرو فؤاد'
  },
  {
    date: '2025-06-13',
    type: 'إيراد',
    category: 'صيانة خارجية',
    description: 'صيانة لوحات تحكم صناعية لدى شركة إلكترونيات',
    amount: 12500,
    balanceAfter: 401500,
    user: 'هبة طارق'
  },
  {
    date: '2025-06-12',
    type: 'مصروف',
    category: 'مستلزمات مكتبية',
    description: 'شراء ورق طباعة وأقلام ومحابر',
    amount: -850,
    balanceAfter: 400650,
    user: 'فاطمة علوي'
  },
  {
    date: '2025-06-12',
    type: 'مصروف',
    category: 'فواتير مرافق',
    description: 'دفع فاتورة مياه للفرع الشرقي',
    amount: -600,
    balanceAfter: 400050,
    user: 'خدمة الحسابات'
  }
];



  accountingSections = [
    { name: 'اليومية العامة', description: 'تسجيل قيود اليومية (مدين/دائن)' },
    { name: 'دفتر الأستاذ', description: 'عرض حركة كل حساب' },
    { name: 'المصروفات', description: 'تصنيف وإدارة المصروفات (تشغيلية، إدارية...)' },
    { name: 'الإيرادات', description: 'تسجيل المبيعات والدخل' },
    { name: 'الفواتير', description: 'إدارة الفواتير المستلمة والمصدّرة' },
    { name: 'الحسابات', description: 'شجرة الحسابات (دليل الحسابات)' },
    { name: 'التقارير', description: 'ميزان المراجعة، قائمة الدخل، المركز المالي' },
    { name: 'الأصول', description: 'متابعة الأصول واستهلاكها' }
  ];

  mainChart: any = {
  type: 'line',
  data: {
    labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
    datasets: [
      {
        label: 'الإيرادات',
        data: [10000, 12000, 9000, 15000, 17000, 16000],
        borderColor: '#28a745',
        backgroundColor: 'rgba(40, 167, 69, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'المصروفات',
        data: [6000, 7000, 8000, 5000, 6000, 7500],
        borderColor: '#dc3545',
        backgroundColor: 'rgba(220, 53, 69, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'صافي الربح',
        data: [4000, 5000, 1000, 10000, 11000, 8500], // محصلة الإيرادات - المصروفات
        borderColor: '#007bff',
        backgroundColor: 'rgba(0, 123, 255, 0.1)',
        fill: true,
        borderDash: [5, 5], // خط متقطع
        tension: 0.4
      }
    ]
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 12,
          font: {
            size: 13
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.raw;
            return `${context.dataset.label}: ${value.toLocaleString()} ج.م`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: number) => `${value.toLocaleString()} ج.م`
        }
      },
      x: {
        title: {
          display: true,
          text: 'الشهر'
        }
      }
    }
  }
};


  accountingReports = [
    { name: 'ميزان المراجعة', description: 'عرض الأرصدة المدينة والدائنة لجميع الحسابات' },
    { name: 'قائمة الدخل', description: 'تحليل الإيرادات والمصروفات وصافي الربح' },
    { name: 'قائمة المركز المالي', description: 'عرض الأصول والخصوم ورأس المال' }
  ];

  constructor(private fb: FormBuilder) {
  this.trafficRadioGroup = this.fb.group({
    trafficRadio: ['Year']
  });
}

  @ViewChild('budgetChart', { static: false }) chartRef!: ElementRef;

  handleChartRef(chart: any) {
    this.chartInstance = chart;
  }
  ngAfterViewInit() {
    this.renderBudgetChart();
  }

  renderBudgetChart() {
    console.log(typeof this.assets); // يجب أن يكون number


    if (!this.chartRef) return;

    const ctx = this.chartRef.nativeElement.getContext('2d');
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    this.chartInstance = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['الأصول', 'الخصوم', 'رأس المال'],
        datasets: [{
          data: [this.assets, this.liabilities, this.equity],
          backgroundColor: ['#36a2eb', '#ff6384', '#4caf50']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }

  get filteredTransactions() {
  return this.transactions.filter(tx => {
    const matchesType = this.transactionTypeFilter ? tx.type === this.transactionTypeFilter : true;
    const matchesSearch =
      this.searchText === '' ||
      tx.description.toLowerCase().includes(this.searchText.toLowerCase()) ||
      tx.category.toLowerCase().includes(this.searchText.toLowerCase()) ||
      tx.user.toLowerCase().includes(this.searchText.toLowerCase());
    return matchesType && matchesSearch;
  });
}
 printTransactions() {
   
 }

 addTransaction() {
   
 }

  setTrafficPeriod(period: 'week' | 'Month' | 'Year') {
    let labels: string[] = [];
    let revenues: number[] = [];
    let expenses: number[] = [];
    let profit: number[] = [];

    if (period === 'week') {
      labels = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];
      revenues = [2000, 3000, 2500, 4000, 3500];
      expenses = [1500, 2000, 1800, 2500, 2200];
    } else if (period === 'Month') {
      labels = ['الأسبوع 1', 'الأسبوع 2', 'الأسبوع 3', 'الأسبوع 4'];
      revenues = [8000, 10000, 9500, 11000];
      expenses = [5000, 6000, 5500, 6500];
    } else {
      labels = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'];
      revenues = [10000, 12000, 9000, 15000, 17000, 16000];
      expenses = [6000, 7000, 8000, 5000, 6000, 7500];
    }

    // حساب صافي الربح تلقائيًا
    profit = revenues.map((rev, i) => rev - expenses[i]);

    // تحديث الرسم البياني بالكامل
    this.mainChart.data.labels = labels;
    this.mainChart.data.datasets = [
      {
        label: 'الإيرادات',
        data: revenues,
        borderColor: '#28a745',
        backgroundColor: 'rgba(40, 167, 69, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'المصروفات',
        data: expenses,
        borderColor: '#dc3545',
        backgroundColor: 'rgba(220, 53, 69, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'صافي الربح',
        data: profit,
        borderColor: '#007bff',
        backgroundColor: 'rgba(0, 123, 255, 0.1)',
        fill: true,
        borderDash: [5, 5],
        tension: 0.4
      }
    ];

    this.chartInstance?.update();
  }

}
