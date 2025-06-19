import { Routes } from '@angular/router';
import { AccountingComponent } from './accounting.component';

export const routes: Routes = [
  {
    path: '',
    component: AccountingComponent,
    data: {
      title: 'Accounting'
    }
  }
];
