import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as serviceAccount from './serviceAccountKey.json'; // adjust path if needed

@Injectable()
export class FirebaseService implements OnModuleInit {
  private firebaseApp: admin.app.App;

  onModuleInit() {
    if (!admin.apps.length) {
      this.firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
        databaseURL: `https://${(serviceAccount as any).project_id}.firebaseio.com`,
      });
    } else {
      this.firebaseApp = admin.app();
    }
  }

  getAuth() {
    return admin.auth(this.firebaseApp);
  }

  getFirestore() {
    return admin.firestore(this.firebaseApp);
  }
}
