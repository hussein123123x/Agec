import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';


@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/auth'; // adjust to your NestJS server URL

  public showPasswordDialog = false;
  public isLocked = false;
  constructor(private http: HttpClient, private router: Router, private auth: Auth) {}

  login(email: string, password: string): Observable<any> {
    console.log("🚀 ~ AuthService ~ login ~ password:", password)
    console.log("🚀 ~ AuthService ~ login ~ email:", email)
    const url = `${this.apiUrl}/login`;
    const body = {
        email, password
    }
    return this.http.post(url, body);
  }

  forgetPassword(email: string): Observable<any> {
    const url = `${this.apiUrl}/forget-password`;
    const body = { email };
    return this.http.post(url, body);
  }

  updatePassword(email: string, newPassword:string): Observable<any> {
    const url = `${this.apiUrl}/update-password`;
    const body = { email, newPassword };
    return this.http.post(url, body);
  }

  validateUser(email: string, password: string): Observable<any> {
    const url = `${this.apiUrl}/validateUser`;
    const body = { email, password };
    const headers = { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` };
    return this.http.post(url, body, { headers });
  }

  showLockScreen() {
    this.showPasswordDialog = true;
    this.isLocked = true;

    window.onbeforeunload = () => {
      this.signOut(); // Sign out on refresh if not unlocked
      return '';
    };
  }

  unlockApp() {
    this.showPasswordDialog = false;
    this.isLocked = false;
    sessionStorage.setItem('unlocked', 'true');
    window.onbeforeunload = null;
  }

  signOut() {
    localStorage.clear();
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }

  // optional
  getCurrentUserEmail(): string {
    return localStorage.getItem('email') || '';
  }
}
