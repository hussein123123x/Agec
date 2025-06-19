import { Routes } from '@angular/router';
import { ProductionComponent } from './production.component';

export const routes: Routes = [
  {
    path: '',
    component: ProductionComponent,
    data: {
      title: 'Production'
    }
  }
];
