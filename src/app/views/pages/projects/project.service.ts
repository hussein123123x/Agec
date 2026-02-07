import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
    private projectUrl = 'http://localhost:3000/projects';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token') || '';
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
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

  async getProjects(){
    const url = `${this.projectUrl}/getProjects`;
    const headers = this.getAuthHeaders();
    try {
      return await firstValueFrom(this.http.post<any[]>(url, {}, { headers }));
    } catch (error) {
      console.error('❌ getUsers failed:', error);
      throw error;
    }
  }





}