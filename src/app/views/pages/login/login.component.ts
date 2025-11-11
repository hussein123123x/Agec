import { Component, OnInit } from '@angular/core';
import { NgStyle } from '@angular/common';
import { IconDirective } from '@coreui/icons-angular';
import { ContainerComponent, RowComponent, ColComponent, CardGroupComponent, TextColorDirective, CardComponent, CardBodyComponent, FormDirective, InputGroupComponent, InputGroupTextDirective, FormControlDirective, ButtonDirective } from '@coreui/angular';
import { Router, Routes } from '@angular/router';
import { AuthService } from './login.service';
import { FormsModule, NgModel } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    imports: [ContainerComponent, RowComponent, FormsModule,  ColComponent, CardGroupComponent, TextColorDirective, CardComponent, CardBodyComponent, FormDirective, InputGroupComponent, InputGroupTextDirective, IconDirective, FormControlDirective, ButtonDirective, NgStyle]
})
export class LoginComponent implements OnInit {
  email: string = '';
  password: string = '';
  constructor(private router: Router, private authService: AuthService, private toastr: ToastrService ) { }


  ngOnInit(): void {
    history.pushState(null, '', location.href);
    window.onpopstate = () => {
      history.pushState(null, '', location.href); // disable back
    };
  }


  login() {
  this.authService.login(this.email, this.password).subscribe({
    next: (res) => {
      console.log("🚀 ~ LoginComponent ~ login ~ res:", res);

      localStorage.setItem('access_token', res.access_token);
      localStorage.setItem('reset_password', res.isResetPassword);
      localStorage.setItem('email', this.email);
      if (res.success == false) {
        this.toastr.error('يرجى التحقق من اسم المستخدم وكلمة المرور', 'تنبيه');
      } else if (res.isResetPassword || res.isNewMember) {
        this.router.navigate(['/reset-password'], { replaceUrl: true });
      } else {
        this.router.navigate(['/dashboard'], { replaceUrl: true });

        // 🔒 Show lock screen if user is still marked as locked
        if (res.isLocked) {
          this.authService.showLockScreen(); // 👈 Trigger lock popup
        } else {
          sessionStorage.setItem('unlocked', 'true'); // App is fully unlocked
        }

        console.log('Login successful!');
      } 
    },
    error: (err) => {
      this.toastr.error('يرجى التحقق من اسم المستخدم وكلمة المرور', 'تنبيه');
      console.error('Login failed:', err);
    },
  });
}


  forgotPassword() {
    console.log('ForgotPassword ....')
    if(confirm('هل انت متاكد انك تريد استعادة كلمة المرور ؟')){
      this.authService.forgetPassword(this.email).subscribe({
        next: (res) => {
          console.log('Password recovery successful!');
          this.toastr.success('   تم استعادة كلمة المرور بنجاح سوف يتم ارسال كلمه المرور الجديدة الى موظف الموارد البشرية', 'تنبيه');
        },
        error: (err) => {
          console.error('Password recovery failed:', err);
        },
      })
    }
  }
}
