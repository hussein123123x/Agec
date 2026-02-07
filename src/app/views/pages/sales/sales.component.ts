import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormBuilder, Validators, FormArray, FormGroup } from '@angular/forms';
import { CardComponent, CardHeaderComponent, CardBodyComponent, RowComponent, ColComponent, ModalComponent, ModalHeaderComponent, ModalBodyComponent, ModalFooterComponent, WidgetStatCComponent, BadgeComponent } from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { Chart } from 'chart.js';
import { FirestoreGenericService } from '../../../core/services/sorce.service';
import { UserService } from '../../../core/services/users.service';

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
export class SalesComponent implements OnInit {
  statusFilter: string = '';
  selectedOrder: any = null;
  orderDetailsVisible = false;
  selectedSupplier: any = null;
  expandedOrderId: number | null = null;
  showOrderForm = false;
  totalPrice = 0;
  editingOrderId: number | null = null; 


  filteredOrders:any = []

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

  orderForms: { [key: number]: FormGroup } = {};
  private newOrderSub?: any;

chartInstance: any;
  orderForm: any;
  currentUser: any;
  @ViewChild('detailsChart', { static: false }) chartRef!: ElementRef;

constructor(private fb: FormBuilder, private dataSource: FirestoreGenericService<any>, private userService: UserService) {

  this.orderForm = this.fb.group({
  projectName: [''],
  supplierName: [''],
  arrivedNeededTime: ['', Validators.required],
  components: this.fb.array([this.buildComponentGroup()]),
    units: [1, [Validators.required, Validators.min(1)]]

});
}

  ngOnInit(): void {
    this.dataSource.getDocs('orders').then(orders => {
      this.filteredOrders = orders
      this.filteredOrders.forEach((order:any) => this.initForm(order));
    });

  }

  toggleOrder(orderId: number) {
    this.expandedOrderId = this.expandedOrderId === orderId ? null : orderId;
  }

createComponentGroup(): FormGroup {
  return this.fb.group({
    modelNum: ['', Validators.required],
    name: ['', Validators.required],
    units: [1, [Validators.required, Validators.min(1)]], // number of units
    price: [null], // <-- leave empty, no default
    note: ['']
  });
}



// add component
addComponent(orderId?: number) {
  const compGroup = this.fb.group({
    id: [new Date().getTime()],
    modelNum: ['', Validators.required],
    name: ['', Validators.required],
    note: [''],
    price: [null]
  });

  if(orderId) {
    this.getComponents(orderId).push(compGroup);
    this.listenToPriceChanges(orderId);
  } else {
    (this.orderForm.get('components') as FormArray).push(compGroup);
  }
}


async saveOrder(orderId: number) {
    console.log("🚀 ~ SalesComponent ~ saveOrder ~ orderId:", orderId)
    const formValue = this.orderForms[orderId].value;

  const totalPrice = this.calcTotalFromComponents(formValue.components);

  const updatedOrder = { ...formValue, totalPrice };
  console.log("🚀 ~ SalesComponent ~ saveOrder ~ updatedOrder:", updatedOrder)

    await this.dataSource.updateDocByQuery('orders', {
      where: [
        { field: 'id', operator: '==', value: orderId }
      ]
    }, updatedOrder);
    
    // تحديث القائمة المحلية
      const index = this.filteredOrders.findIndex((o: any) => o.id === orderId);
      if (index !== -1) this.filteredOrders[index] = { ...this.filteredOrders[index], ...updatedOrder };

        // إيقاف وضع التعديل
        this.editingOrderId = null;
  }

getComponents(orderId: number): FormArray {
    return this.orderForms[orderId].get('components') as FormArray;
  }

  startEdit(orderId: number) {
    this.editingOrderId = orderId;
  }

  cancelEdit(orderId: number) {
    // إعادة القيم الأصلية من filteredOrders
    this.initForm(this.filteredOrders.find((o:any) => o.id === orderId));
    this.editingOrderId = null;
  }

// getter
get components(): FormArray {
  return this.orderForm.get('components') as FormArray;
}

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

// get totalSales() {
//   return this.orders
//     .filter(o => o.status !== 'ملغاة')
//     .reduce((acc, o) => acc + o.total, 0);
// }

getOrderProgress(status: string): number {
  switch (status) {
    case 'جديدة': return 10;
    case 'قيد التنفيذ': return 50;
    case 'مكتملة': return 100;
    case 'ملغاة': return 0;
    default: return 0;
  }
}

getCountByStatus(status: string): number {
  return this.filteredOrders?.filter(
    (o: any) => o.status === status
  ).length || 0;
}

get underReview() {
  return this.getCountByStatus('قيد الدراسة');
}

get supplierAgreed() {
  return this.getCountByStatus('تم الاتفاق مع المورد');
}

get receivedNotPaid() {
  return this.getCountByStatus('مستحقة الدفع');
}

get completed() {
  return this.getCountByStatus('مكتمل');
}

initForm(order: any) {
  this.orderForms[order.id] = this.fb.group({
    projectName: [order.projectName || ''],
    supplierName: [order.supplierName || ''],
    arrivedNeededTime: [order.arrivedNeededTime || '', Validators.required],
    components: this.fb.array(
      (order.components || []).map((c: any) => this.buildComponentGroup(c))
    )
  });
}


getStatusColor(status: string) {
  switch (status) {
    case 'قيد الدراسة':
      return 'info';
    case 'تم الاتفاق مع المورد':
      return 'warning';
    case 'تم الاستلام':
      return 'primary';
    case 'مكتمل':
      return 'success';
    default:
      return 'secondary';
  }
}

removeComponent(orderId: number, index: number) {
  const arr = this.getComponents(orderId);
  if (arr.length <= 1) return; // اختياري: امنع حذف آخر عنصر
  arr.removeAt(index);
  this.calculateTotal(orderId);
}



calculateTotal(orderId: number) {
  const total = this.calcTotalFromComponents(this.getComponents(orderId).value);
  const index = this.filteredOrders.findIndex((o: any) => o.id === orderId);
  if (index !== -1) this.filteredOrders[index].totalPrice = total;
}

removeNewOrderComponent(index: number) {
  (this.orderForm.get('components') as FormArray).removeAt(index);
  this.recalcNewOrderTotal();
}

recalcNewOrderTotal() {
  const comps = this.components.value;
  this.totalPrice = this.calcTotalFromComponents(comps);
}

private buildComponentGroup(data?: any): FormGroup {
  return this.fb.group({
    id: [data?.id ?? Date.now()],
    modelNum: [data?.modelNum ?? '', Validators.required],
    name: [data?.name ?? '', Validators.required],
    units: [data?.units ?? 1, [Validators.required, Validators.min(1)]],
    note: [data?.note ?? ''],
    price: [data?.price ?? null],
  });
}

listenToPriceChanges(orderId: number) {
  this.getComponents(orderId).valueChanges.subscribe(() => {
    const formValue = this.orderForms[orderId].value;
    const total = formValue.components.reduce((sum: number, c: any) => sum + (c.price || 0), 0);
    const index = this.filteredOrders.findIndex((o:any) => o.id === orderId);
    if(index !== -1) this.filteredOrders[index].totalPrice = total;
  });
}


openNewOrderForm() {
  this.showOrderForm = true;
  this.orderForm = this.fb.group({
    projectName: [''],
    supplierName: [''],
    arrivedNeededTime: ['', Validators.required],
    components: this.fb.array([this.buildComponentGroup()])
  });

  this.totalPrice = 0;
  this.listenToNewOrderChanges(); // اختياري (تحت)
}

listenToNewOrderChanges() {
  this.newOrderSub?.unsubscribe();
  this.newOrderSub = this.orderForm.valueChanges.subscribe(() => {
    this.recalcNewOrderTotal();
  });
}

private calcTotalFromComponents(componentsValue: any[]): number {
  return componentsValue.reduce((sum, c) => {
    const price = Number(c.price || 0);
    const units = Number(c.units || 1);
    return sum + price * units;
  }, 0);
}

addNewOrderComponent() {
  (this.orderForm.get('components') as FormArray).push(this.buildComponentGroup());
  this.recalcNewOrderTotal();
}

addComponentToNewOrder() {
  (this.orderForm.get('components') as FormArray).push(
    this.fb.group({
      id: [new Date().getTime()],
      modelNum: ['', Validators.required],
      name: ['', Validators.required],
      note: [''],
      price: [null]
    })
  );
}

cancelForm() {
  this.showOrderForm = false;
  this.orderForm.reset();
  this.components.clear();
  this.totalPrice = 0;
}

submitOrder() {
  if (this.orderForm.invalid) return;

  const user = this.currentUser; // الأفضل تجيبها مرة واحدة في ngOnInit بدل subscribe هنا

  const nextId = (Math.max(0, ...this.filteredOrders.map((o: any) => Number(o.id || 0))) + 1);

  const comps = this.components.value.map((c: any, i: number) => ({
    id: i + 1,
    modelNum: c.modelNum,
    name: c.name,
    units: c.units,
    note: c.note,
    price: c.price
  }));

  const newOrder = {
    id: nextId,
    createdAt: new Date().toISOString().split('T')[0],
    projectName: this.orderForm.value.projectName || null,
    supplierName: this.orderForm.value.supplierName || null,
    arrivedNeededTime: this.orderForm.value.arrivedNeededTime,
    totalPrice: this.calcTotalFromComponents(comps),
    createdBy: user?.fullNameArabic || '',
    status: 'قيد الدراسة',
    components: comps
  };

  this.dataSource.createDoc('orders', newOrder);
  this.filteredOrders.unshift(newOrder);
  this.cancelForm();
}




}
