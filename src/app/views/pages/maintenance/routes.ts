import { Routes } from '@angular/router';
import { MaintenanceComponent } from './maintenance.component';

export const routes: Routes = [
  {
    path: '',
    component: MaintenanceComponent,
    data: {
      title: 'Maintenance'
    }
  }
];
