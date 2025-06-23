import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ChartConfiguration, ChartType } from 'chart.js';
import { BadgeComponent } from '@coreui/angular';
import { FormsModule } from '@angular/forms';

import { ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import Chart from 'chart.js/auto';


import {
  CardComponent, CardHeaderComponent, CardBodyComponent,
  RowComponent, ColComponent, ModalComponent,
  ModalHeaderComponent, ModalBodyComponent, ModalFooterComponent,
  WidgetStatCComponent,
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';

@Component({
  selector: 'app-production-line',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    IconDirective, CardComponent, CardHeaderComponent,
    CardBodyComponent, RowComponent, ColComponent,
    ModalComponent, ModalHeaderComponent, ModalBodyComponent,
    ModalFooterComponent, WidgetStatCComponent, FormsModule
  ],
  templateUrl: './production.component.html',
  styleUrls: ['./production.component.scss']
})
export class ProductionComponent {
  lines = [
    {
      name: 'خط ميكانيكى',
      code: 'PL001',
      status: 'نشط',
      supervisor: 'أحمد سمير',
      startDate: '2023-01-01',
      capacity: 100,
      actual: 75,
      usage: 75,
      lastMaintenance: '2024-12-01',
      notes: 'يعمل بكفاءة',
      workers: 10
    },
    {
      name: 'خط احتياطى',
      code: 'PL002',
      status: 'متوقف',
      supervisor: 'سعيد يوسف',
      startDate: '2021-03-20',
      capacity: 90,
      actual: 30,
      usage: 30,
      lastMaintenance: '2025-01-15',
      notes: 'تم تغيير قطع غيار',
      workers: 9
    },
    {
      name: 'خط كهربائى',
      code: 'PL003',
      status: 'صيانة',
      supervisor: 'سعيد يوسف',
      startDate: '2021-03-20',
      capacity: 90,
      actual: 30,
      usage: 30,
      lastMaintenance: '2025-01-15',
      notes: 'تم تغيير قطع غيار',
      workers: 9
    }
  ];

  mechanicalMachines = [
  {
    name: 'مقص',
    number: 'M1',
    supervisor: 'سعيد يوسف',
    employees: 4,
    status: 'صيانة',
    startDate: '2021-03-20',
    capacity: 90,
    actual: 30,
    usage: 30,
    lastMaintenance: '2025-01-15',
    notes: 'تم تغيير قطع غيار',
    workers: 9,
    absentEmployees: ['أحمد السيد', 'محمد ابراهيم']
  },
  {
    name: 'بانش',
    number: 'M2',
    supervisor: 'أحمد حسن',
    employees: 3,
    status: 'نشط',
    startDate: '2020-07-11',
    capacity: 80,
    actual: 65,
    usage: 81,
    lastMaintenance: '2024-10-30',
    notes: 'يعمل بكفاءة جيدة',
    workers: 7
  },
  {
    name: 'تناية',
    number: 'M3',
    supervisor: 'مروان',
    employees: 2,
    status: 'متوقف',
    startDate: '2022-01-05',
    capacity: 70,
    actual: 0,
    usage: 0,
    lastMaintenance: '2023-12-10',
    notes: 'بانتظار قطع الغيار',
    workers: 2
  },
  {
    name: 'لحام',
    number: 'M4',
    supervisor: 'ليلى',
    employees: 3,
    status: 'صيانة',
    startDate: '2021-08-14',
    capacity: 100,
    actual: 50,
    usage: 50,
    lastMaintenance: '2025-03-01',
    notes: 'تم تعديل الأقطاب',
    workers: 5
  },
  {
    name: 'دهان',
    number: 'M5',
    supervisor: 'فاطمة',
    employees: 2,
    status: 'نشط',
    startDate: '2020-02-28',
    capacity: 60,
    actual: 55,
    usage: 92,
    lastMaintenance: '2025-04-10',
    notes: 'جاهز للعمل',
    workers: 3
  },
  {
    name: 'لحام',
    number: 'M6',
    supervisor: 'زيد',
    employees: 1,
    status: 'نشط',
    startDate: '2023-06-18',
    capacity: 50,
    actual: 40,
    usage: 80,
    lastMaintenance: '2025-05-20',
    notes: 'تم صيانة بسيطة',
    workers: 2
  }
];


electricalMachines = [
  {
    name: 'ماكينة نحاس',
    number: 'E1',
    supervisor: 'مصطفى',
    employees: 2,
    status: 'نشط',
    startDate: '2021-12-01',
    capacity: 120,
    actual: 110,
    usage: 92,
    lastMaintenance: '2025-01-30',
    notes: 'أداء ممتاز',
    workers: 4
  },
  {
    name: 'تناية',
    number: 'E2',
    supervisor: 'أماني',
    employees: 3,
    status: 'متوقف',
    startDate: '2022-09-15',
    capacity: 85,
    actual: 0,
    usage: 0,
    lastMaintenance: '2024-11-12',
    notes: 'تحتاج إلى صيانة عاجلة',
    workers: 3
  }
];



  chartInstance: any; 
  detailsVisible = signal(false);
  showModal = signal(false);
  selectedLine: any = null;
  statusFilter: string = '';

  lineForm: FormGroup;

  @ViewChild('lineChartCanvas', { static: false }) chartCanvasRef!: ElementRef;

  constructor(private fb: FormBuilder) {
    this.lineForm = this.fb.group({
      name: ['', Validators.required],
      code: [''],
      status: ['نشط'],
      supervisor: [''],
      startDate: [''],
      capacity: [0, Validators.min(0)],
      usage: [0, Validators.min(0)],
      actual: [0, Validators.min(0)],
      lastMaintenance: [''],
      notes: [''],
      workers: [0, Validators.min(0)],
    });

    this.updateChart();
  }

  ngAfterViewInit() {
  this.renderChart();
}

  renderChart() {
  if (this.chartInstance) {
    this.chartInstance.destroy();
  }

  const canvas = document.getElementById('lineChartCanvas') as HTMLCanvasElement;
  if (!canvas) return;

  // Combine both machine types
  const allMachines = [...this.mechanicalMachines, ...this.electricalMachines];

  // Prepare labels (machine names with group type for clarity)
  const labels = allMachines.map(machine => `${machine.name} (${machine.number})`);

  // Extract usage and actual (productive) values
  const usageData = allMachines.map(machine => machine.usage);
  const productiveData = allMachines.map(machine => machine.actual);

  // Create Chart
  this.chartInstance = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'نسبة الاستخدام (%)',
          data: usageData,
          backgroundColor: 'rgba(54, 162, 235, 0.7)'
        },
        {
          label: 'الإنتاج الفعلي',
          data: productiveData,
          backgroundColor: 'rgba(75, 192, 192, 0.7)'
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'مقارنة الاستخدام والإنتاج للماكينات'
        },
        tooltip: {
          mode: 'index',
          intersect: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'القيمة'
          }
        },
        x: {
          ticks: {
            autoSkip: false,
            maxRotation: 45,
            minRotation: 0
          }
        }
      }
    }
  });
}


editMachine(machine: any) {
  this.selectedLine = machine;
  this.lineForm.patchValue(machine);
  this.showModal.set(true);
}

  deleteMachine(machine: any) {
    const index = this.lines.indexOf(machine);
    if (index !== -1) {
      this.lines.splice(index, 1);
    }
  }

  showDetailsModal(line: any) {
    this.selectedLine = line;
    this.detailsVisible.set(true);
  }

  closeDetailsModal() {
    this.detailsVisible.set(false);
    this.selectedLine = null;
  }

  openForm() {
    this.selectedLine = null;
    this.lineForm.reset({
      status: 'نشط',
      usage: 0,
      actual: 0,
      capacity: 0,
      workers: 0,
    });
    this.showModal.set(true);
  }

  openModal(line: any) {
    this.selectedLine = line;
    this.showModal.set(true);
  }

  closeModal() {
    this.selectedLine = null;
    this.showModal.set(false);
  }

  save() {
    if (this.lineForm.valid) {
      const data = this.lineForm.value;
      if (this.selectedLine) {
        Object.assign(this.selectedLine, data);
      } else {
        data.code = `PL${this.lines.length + 1}`.padStart(5, '0');
        this.lines.push(data);
      }
      this.updateChart();
      this.renderChart();
      this.closeModal();
    }
  }

  deleteLine(line: any) {
    this.lines = this.lines.filter(l => l !== line);
    this.updateChart();
    this.renderChart();
  }

  filteredLines() {
    if (!this.statusFilter) return this.lines;
    return this.lines.filter(line => line.status === this.statusFilter);
  }

  // Stats
  get activeCount() {
    return this.lines.filter(l => l.status === 'نشط').length;
  }

  get stoppedCount() {
    return this.lines.filter(l => l.status === 'متوقف').length;
  }

  get maintenanceCount() {
    return this.lines.filter(l => l.status === 'صيانة').length;
  }
  

  // Chart
  public lineChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'نسبة الاستخدام (%)',
        backgroundColor: '#39f'
      }
    ]
  };

  public lineChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true
  };

  public lineChartType: ChartType = 'bar';

  private updateChart() {
    this.lineChartData.labels = this.lines.map(l => l.name);
    this.lineChartData.datasets[0].data = this.lines.map(l => l.usage);
  }

  editLine(line: any) {
    this.selectedLine = line;
    this.lineForm.patchValue(line);
    this.showModal.set(true);
  }

}
