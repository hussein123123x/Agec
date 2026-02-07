import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StudyService {
    private baseUrl = 'http://localhost:3000/study';
    private projectUrl = 'http://localhost:3000/projects';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token') || '';
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  async getStudy(){
    const url = `${this.baseUrl}/getStudies`;
    const headers = this.getAuthHeaders();

    try {
      return await firstValueFrom(this.http.post<any[]>(url, {}, { headers }));
    } catch (error) {
      console.error('❌ getUsers failed:', error);
      throw error;
    }
  }

  async createStudy(data:any){
    const url = `${this.baseUrl}/createStudy`;
    const headers = this.getAuthHeaders();
    const { projectName, projectCost, client, consultantName, consultantPhone, projectNumber, studyEngineerName, productEngineerName, deliveryDate, extraDetails } = data;
 
    const body = {
        projectName,
        projectCost,
        client,
        consultantName,
        consultantPhone,
        studyEngineerName,
        productEngineerName,
        deliveryDate,
        extraDetails,
        projectNumber,
    }
    try {
      return await firstValueFrom(this.http.post<any[]>(url, body, { headers }));
    } catch (error) {
      console.error('❌ getUsers failed:', error);
      throw error;
    }
  }

  async createProject(data:any){
    const url = `${this.projectUrl}/createProject`;
    const headers = this.getAuthHeaders();
    const { projectName, projectCost, client, consultantName, consultantPhone, projectNumber, studyEngineerName, productEngineerName, deliveryDate, extraDetails } = data;
 
    const body = {
        projectName,
        projectCost,
        client,
        consultantName,
        consultantPhone,
        studyEngineerName,
        productEngineerName,
        deliveryDate,
        extraDetails,
        projectNumber,
    }
    console.log("🚀 ~ StudyService ~ createProject ~ body:", body)
    try {
      return await firstValueFrom(this.http.post<any[]>(url, body, { headers }));
    } catch (error) {
      console.error('❌ getUsers failed:', error);
      throw error;
    }
  }

  async updateStudy(id: string, data: any, username:string) {
    console.log("🚀 ~ StudyService ~ updateStudy ~ username:", username)
    const url = `${this.baseUrl}/updateStudy`; 
    const headers = this.getAuthHeaders();

    const body = {
      id, // include the document ID
      username,
      ...data // spread the rest of the fields
    };

    try {
      return await firstValueFrom(this.http.put<any>(url, body, { headers }));
    } catch (error) {
      console.error('❌ updateStudy failed:', error);
      throw error;
    }
  }

  async uploadStudyFiles(formData: FormData) {
    const url = `${this.baseUrl}/uploadStudyFiles`;
    const headers = this.getAuthHeaders();
    try {
      return await firstValueFrom(this.http.post(url, formData, { headers }));
    } catch (error) {
      console.error('❌ uploadStudyFiles failed:', error);
      throw error;
    }
  }




}