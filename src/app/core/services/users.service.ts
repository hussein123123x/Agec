import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { BehaviorSubject, Observable } from 'rxjs';
import { Firestore, doc, updateDoc } from '@angular/fire/firestore';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';




@Injectable({
  providedIn: 'root',
})
export class UserService {
  private baseUrl = 'http://localhost:3000/users';
  private usersSubject = new BehaviorSubject<any[]>([]);
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$: Observable<any> = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private storage: Storage, private firestore: Firestore) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token') || '';
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  // Optional: manual setter
  setUser(user: any) {
    this.currentUserSubject.next(user);
  }

  // Optional: get current user synchronously
  getCurrentUser(): any {
    return this.currentUserSubject.value;
  }

  async createUser(data: any): Promise<any> {
    const url = `${this.baseUrl}/create`;
    const headers = this.getAuthHeaders();

    try {
      return await firstValueFrom(this.http.post(url, data, { headers }));
    } catch (error) {
      console.error('❌ createUser failed:', error);
      throw error;
    }
  }

  async getUsers(filters: any = {}): Promise<any[]> {
    const url = `${this.baseUrl}/getUsers`;
    const body = filters;
    const headers = this.getAuthHeaders();

    try {
      return await firstValueFrom(this.http.post<any[]>(url, body, { headers }));
    } catch (error) {
      console.error('❌ getUsers failed:', error);
      throw error;
    }
  }

  async getUser(email: string): Promise<any> {
    const url = `${this.baseUrl}/getUser`;
    const body = { email };
    const headers = this.getAuthHeaders();

    try {
      const user = await firstValueFrom(this.http.post(url, body, { headers }));
       this.currentUserSubject.next(user);
       return user
    } catch (error) {
      console.error('❌ getUser failed:', error);
      throw error;
    }
  }

  async updateUser(data: any): Promise<any> {
    const url = `${this.baseUrl}/updateUser`;
    const headers = this.getAuthHeaders();

    try {
      return await firstValueFrom(this.http.put(url, data, { headers }));
    } catch (error) {
      console.error('❌ updateUser failed:', error);
      throw error;
    }
  }

  async deleteUser(email: string): Promise<any> {
    const url = `${this.baseUrl}/deleteUser`;
    const body = { email };
    const headers = this.getAuthHeaders();

    try {
      return await firstValueFrom(
        this.http.request('delete', url, { body, headers })
      );
    } catch (error) {
      console.error('❌ deleteUser failed:', error);
      throw error;
    }
  }

  async requestVacation(userId: string, body: { days: string[]; type: string; reason: string }): Promise<any> {
    const url = `${this.baseUrl}/${userId}/vacation-request`;
    const headers = this.getAuthHeaders();

    try {
      return await firstValueFrom(this.http.post(url, body, { headers }));
    } catch (error) {
      console.error('❌ requestVacation failed:', error);
      throw error;
    }
  }

  async createEvent(userId: string, body: { name: string; date: string; description: string }): Promise<any> {
    const url = `${this.baseUrl}/${userId}/events`;
    const headers = this.getAuthHeaders();

    try {
      return await firstValueFrom(this.http.post(url, body, { headers }));
    } catch (error) {
      console.error('❌ createEvent failed:', error);
      throw error;
    }
  }

  async getEvents(userId: string): Promise<any[]> {
    const url = `${this.baseUrl}/${userId}/events`;
    const headers = this.getAuthHeaders();

    try {
      return await firstValueFrom(this.http.get<any[]>(url, { headers }));
    } catch (error) {
      console.error('❌ getEvents failed:', error);
      throw error;
    }
  }

  async calculateAbsences(userId: string, userEmail: string,startDate: string, endDate: string): Promise<any> {
    const url = `${this.baseUrl}/calculateAbsences`;
    const body = { userId, userEmail, startDate, endDate };
    const headers = this.getAuthHeaders();

    try {
      return await firstValueFrom(this.http.post(url, body, { headers }));
    } catch (error) {
      console.error('❌ calculateAbsences failed:', error);
      throw error;
    }
  }

  async uploadProfileImage(userId: string, file: File) {
    const storageRef = ref(this.storage, `profiles/${userId}.jpg`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);

    const userRef = doc(this.firestore, `users/${userId}`);
    await updateDoc(userRef, { profileImage: url });

    return url;
  }

  async updateEvent(userId: string, eventId: string, body: { name?: string; date?: string; action?: string }): Promise<any> {
    const url = `${this.baseUrl}/${userId}/events/${eventId}`;
    const headers = this.getAuthHeaders();

    try {
      return await firstValueFrom(this.http.patch(url, body, { headers }));
    } catch (error) {
      console.error('❌ updateEvent failed:', error);
      throw error;
    }
  }

  async deleteEvent(userId: string, eventId: string): Promise<any> {
    const url = `${this.baseUrl}/${userId}/events/${eventId}`;
    const headers = this.getAuthHeaders();

    try {
      return await firstValueFrom(this.http.delete(url, { headers }));
    } catch (error) {
      console.error('❌ deleteEvent failed:', error);
      throw error;
    }
  }

  // Update users list
  getSelectedUsers(): Observable<any[]> {
    return this.usersSubject.asObservable();
  }

  setUsers(users: any[]): void {
    this.usersSubject.next(users);
  }

  // Add single user
  addUser(user: any): void {
    const current = this.usersSubject.value;
    this.usersSubject.next([...current, user]);
  }

  // Optional: clear all users
  clearUsers(): void {
    this.usersSubject.next([]);
  }
}
