import { Injectable } from '@nestjs/common';
import moment from 'moment';
import { FirebaseService } from 'src/core/firebase/firebase.service';
import { google } from 'googleapis';
import * as stream from 'stream';
import { oAuth2Client } from 'src/core/drive/google-drive.service';


@Injectable()
export class ProjectsService {
    constructor(private firebaseService: FirebaseService) {}
    private drive = google.drive({ version: 'v3', auth: oAuth2Client });


    private get projectCollection() {
        return this.firebaseService.getFirestore().collection('projects');
    }

  
    async getProjects(body:any) {
        const snapshot = await this.projectCollection.get();
        snapshot.docs.forEach(d => console.log(d.id, d.data()));
        return snapshot.docs.map(doc => ({
            id: doc.id, 
            ...doc.data()
        }));
    }

    async createProject(body:any){
      const { projectName, projectCost, client, consultantName, consultantPhone, projectNumber, productEngineerName, studyEngineerName, deliveryDate, extraDetails } = body;
      const now = moment().format("YYYY-MM-DD HH:mm:ss");  
      const newProject = {
            projectName,
            projectCost,
            client,
            consultantName,
            consultantPhone,
            productEngineerName,
            studyEngineerName,
            deliveryDate,
            extraDetails,
            projectNumber,
            createdAt: now,
            history: [
                {
                    action: 'create',
                    date: now,
                    data: body, 
                }
            ]
        };

        const docRef = await this.projectCollection.add(newProject);
        return { id: docRef.id, ...newProject };
    }
}

