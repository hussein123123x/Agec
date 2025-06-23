import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IconDirective, IconModule } from '@coreui/icons-angular';
import {
  CardComponent,
  CardHeaderComponent,
  CardBodyComponent,
  RowComponent,
  ColComponent,
  WidgetStatCComponent
} from '@coreui/angular';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [
    CommonModule,
    IconModule,
    ReactiveFormsModule,
    IconDirective,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    RowComponent,
    ColComponent,
    WidgetStatCComponent,
  ],
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss']
})
export class InventoryComponent {
  totalProducts = 150;
totalProductsList = [
  { name: 'كمبيوتر محمول HP', code: 'HP123', quantity: 25, price: 18500, location: 'الفرع الرئيسي', image: 'assets/images/products/laptop.png' },
  { name: 'طابعة ليزر', code: 'PR456', quantity: 12, price: 3500, location: 'فرع الغربية', image: 'assets/images/products/printer.png' },
  { name: 'ماسح ضوئي', code: 'SC789', quantity: 7, price: 2700, location: 'فرع الشرقية', image: 'assets/images/products/scanner.png' },
  { name: 'شاشة سامسونج', code: 'SM241', quantity: 18, price: 2200, location: 'الفرع الرئيسي', image: 'assets/images/products/monitor.png' },
  { name: 'قرص صلب', code: 'HD321', quantity: 50, price: 950, location: 'فرع الجنوب', image: 'assets/images/products/hdd.png' },
  { name: 'فأرة لاسلكية', code: 'MS654', quantity: 33, price: 180, location: 'فرع الغربية', image: 'assets/images/products/mouse.png' },
  { name: 'لوحة مفاتيح', code: 'KB987', quantity: 40, price: 220, location: 'فرع الشرقية', image: 'assets/images/products/keyboard.png' },
  { name: 'كاميرا ويب', code: 'WB741', quantity: 15, price: 500, location: 'الفرع الرئيسي', image: 'assets/images/products/webcam.png' },
  { name: 'سماعات رأس', code: 'HP852', quantity: 22, price: 320, location: 'فرع الجنوب', image: 'assets/images/products/headphones.png' },
  { name: 'UPS', code: 'UP963', quantity: 5, price: 1450, location: 'فرع الشرقية', image: 'assets/images/products/ups.png' },
];


lowStockItems = [
  { name: 'طابعة ليزر', code: 'PR456', quantity: 3, min: 5, image: 'https://cdn-icons-png.flaticon.com/512/809/809957.png' },
  { name: 'فأرة لاسلكية', code: 'MS123', quantity: 2, min: 10, image: 'https://cdn-icons-png.flaticon.com/512/149/149995.png' },
  { name: 'قرص صلب', code: 'HD321', quantity: 1, min: 6, image: 'https://cdn-icons-png.flaticon.com/512/4149/4149654.png' },
  { name: 'شاشة عرض', code: 'SM888', quantity: 4, min: 7, image: 'https://cdn-icons-png.flaticon.com/512/168/168882.png' },
  { name: 'كاميرا ويب', code: 'WB741', quantity: 0, min: 3, image: 'https://cdn-icons-png.flaticon.com/512/747/747376.png' },
  { name: 'لوحة مفاتيح', code: 'KB963', quantity: 2, min: 5, image: 'https://cdn-icons-png.flaticon.com/512/777/777197.png' },
  { name: 'سماعات رأس', code: 'HP852', quantity: 1, min: 4, image: 'https://cdn-icons-png.flaticon.com/512/1828/1828961.png' },
  { name: 'UPS', code: 'UP741', quantity: 0, min: 2, image: 'https://cdn-icons-png.flaticon.com/512/1042/1042267.png' },
  // أضف المزيد حسب الحاجة
];

lowStockCount = this.lowStockItems.length;


transactionsHistory = [
  { date: new Date('2025-06-18T09:00:00'), type: 'إضافة', product: 'كمبيوتر محمول HP', quantity: 25, store: 'المخزن الرئيسي', user: 'أحمد علي', project: 'مشروع التحديث التقني' },
  { date: new Date('2025-06-18T10:30:00'), type: 'سحب', product: 'طابعة ليزر', quantity: 5, store: 'مخزن الفرع الغربي', user: 'منى صالح', project: 'مشروع الطباعة المؤسسية' },
  { date: new Date('2025-06-17T14:15:00'), type: 'تحويل', product: 'ماسح ضوئي', quantity: 3, store: 'من الرئيسي إلى الفرع الشرقي', user: 'علي خالد', project: 'مشروع التحول الرقمي' },
  { date: new Date('2025-06-17T08:20:00'), type: 'إضافة', product: 'أحبار طابعة', quantity: 40, store: 'المخزن الرئيسي', user: 'نورا محمد', project: 'مشروع الطباعة المؤسسية' },
  { date: new Date('2025-06-16T11:00:00'), type: 'سحب', product: 'كابل HDMI', quantity: 12, store: 'مخزن فرعي', user: 'خالد إبراهيم', project: 'مشروع المؤتمرات' },
  { date: new Date('2025-06-16T13:45:00'), type: 'إضافة', product: 'شاشة سامسونج 24 بوصة', quantity: 15, store: 'مخزن الأجهزة', user: 'ليلى محمود', project: 'مشروع التعليم الإلكتروني' },
  { date: new Date('2025-06-15T16:10:00'), type: 'تحويل', product: 'جهاز راوتر', quantity: 6, store: 'من الفرع الغربي إلى الرئيسي', user: 'طارق سمير', project: 'مشروع الشبكات' }
];



  inventory = [
    {
      name: 'طابعة HP',
      image: 'assets/images/products/printer.jpg',
      code: 'PRT001',
      category: 'أجهزة',
      unit: 'قطعة',
      quantity: 20,
      minQuantity: 5,
      price: 1500,
      location: 'مخزن القاهرة',
      barcode: '123456789012',
      createdAt: new Date('2024-05-01'),
      notes: 'منتج دائم الطلب',
      min: 3
    },
    {
      name: 'حبر أسود',
      image: 'assets/images/products/ink.jpg',
      code: 'INK001',
      category: 'مستهلكات',
      unit: 'علبة',
      quantity: 10,
      minQuantity: 15,
      price: 200,
      location: 'مخزن الإسكندرية',
      barcode: '123456789013',
      createdAt: new Date('2024-06-01'),
      notes: 'ينفد بسرعة',
      min: 3
    },
    {
      name: 'ورق A4',
      image: 'assets/images/products/paper.jpg',
      code: 'PAP001',
      category: 'مستلزمات مكتبية',
      unit: 'رم',
      quantity: 500,
      minQuantity: 100,
      price: 0.2,
      location: 'مخزن القاهرة',
      barcode: '123456789014',
      createdAt: new Date('2024-04-10'),
      notes: '',
      min: 3
    }
  ];

  showModal = signal(false);
  selectedProduct: any = null;
  productForm: FormGroup;
  editMode = false;

  constructor(private fb: FormBuilder) {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      code: ['', Validators.required],
      category: [''],
      unit: [''],
      quantity: [0, Validators.min(0)],
      minQuantity: [0, Validators.min(0)],
      price: [0, Validators.min(0)],
      location: [''],
      barcode: [''],
      notes: ['']
    });
  }

  openForm(product: any = null) {
    this.editMode = !!product;
    this.selectedProduct = product;
    if (product) {
      this.productForm.patchValue(product);
    } else {
      this.productForm.reset();
      this.productForm.patchValue({
        barcode: this.generateBarcode(),
        createdAt: new Date()
      });
    }
    this.showModal.set(true);
  }

  save() {
    if (this.productForm.valid) {
      const data = this.productForm.value;
      data.createdAt = data.createdAt || new Date();
      if (this.editMode && this.selectedProduct) {
        Object.assign(this.selectedProduct, data);
      } else {
        data.image = 'assets/images/products/default.jpg';
        this.inventory.push(data);
      }
      this.showModal.set(false);
      this.selectedProduct = null;
    }
  }

  delete(product: any) {
    this.inventory = this.inventory.filter(p => p !== product);
  }

  getTotalItems() {
    return this.inventory.length;
  }

  getLowStockItems() {
    return this.inventory.filter(p => p.quantity < p.minQuantity).length;
  }

  getTotalValue() {
    return this.inventory.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }

  getOutOfStockItems() {
    return this.inventory.filter(p => p.quantity === 0);
  }

  generateBarcode(): string {
    return Math.floor(100000000000 + Math.random() * 900000000000).toString();
  }
}
