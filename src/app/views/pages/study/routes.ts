import { Routes } from '@angular/router';
import { StudyComponent } from './study.component';

export const routes: Routes = [
  {
    path: '',
    component: StudyComponent,
    data: {
      title: ''
    }
  }
];
