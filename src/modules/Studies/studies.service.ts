import { Injectable } from '@nestjs/common';
import moment from 'moment';
import { FirebaseService } from 'src/core/firebase/firebase.service';
import { google } from 'googleapis';
import * as stream from 'stream';
import { oAuth2Client } from 'src/core/drive/google-drive.service';


@Injectable()
export class StudiesService {
    constructor(private firebaseService: FirebaseService) {}
    private drive = google.drive({ version: 'v3', auth: oAuth2Client });


    private get studyCollection() {
        return this.firebaseService.getFirestore().collection('studies');
    }

    async createStudy(body:any){
      const { projectName, projectCost, client, consultantName, consultantPhone, projectNumber, studyEngineerName, productEngineerName, deliveryDate, extraDetails } = body;
      const now = moment().format("YYYY-MM-DD HH:mm:ss");  
      const newStudy = {
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
            createdAt: now,
            history: [
                {
                    action: 'create',
                    date: now,
                    data: body, 
                }
            ]
        };

        const docRef = await this.studyCollection.add(newStudy);
        return { id: docRef.id, ...newStudy };
    }
    async getStudies(body:any) {
        const snapshot = await this.studyCollection.get();
        snapshot.docs.forEach(d => console.log(d.id, d.data()));
        return snapshot.docs.map(doc => ({
            id: doc.id, 
            ...doc.data()
        }));
    }
    // Backend NestJS

    async updateStudy(id: string, updatedData: any, username: string) {
  const docRef = this.studyCollection.doc(id);
  const docSnap = await docRef.get();

  if (!docSnap.exists) {
    throw new Error('Study not found');
  }

  const currentData:any = docSnap.data();
  const changes: any = {};

  // Build "from -> to" for only changed fields
  for (const key in updatedData) {
    if (
      key !== 'history' &&
      key !== 'updatedAt' &&
      updatedData[key] !== currentData[key]
    ) {
      changes[key] = {
        from: currentData[key],
        to: updatedData[key]
      };
    }
  }

  if (Object.keys(changes).length === 0) {
    return { message: 'No changes detected' };
  }

  const now = moment().format('YYYY-MM-DD HH:mm:ss');

  // Prepare history entry
  const historyEntry = {
    action: 'update',
    data: changes,      // each field has { from, to }
    updatedAt: now,
    username: username || 'unknown'
  };

  // Update the document
  await docRef.update({
    ...updatedData,
    updatedAt: now,
    history: [...(currentData.history || []), historyEntry]
  });

  return { id, ...updatedData, updatedAt: now };
}
 
async uploadStudyFiles(files: any, body: any) {
  console.log("🚀 ~ StudiesService ~ uploadStudyFiles ~ body:", body)
  console.log("🚀 ~ StudiesService ~ uploadStudyFiles ~ files:", files)
  
    const {
      projectName,
      projectCost,
      client,
      projectNumber,
      consultantName,
      consultantPhone,
      studyEngineerName,
      productEngineerName,
      deliveryDate,
      extraDetails
    } = body;

    
    // رفع ملف النموذج المالي
    let financialModelFileUrl = '';
    if (files.financialModelFile?.length) {
      const file = files.financialModelFile[0];
      const bufferStream = new stream.PassThrough();
      bufferStream.end(file.buffer);
      let driveResponse: any;
      try {
       driveResponse = await this.drive.files.create({
        requestBody: {
          name: file.originalname,
          parents: ['1ES9GqLifB7qILBn3_rTNWIbBWQIo9IVZ'],
        },
        media: {
          mimeType: file.mimetype,
          body: bufferStream,
        },
      });
      } catch (error) {
        console.log(error);
      }

      financialModelFileUrl = `https://drive.google.com/file/d/${driveResponse.data.id}/view`;
    }

    // رفع الملفات الإضافية
    const extraFilesUrls: string[] = [];
    let driveResponse: any;
    if (files.extraFiles?.length) {
      for (const file of files.extraFiles) {
        const bufferStream = new stream.PassThrough();
        bufferStream.end(file.buffer);
        try {
         driveResponse = await this.drive.files.create({
          requestBody: {
            name: file.originalname,
            parents: ['1ES9GqLifB7qILBn3_rTNWIbBWQIo9IVZ'],  // حط هنا الـ Folder ID
          },
          media: {
            mimeType: file.mimetype,
            body: bufferStream,
          },
        });
      } catch (error) {
        console.log(error);
      }   

        extraFilesUrls.push(`https://drive.google.com/file/d/${driveResponse.data.id}/view`);
      }
    }

    console.log('🚀 financialModelFileUrl:', financialModelFileUrl);
console.log('🚀 extraFilesUrls:', extraFilesUrls);

    // حفظ الداتا في Firestore
    const newStudy = {
      projectName,
      projectCost,
      client,
      projectNumber,
      consultantName,
      consultantPhone,
      studyEngineerName,
      productEngineerName,
      deliveryDate,
      extraDetails,
      financialModelFileUrl,
      extraFilesUrls,
      createdAt: new Date(),
      history:[]
    };


    const docRef = await this.studyCollection.add(newStudy);
    return { id: docRef.id, ...newStudy };
  }

}

