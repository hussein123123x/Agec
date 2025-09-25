import { Injectable } from '@nestjs/common';
import { FirebaseService } from 'src/firebase/firebase.service';

@Injectable()
export class UsersService {
    constructor(private readonly firebaseService: FirebaseService) {}

    async createUser(data:any) {
        try{
            const db = this.firebaseService.getFirestore();
            const userRef = db.collection('users').doc();
            await userRef.set(data);
            return { id: userRef.id, ...data };
        } catch (err) {
            console.error("🔥 Firestore createUser error:", err);
            throw err; // or return { success: false, error: err }
        }
    }
}