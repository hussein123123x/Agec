import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { FirebaseService } from 'src/core/firebase/firebase.service';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid'; 
import { encryptField } from 'src/core/auth/crypto.util';


@Injectable()
export class UsersService {
  constructor(private readonly firebaseService: FirebaseService) {}

  private get usersCollection() {
    return this.firebaseService.getFirestore().collection('users');
  }

  // ➕ Create new user
  async createUser(data: any) {
  const email = data.email.trim().toLowerCase();
  const phone = data.phone.trim();
  const now = admin.firestore.FieldValue.serverTimestamp();

  // 🔒 Check if email already exists
  const existingUser = await this.usersCollection.where('email', '==', email).limit(1).get();
  if (!existingUser.empty) {
    throw new BadRequestException(`Email "${email}" already exists`);
  }

  // 🔒 Check if phone already exists
  const existingPhone = await this.usersCollection.where('phone', '==', phone).limit(1).get();
  if (!existingPhone.empty) {
    throw new BadRequestException(`Phone number "${phone}" already exists`);
  }

  // 🔐 Hash password
  let passwordHash: string | undefined;
  if (data.password) {
    passwordHash = await bcrypt.hash(data.password, 10);
    delete data.password;
  }

  // 🔐 Encrypt sensitive fields
  const encryptedBank = data.bankAccount ? encryptField(data.bankAccount) : undefined;
  const encryptedSalary = data.salary ? encryptField(String(data.salary)) : undefined;

  delete data.bankAccount;
  delete data.salary;

  // ✅ Generate random doc ID
  const newUserRef = this.usersCollection.doc();

  const newUserData = {
    ...data,
    email, // always lowercase
    ...(passwordHash && { passwordHash }),
    ...(encryptedBank && { bankAccount_encrypted: encryptedBank }),
    ...(encryptedSalary && { salary_encrypted: encryptedSalary }),
    id: newUserRef.id,
    addedAt: now,
    remaining_vacation_days: 14,
    emergency_vacation_days: 6,
    isResetPassword: false,
    vacations: [],
    absences: [],
    events: [],
    updatedAt: now,
  };

  // Save to Firestore
  await newUserRef.set(newUserData);

  // ✅ Return safe object (strip sensitive fields)
  const { passwordHash: _, bankAccount_encrypted, salary_encrypted, ...safeData } = newUserData;
  return safeData;
}

  // 🔍 Get all users with optional filters
  async getAllUsers(body: any = {}) {
    let queryRef: FirebaseFirestore.Query = this.usersCollection;

    if (body.email) {
      queryRef = queryRef.where('email', '==', body.email.trim().toLowerCase());
    }
    if (body.status) {
      queryRef = queryRef.where('status', '==', body.status);
    }

    const snapshot = await queryRef.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  // 🔍 Get user by ID
  async getUserByEmail(email: string) {
    const querySnapshot = await this.usersCollection
      .where('email', '==', email.trim().toLowerCase())
      .limit(1)
      .get();

    if (querySnapshot.empty) {
      throw new NotFoundException(`User with email "${email}" not found`);
    }

    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  }

  // ✏️ Update user by ID
  async updateUser(updateData: any) {
    const email = updateData.email?.trim().toLowerCase();

    const snapshot = await this.usersCollection
      .where('email', '==', email)
      .limit(1)
      .get();

    if (snapshot.empty) {
      throw new NotFoundException(`Cannot update: User with email "${email}" not found`);
    }

    const docRef = snapshot.docs[0].ref;

    const updatedData = {
      ...updateData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await docRef.update(updatedData);

    const updatedDoc = await docRef.get();
    return { id: updatedDoc.id, ...updatedDoc.data() };
  }

  // 🗑️ Delete user by ID
  async deleteUser(email: string) {
    const snapshot = await this.usersCollection
      .where('email', '==', email.trim().toLowerCase())
      .limit(1)
      .get();

    if (snapshot.empty) {
      throw new NotFoundException(`Cannot delete: User with email "${email}" not found`);
    }

    const doc = snapshot.docs[0];
    await doc.ref.delete();

    return { message: `User with email "${email}" has been deleted` };
  }

async requestVacation(userId: string, body: { days: string[]; type: string; reason: string }) {
  const userRef = this.usersCollection.doc(userId);
  const doc = await userRef.get();

  if (!doc.exists) {
    throw new NotFoundException(`User with ID "${userId}" not found`);
  }

  const userData:any = doc.data();
  const { days, type, reason } = body;

  if (!Array.isArray(days) || days.length === 0) {
    throw new BadRequestException('Vacation days must be a non-empty array');
  }

  if (!['normal', 'emergency'].includes(type)) {
    throw new BadRequestException('Vacation type must be "normal" or "emergency"');
  }

  // number of days requested
  const daysRequested = days.length;

  if (type === 'normal') {
    if ((userData.remaining_vacation_days || 0) < daysRequested) {
      throw new BadRequestException('Not enough remaining normal vacation days');
    }
  }

  if (type === 'emergency') {
    if ((userData.emergency_vacation_days || 0) < daysRequested) {
      throw new BadRequestException('Not enough remaining emergency vacation days');
    }
  }

  // build new vacation record
  const vacationEntry = {
    days,
    type,
    reason,
    createdAt: new Date().toISOString(),
  };

  // update fields atomically
  const updates: any = {
    vacations: admin.firestore.FieldValue.arrayUnion(vacationEntry),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  if (type === 'normal') {
    updates.remaining_vacation_days =
      (userData.remaining_vacation_days || 0) - daysRequested;
  } else {
    updates.emergency_vacation_days =
      (userData.emergency_vacation_days || 0) - daysRequested;
  }

  await userRef.update(updates);

  return {
    message: `Vacation request for ${daysRequested} day(s) added successfully`,
    vacation: vacationEntry,
    remaining_vacation_days: updates.remaining_vacation_days ?? userData.remaining_vacation_days,
    emergency_vacation_days: updates.emergency_vacation_days ?? userData.emergency_vacation_days,
  };
}


  async createEvent(userId: string, event: { name: string; date: string; description: string }) {
  const userRef = this.usersCollection.doc(userId);
  const doc = await userRef.get();

  if (!doc.exists) {
    throw new NotFoundException(`User with ID "${userId}" not found`);
  }

  const newEvent = {
    id: uuidv4(),
    ...event,
    createdAt: new Date().toISOString(),
  };

  await userRef.update({
    events: admin.firestore.FieldValue.arrayUnion(newEvent),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { message: 'Event added successfully', event: newEvent };
}

async getEvents(userId: string) {
  const userRef = this.usersCollection.doc(userId);
  const doc:any = await userRef.get();

  if (!doc.exists) {
    throw new NotFoundException(`User with ID "${userId}" not found`);
  }

  return doc.data().events || [];
}

async updateEvent(
  userId: string,
  eventId: string,
  updates: { name?: string; date?: string; action?: string },
) {
  const userRef = this.usersCollection.doc(userId);
  const doc = await userRef.get();

  if (!doc.exists) {
    throw new NotFoundException(`User with ID "${userId}" not found`);
  }

  const userData:any = doc.data();
  const events = userData.events || [];

  const eventIndex = events.findIndex((ev: any) => ev.id === eventId);
  if (eventIndex === -1) {
    throw new NotFoundException(`Event with ID "${eventId}" not found`);
  }

  const updatedEvent = { ...events[eventIndex], ...updates, updatedAt: new Date().toISOString() };
  events[eventIndex] = updatedEvent;

  await userRef.update({
    events,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { message: 'Event updated successfully', event: updatedEvent };
}

async deleteEvent(userId: string, eventId: string) {
  const userRef = this.usersCollection.doc(userId);
  const doc = await userRef.get();

  if (!doc.exists) {
    throw new NotFoundException(`User with ID "${userId}" not found`);
  }

  const userData:any = doc.data();
  const events = userData.events || [];

  const eventIndex = events.findIndex((ev: any) => ev.id === eventId);
  if (eventIndex === -1) {
    throw new NotFoundException(`Event with ID "${eventId}" not found`);
  }

  const [removedEvent] = events.splice(eventIndex, 1);

  await userRef.update({
    events,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { message: 'Event deleted successfully', event: removedEvent };
}

}
