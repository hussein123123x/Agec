import { Routes } from '@angular/router';
import { DocsComponent } from './docs.component';

export const routes: Routes = [
  {
    path: '',
    component: DocsComponent,
    data: {
      title: 'Docs'
    }
  }
];
