import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CardComponent, CardHeaderComponent, CardBodyComponent, RowComponent, ColComponent, ModalComponent, ModalHeaderComponent, ModalBodyComponent, ModalFooterComponent, WidgetStatCComponent, BadgeComponent } from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-sales',
  imports: [
    CommonModule, ReactiveFormsModule,
    RowComponent, ColComponent,
    WidgetStatCComponent, BadgeComponent, FormsModule,
],
  templateUrl: './sales.component.html',
  styleUrl: './sales.component.scss'
})
export class SalesComponent {
  statusFilter: string = '';
  selectedOrder: any = null;
  orderDetailsVisible = false;
  selectedSupplier: any = null;


  orders = [
  {
    id: 1001,
    customer: 'محمد علي',
    status: 'قيد التنفيذ',
    total: 250,
    date: '2025-06-18',
    createdAt: '2025-06-15',
    dueDate: '2025-06-20',
    supervisor: 'خالد السعيد',
    notes: 'تسليم مستعجل'
  },
  {
    id: 1002,
    customer: 'سارة إبراهيم',
    status: 'مكتملة',
    total: 320,
    date: '2025-06-17',
    createdAt: '2025-06-10',
    dueDate: '2025-06-15',
    supervisor: 'منى أحمد',
    notes: 'تم الدفع كاملاً'
  },
  {
    id: 1003,
    customer: 'أحمد خالد',
    status: 'ملغاة',
    total: 180,
    date: '2025-06-16',
    createdAt: '2025-06-13',
    dueDate: '2025-06-19',
    supervisor: 'ياسر محمد',
    notes: 'العميل ألغى الطلب'
  },
  {
    id: 1004,
    customer: 'ليلى حسن',
    status: 'جديدة',
    total: 400,
    date: '2025-06-19',
    createdAt: '2025-06-18',
    dueDate: '2025-06-25',
    supervisor: 'خالد السعيد',
    notes: 'يحتاج تأكيد'
  },
  {
    id: 1005,
    customer: 'علي سالم',
    status: 'قيد التنفيذ',
    total: 600,
    date: '2025-06-19',
    createdAt: '2025-06-18',
    dueDate: '2025-06-22',
    supervisor: 'منى أحمد',
    notes: 'شحن جزئي'
  },
  {
    id: 1006,
    customer: 'هالة محمود',
    status: 'مكتملة',
    total: 275,
    date: '2025-06-17',
    createdAt: '2025-06-14',
    dueDate: '2025-06-18',
    supervisor: 'ياسر محمد',
    notes: 'تم التسليم بنجاح'
  }
  ];

  approvedSuppliers = [
  {
    name: 'السويدى للكابلات',
    image: 'assets/images/c1.png',
  },
  {
    name: 'المخزن الذهبي',
    image: 'assets/images/c2.png',
  },
  // Add 3 more as needed
];

  @ViewChild('detailsChart', { static: false }) chartRef!: ElementRef;
chartInstance: any;


renderOrderChart() {
  if (this.chartInstance) this.chartInstance.destroy();

  const ctx = this.chartRef.nativeElement.getContext('2d');
  const remaining = 100 - this.getOrderProgress(this.selectedOrder.status);

  this.chartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['تم إنجازه', 'متبقي'],
      datasets: [{
        data: [this.getOrderProgress(this.selectedOrder.status), remaining],
        backgroundColor: ['#28a745', '#ccc']
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'bottom' } }
    }
  });
}

showSupplierDetails(supplier: any) {
  this.selectedSupplier = supplier;
}


showOrderDetails(order: any) {
  this.selectedOrder = order;
  this.orderDetailsVisible = true;
  setTimeout(() => this.renderOrderChart(), 0);
}

get totalSales() {
  return this.orders
    .filter(o => o.status !== 'ملغاة')
    .reduce((acc, o) => acc + o.total, 0);
}

getOrderProgress(status: string): number {
  switch (status) {
    case 'جديدة': return 10;
    case 'قيد التنفيذ': return 50;
    case 'مكتملة': return 100;
    case 'ملغاة': return 0;
    default: return 0;
  }
}

get todayOrders() {
  // const today = new Date().toISOString().slice(0, 10);
  // return this.orders.filter(o => o.date === today).length;
  return 1
}

get canceledOrders() {
  return this.orders.filter(o => o.status === 'ملغاة').length;
}

get filteredOrders() {
  if (!this.statusFilter || this.statusFilter === 'كل الحالات') {
    return this.orders;
  }
  return this.orders.filter(order => order.status === this.statusFilter);
}

getStatusColor(status: string) {
  switch (status) {
    case 'جديدة': return 'info';
    case 'قيد التنفيذ': return 'warning';
    case 'مكتملة': return 'success';
    case 'ملغاة': return 'danger';
    default: return 'secondary';
  }
}

}
