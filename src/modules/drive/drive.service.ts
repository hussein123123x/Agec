import { Injectable } from '@nestjs/common';
import moment from 'moment';
import { FirebaseService } from 'src/core/firebase/firebase.service';
import { google } from 'googleapis';
import * as fs from 'fs';
import { oAuth2Client } from 'src/core/drive/google-drive.service';


@Injectable()
export class DriveService {
    constructor(private firebaseService: FirebaseService) {}
      drive = google.drive({ version: 'v3', auth: oAuth2Client });

      async  uploadFile(file: Express.Multer.File, folderId: string) {
      const response = await this.drive.files.create({
        requestBody: {
          name: file.originalname,
          parents: [folderId]
        },
        media: {
          mimeType: file.mimetype,
          body: fs.createReadStream(file.path) // لو المخزن على القرص
        }
      });
      return `https://drive.google.com/file/d/${response.data.id}/view`;
    }
}

