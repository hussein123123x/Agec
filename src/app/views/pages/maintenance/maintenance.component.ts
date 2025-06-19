import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Chart } from 'chart.js/auto';

import {
  CardComponent, CardHeaderComponent, CardBodyComponent, BadgeComponent,
  RowComponent, ColComponent, WidgetStatCComponent, FormCheckLabelDirective
} from '@coreui/angular';

@Component({
  selector: 'app-maintenance',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CardComponent, CardHeaderComponent, CardBodyComponent,
    RowComponent, ColComponent, WidgetStatCComponent, BadgeComponent,
    FormCheckLabelDirective
  ],
  templateUrl: './maintenance.component.html',
  styleUrls: ['./maintenance.component.scss']
})
export class MaintenanceComponent implements OnInit {
  totalTickets = 14;
  inProgressTickets = 5;
  closedTickets = 6;
  urgentTickets = 3;

  statusFilter: string = '';
  reportForm!: FormGroup;

  tickets = [
    {
      id: 1,
      title: 'انقطاع الإنترنت',
      type: 'برمجية',
      priority: 'عالية',
      department: 'الشبكات',
      status: 'open',
      technician: '',
      createdAt: '2025-06-15'
    },
    {
      id: 2,
      title: 'عطل في الطابعة',
      type: 'عتاد',
      priority: 'متوسطة',
      department: 'المالية',
      status: 'in_progress',
      technician: 'محمد حسن',
      createdAt: '2025-06-16'
    },
    {
      id: 3,
      title: 'مشكلة في لوحة الإنتاج',
      type: 'أخرى',
      priority: 'عالية',
      department: 'الإنتاج',
      status: 'closed',
      technician: 'أحمد عبد الله',
      createdAt: '2025-06-14'
    }
  ];

  ticketHistory = [
    { time: '10:00 ص', action: 'تم تسجيل البلاغ "عطل في الطابعة"' },
    { time: '10:45 ص', action: 'تم تعيين الفني محمد حسن' },
    { time: '12:00 م', action: 'بدأ الفني العمل على المشكلة' },
    { time: '01:30 م', action: 'تم حل المشكلة وإغلاق التذكرة' }
  ];

  mostCommonIssue = 'برمجية';
  mostAffectedDept = 'الإنتاج';
  avgResolutionTime = 2.5; // ساعات

  @ViewChild('reportChart', { static: false }) chartRef!: ElementRef;
  chartInstance: any;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.reportForm = this.fb.group({
      title: ['', Validators.required],
      type: ['', Validators.required],
      priority: ['', Validators.required],
      department: ['', Validators.required],
      description: ['']
    });
  }

  ngAfterViewInit() {
    setTimeout(() => this.renderReportChart(), 0);
  }

  submitReport() {
    if (this.reportForm.valid) {
      const newTicket = {
        ...this.reportForm.value,
        id: this.tickets.length + 1,
        status: 'open',
        technician: '',
        createdAt: new Date().toISOString().slice(0, 10)
      };
      this.tickets.push(newTicket);
      this.totalTickets++;
      this.reportForm.reset();
    }
  }

  filteredTickets() {
    if (!this.statusFilter) return this.tickets;
    return this.tickets.filter(t => t.status === this.statusFilter);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'open': return 'danger';
      case 'in_progress': return 'warning';
      case 'closed': return 'success';
      default: return 'secondary';
    }
  }

  viewTicket(ticket: any) {
    alert(`📋 تفاصيل التذكرة:\n\nالعنوان: ${ticket.title}\nالقسم: ${ticket.department}\nالحالة: ${ticket.status}`);
  }

 

  renderReportChart() {

    

    if (!this.chartRef) return;

    const ctx = this.chartRef.nativeElement.getContext('2d');
    if (!this.chartRef) {
      console.warn('Canvas element not found!');
      return;
    }

    if (!ctx) {
      console.error('Context is null');
      return;
    }

    if (this.chartInstance) this.chartInstance.destroy();

    this.chartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['برمجية', 'عتاد', 'أخرى'],
        datasets: [{
          label: 'عدد البلاغات',
          data: [6, 4, 3],
          backgroundColor: ['#007bff', '#28a745', '#ffc107']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });
  }
}
