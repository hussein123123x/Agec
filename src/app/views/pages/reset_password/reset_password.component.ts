import { Component, ElementRef, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { CommonModule, NgStyle } from '@angular/common';
import { ChartjsComponent } from '@coreui/angular-chartjs';
import { IconDirective } from '@coreui/icons-angular';


import {
  CardComponent, CardHeaderComponent, CardBodyComponent,
  RowComponent, ColComponent, WidgetStatCComponent,
  ButtonGroupComponent,
  FormCheckLabelDirective,
  AvatarComponent,
  ButtonDirective,
  CardFooterComponent,
  GutterDirective,
  ProgressComponent,
  TableDirective,
  BadgeComponent,
  CardGroupComponent,
  ContainerComponent,
  FormControlDirective,
  FormDirective,
  InputGroupComponent,
  InputGroupTextDirective,
  TextColorDirective
} from '@coreui/angular';
import { Chart } from 'chart.js/auto';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../login/login.service';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-accounting',
  standalone: true,
  imports: [
     ReactiveFormsModule,
    FormsModule,
    CommonModule,
    ContainerComponent, RowComponent, FormsModule,  ColComponent, CardGroupComponent, TextColorDirective, CardComponent, CardBodyComponent, FormDirective, InputGroupComponent, InputGroupTextDirective, IconDirective, FormControlDirective, ButtonDirective, NgStyle
  ],
  templateUrl: './reset_password.component.html',
  styleUrls: ['./reset_password.component.scss']
})
export class ResetPassword implements OnInit {
  
  newPassword: string = '';
  confirmPassword: string = '';
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;


  constructor(private router: Router, private authService: AuthService, private toastr: ToastrService){}

  ngOnInit(): void {
    history.pushState(null, '', location.href);
    window.onpopstate = () => {
      history.pushState(null, '', location.href); // disable back
    };
  }


resetPassword() {
  if (this.newPassword !== this.confirmPassword) {
    this.toastr.error('كلمتا المرور غير متطابقتين', 'تنبيه');
    return;
  }

  const email:any = localStorage.getItem('email');

  // Add your API call here
  this.authService.updatePassword(email, this.newPassword).subscribe({
    next: () => {
      localStorage.setItem('reset_password', 'false');
      this.toastr.success('تم تحديث كلمة المرور بنجاح');
      this.router.navigate(['/dashboard']);
    },
    error: (err:any) => {
      this.toastr.error('حدث خطأ أثناء تحديث كلمة المرور', 'خطأ');
      console.error(err);
    }
  });
}

}
