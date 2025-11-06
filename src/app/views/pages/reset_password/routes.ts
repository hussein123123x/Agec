import { Routes } from '@angular/router';
import { ResetPassword } from './reset_password.component';

export const routes: Routes = [
  {
    path: '',
    component: ResetPassword,
    data: {
      title: 'Reset Password'
    }
  }
];
