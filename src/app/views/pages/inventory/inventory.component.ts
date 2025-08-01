import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IconDirective, IconModule } from '@coreui/icons-angular';
import { FormsModule } from '@angular/forms';

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
    FormsModule,
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
  activeTab: string = 'stores';
  activeStoreTab: string = 'general'; // التبويب الفرعي للمخازن
  expandedProjectId: number | null = null;

totalProductsList = [
  {
    name: 'قاطع رئيسي MCCB 400A',
    code: 'LV001',
    quantity: 25,
    price: 1850,
    location: 'الفرع الرئيسي',
    image: 'assets/images/products/mccb.png',
    voltageLevel: 'LV',
    category: 'قواطع كهربائية',
    min: 5,
  },
  {
    name: 'قاطع فرعي MCB 32A',
    code: 'LV002',
    quantity: 40,
    price: 120,
    location: 'فرع الغربية',
    image: 'assets/images/products/mcb.png',
    voltageLevel: 'LV',
    category: 'قواطع كهربائية',
    min: 10,
  },
  {
    name: 'كونتاكتور 24V',
    code: 'LV003',
    quantity: 30,
    price: 350,
    location: 'فرع الشرقية',
    image: 'assets/images/products/contactor.png',
    voltageLevel: 'LV',
    category: 'حمايات وتحكم',
    min: 30,
  },
  {
    name: 'بار نحاسي 10x30 مم',
    code: 'LV004',
    quantity: 100,
    price: 90,
    location: 'الفرع الرئيسي',
    image: 'assets/images/products/copperbar.png',
    voltageLevel: 'LV',
    category: 'نحاس وتوصيلات',
    min: 50,
  },
  {
    name: 'مفتاح تحميل RMU 11kV',
    code: 'MV001',
    quantity: 10,
    price: 4500,
    location: 'فرع الجنوب',
    image: 'assets/images/products/rmu.png',
    voltageLevel: 'MV',
    category: 'قواطع كهربائية',
    min: 30,
  },
  {
    name: 'قاطع داخلي VCB 11kV',
    code: 'MV002',
    quantity: 8,
    price: 8200,
    location: 'فرع الغربية',
    image: 'assets/images/products/vcb.png',
    voltageLevel: 'MV',
    category: 'قواطع كهربائية',
    min: 10,
  },
  {
    name: 'محول تيار CT 400/5',
    code: 'MV003',
    quantity: 15,
    price: 600,
    location: 'فرع الشرقية',
    image: 'assets/images/products/ct.png',
    voltageLevel: 'MV',
    category: 'محولات',
    min: 2,
  },
  {
    name: 'محول جهد PT 11kV/110V',
    code: 'MV004',
    quantity: 12,
    price: 950,
    location: 'الفرع الرئيسي',
    image: 'assets/images/products/pt.png',
    voltageLevel: 'MV',
    category: 'محولات',
    min: 20,
  },
  {
    name: 'ريليه حماية SEPAM',
    code: 'MV005',
    quantity: 6,
    price: 3200,
    location: 'فرع الجنوب',
    image: 'assets/images/products/relay.png',
    voltageLevel: 'MV',
    category: 'حمايات وتحكم',
    min: 5,
  },
  {
    name: 'لمبة بيان LED حمراء',
    code: 'LV005',
    quantity: 50,
    price: 30,
    location: 'فرع الشرقية',
    image: 'assets/images/products/led.png',
    voltageLevel: 'LV',
    category: 'إشارات وعدادات',
    min: 10,
  }
];

reversedProductsList = [
  {
    name: 'قاطع رئيسي MCCB 400A',
    code: 'LV001',
    quantity: 50,
    revers: 15,
    category: 'قواطع كهربائية',
    project: 'العاصمة الإدارية - مجمع الوزارات',
    remain: 35,
  },
  {
    name: 'قاطع فرعي MCB 32A',
    code: 'LV002',
    quantity: 100,
    revers: 30,
    category: 'قواطع كهربائية',
    project: 'جامعة القاهرة - كلية العلوم',
    remain: 70,
  },
  {
    name: 'محول تيار CT 600/5',
    code: 'MV001',
    quantity: 20,
    revers: 8,
    category: 'محولات',
    project: 'محطة كهرباء بدر - خط توزيع صناعي',
    remain: 12,
  },
  {
    name: 'ريليه حماية SEPAM S40',
    code: 'MV002',
    quantity: 10,
    revers: 4,
    category: 'حمايات وتحكم',
    project: 'محطة مترو العتبة - لوحة رئيسية',
    remain: 6,
  },
  {
    name: 'بار نحاسي 20x5 مم',
    code: 'LV003',
    quantity: 150,
    revers: 50,
    category: 'نحاس وتوصيلات',
    project: 'مجمع التحرير - إعادة تأهيل كهربائي',
    remain: 100,
  },
  {
    name: 'لمبة بيان LED 24V خضراء',
    code: 'LV004',
    quantity: 80,
    revers: 20,
    category: 'إشارات وعدادات',
    project: 'مستشفى القصر العيني - مبنى العمليات',
    remain: 60,
  },
  {
    name: 'محول جهد PT 11kV/110V',
    code: 'MV003',
    quantity: 18,
    revers: 6,
    category: 'محولات',
    project: 'مدينة نصر - محطة توزيع رئيسية',
    remain: 12,
  },
  {
    name: 'كونتاكتور 24V - 3 Pole',
    code: 'LV005',
    quantity: 60,
    revers: 18,
    category: 'حمايات وتحكم',
    project: 'هيئة المترو - ورشة صيانة العباسية',
    remain: 42,
  },
  {
    name: 'عداد طاقة رقمي 3 Phase',
    code: 'LV006',
    quantity: 35,
    revers: 10,
    category: 'إشارات وعدادات',
    project: 'مول كايرو فيستيفال - مركز التحكم',
    remain: 25,
  },
  {
    name: 'قاطع داخلي VCB 11kV',
    code: 'MV004',
    quantity: 12,
    revers: 3,
    category: 'قواطع كهربائية',
    project: 'العاصمة الإدارية - محطة كهرباء الحي الحكومي',
    remain: 9,
  },
];

finishedProductsList = [
  {
    name: 'لوحة إنارة رئيسية 250A - 18 دائرة',
    code: 'LV1001',
    quantity: 5,
    project: 'العاصمة الإدارية - مجمع الوزارات',
    coast: 6700
  },
  {
    name: 'لوحة ATS تحويل أوتوماتيكي 400A',
    code: 'LV1002',
    quantity: 2,
    project: 'مستشفى القصر العيني - مبنى الطوارئ',
    coast: 9200
  },
  {
    name: 'لوحة توزيع قوة 630A - 3 Phase',
    code: 'LV1003',
    quantity: 4,
    project: 'جامعة القاهرة - كلية الهندسة',
    coast: 11200
  },
  {
    name: 'لوحة DB فرعية 63A - 12 خط',
    code: 'LV1004',
    quantity: 8,
    project: 'مول كايرو فيستيفال - المبنى الإداري',
    coast: 2800
  },
  {
    name: 'لوحة MDB رئيسية 800A - 4 خانات',
    code: 'LV1005',
    quantity: 3,
    project: 'العاصمة الإدارية - محطة كهرباء الحي الدبلوماسي',
    coast: 14800
  }
];




searchTerm: string = '';
reversedSearchTerm: string = '';
finishedSearchTerm: string = '';

projects = [
  {
    id: 1,
    name: 'توريد لوحات توزيع جهد متوسط لمجمع سكني',
    owner: 'شركة المجمعات الحديثة',
    startDate: '2025-02-10',
    dueDate: '2025-05-20',
    status: 'مكتمل',
    products: [
      { name: 'RMU لوحات توزيع 11 ك.ف.', inStock: true, quantityRequired: 3, quantityAvailable: 20 },
      { name: 'كابلات جهد متوسط 3x70mm', inStock: true, quantityRequired: 44, quantityAvailable: 20 }
    ],
  },
  {
    id: 2,
    name: 'مشروع إنارة الطرق في حي النرجس',
    owner: 'أمانة العاصمة',
    startDate: '2025-03-01',
    dueDate: '2025-06-15',
    status: 'قيد التنفيذ',
    products: [
      { name: 'أعمدة إنارة 9 متر', inStock: true, quantityRequired: 50, quantityAvailable: 20 },
      { name: 'كشافات LED 150 واط', inStock: false, quantityRequired: 50, quantityAvailable: 20 }
    ],
  },
  {
    id: 3,
    name: 'تركيب محولات كهربائية لمصنع النسيج',
    owner: 'شركة النسيج الوطنية',
    startDate: '2025-01-20',
    dueDate: '2025-04-30',
    status: 'متأخر',
    products: [
      { name: 'محول 500 ك.ف.', inStock: true, quantityRequired: 2, quantityAvailable: 10 },
      { name: 'قواطع حماية 11 ك.ف.', inStock: false, quantityRequired: 4, quantityAvailable: 20 }
    ],
  },
  {
    id: 4,
    name: 'تحسين شبكة الكهرباء في حي الروضة',
    owner: 'وزارة الطاقة',
    startDate: '2025-05-01',
    dueDate: '2025-08-01',
    status: 'قيد التنفيذ',
    products: [
      { name: 'أسلاك نحاسية 3x150mm', inStock: false, quantityRequired: 100, quantityAvailable: 200 },
      { name: 'عدادات ذكية', inStock: true, quantityRequired: 200, quantityAvailable: 300 }
    ],
  }
];




lowStockItems = [
  { name: 'كونتاكتور 24V', code: 'LV003', quantity: 2, req:33, min: 5, image: 'https://cdn-icons-png.flaticon.com/512/971/971882.png', voltageLevel: 'LV', project: "توريد لوحات توزيع جهد متوسط لمجمع سكني" },
  { name: 'قاطع داخلي VCB 11kV', code: 'MV002', quantity: 1, req:6, min: 3, image: 'https://cdn-icons-png.flaticon.com/512/806/806171.png', voltageLevel: 'MV', project: 'مشروع إنارة الطرق في حي النرجس' },
  { name: 'بار نحاسي 10x30 مم', code: 'LV004', quantity: 3, req:14, min: 10, image: 'https://cdn-icons-png.flaticon.com/512/1006/1006771.png', voltageLevel: 'LV', project: 'مشروع إنارة الطرق في حي النرجس' },
  { name: 'قاطع فرعي MCB 32A', code: 'LV002', quantity: 4, req:50, min: 10, image: 'https://cdn-icons-png.flaticon.com/512/806/806177.png', voltageLevel: 'LV', project: 'تركيب محولات كهربائية لمصنع النسيج' },
  { name: 'لمبة بيان LED حمراء', code: 'LV005', quantity: 1, req:13, min: 10, image: 'https://cdn-icons-png.flaticon.com/512/2913/2913606.png', voltageLevel: 'LV', project: 'تحسين شبكة الكهرباء في حي الروضة' },
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

  get filteredProducts() {
  const term = this.searchTerm.toLowerCase().trim();

  if (!term) {
    return this.totalProductsList;
  }

  return this.totalProductsList.filter(item =>
    item.name.toLowerCase().includes(term) ||
    item.code.toLowerCase().includes(term) ||
    item.category.toLowerCase().includes(term)
  );
}

get filteredReversedProducts() {
  const term = this.reversedSearchTerm.toLowerCase().trim();

  if (!term) {
    return this.reversedProductsList;
  }

  return this.reversedProductsList.filter(item =>
    item.name.toLowerCase().includes(term) ||
    item.code.toLowerCase().includes(term) ||
    item.category.toLowerCase().includes(term) ||
    item.project.toLowerCase().includes(term)
  );
}

get filteredFinishedProducts() {
  const term = this.finishedSearchTerm.toLowerCase().trim();

  if (!term) {
    return this.finishedProductsList;
  }

  return this.finishedProductsList.filter(item =>
    item.name.toLowerCase().includes(term) ||
    item.code.toLowerCase().includes(term) ||
    item.project.toLowerCase().includes(term)
  );
}

  toggleProject(id: number) {
  this.expandedProjectId = this.expandedProjectId === id ? null : id;
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
