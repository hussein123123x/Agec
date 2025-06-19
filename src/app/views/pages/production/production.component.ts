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
    ModalFooterComponent, WidgetStatCComponent, BadgeComponent, FormsModule
  ],
  templateUrl: './production.component.html',
  styleUrls: ['./production.component.scss']
})
export class ProductionComponent {
  lines = [
    {
      name: 'خط التجميع 1',
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
      name: 'خط التعبئة',
      code: 'PL002',
      status: 'متوقف',
      supervisor: 'منى حسن',
      startDate: '2022-06-15',
      capacity: 80,
      actual: 0,
      usage: 0,
      lastMaintenance: '2024-10-05',
      notes: 'بانتظار صيانة',
      workers: 8
    },
    {
      name: 'خط التغليف',
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

  this.chartInstance = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: this.lines.map(line => line.name),
      datasets: [{
        label: 'نسبة الاستخدام (%)',
        data: this.lines.map(line => line.usage),
        backgroundColor: '#39f'
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          max: 100
        }
      }
    }
  });
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
