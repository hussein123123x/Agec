import { Routes } from '@angular/router';
import { InventoryComponent } from './inventory.component';

export const routes: Routes = [
  {
    path: '',
    component: InventoryComponent,
    data: {
      title: 'Inventory'
    }
  }
];
