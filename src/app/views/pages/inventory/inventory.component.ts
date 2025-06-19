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
