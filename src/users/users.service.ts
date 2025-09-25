import { Injectable, NotFoundException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import * as admin from 'firebase-admin';

@Injectable()
export class UsersService {
  constructor(private readonly firebaseService: FirebaseService) {}

  private get usersCollection() {
    return this.firebaseService.getFirestore().collection('users');
  }

  // ➕ Create new user
  async createUser(data: any) {
    const newUserRef = this.usersCollection.doc();
    const now = admin.firestore.FieldValue.serverTimestamp();

    const newUserData = {
      ...data,
      id: newUserRef.id,
      addedAt: now,
      updatedAt: now,
    };

    await newUserRef.set(newUserData);
    return { id: newUserRef.id, ...data };
  }

  // 🔍 Get all users with optional filters
  async getAllUsers(query: any = {}) {
    let queryRef: FirebaseFirestore.Query = this.usersCollection;

    if (query.email) {
      queryRef = queryRef.where('email', '==', query.email.trim().toLowerCase());
    }
    if (query.status) {
      queryRef = queryRef.where('status', '==', query.status);
    }

    const snapshot = await queryRef.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  // 🔍 Get user by ID
  async getUserById(id: string) {
    const doc = await this.usersCollection.doc(id).get();
    if (!doc.exists) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    return { id: doc.id, ...doc.data() };
  }

  // ✏️ Update user by ID
  async updateUser(id: string, updateData: any) {
    const docRef = this.usersCollection.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new NotFoundException(`Cannot update: User with ID "${id}" not found`);
    }

    const updatedData = {
      ...updateData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await docRef.update(updatedData);

    const updatedDoc = await docRef.get();
    return { id: updatedDoc.id, ...updatedDoc.data() };
  }

  // 🗑️ Delete user by ID
  async deleteUser(id: string) {
    const docRef = this.usersCollection.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new NotFoundException(`Cannot delete: User with ID "${id}" not found`);
    }

    await docRef.delete();
    return { message: `User with ID "${id}" has been deleted` };
  }
}
