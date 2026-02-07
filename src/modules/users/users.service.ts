import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { FirebaseService } from 'src/core/firebase/firebase.service';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid'; 
import { encryptField, decryptField } from 'src/core/auth/crypto.util';
import { UsersHelperService } from './users.helper.service';
import moment from 'moment';

type AttendanceType = "IN" | "OUT";
interface AttendanceLog {
  userId: string;
  employeeCode: string;
  deviceId: string;
  timestamp: string; // ISO
  type: AttendanceType;
}

@Injectable()
export class UsersService {
  constructor(private readonly firebaseService: FirebaseService, private readonly helperService: UsersHelperService) {}

  private get usersCollection() {
    return this.firebaseService.getFirestore().collection('users');
  }

  // ➕ Create new user
  async createUser(data: any) {
  const parts = data.fullName.trim().split(/\s+/);
  const agecAccount = (parts[0] + '.' + (parts[1] || '') + '@agec.com').toLowerCase();
  const password = '1234'
  console.log("🚀 ~ UsersService ~ createUser ~ agecAccount:", agecAccount)
  const email = agecAccount.trim().toLowerCase();
  const phone = data.phone.trim();
  const now = admin.firestore.FieldValue.serverTimestamp();

  // 🔒 Check if email already exists
  const existingUser = await this.usersCollection.where('agecAccount', '==', email).limit(1).get();
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
  passwordHash = await bcrypt.hash(password, 10);

  if (data.password) {
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
    agecAccount: agecAccount,
    isNewMember: true,
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
      queryRef = queryRef.where('agecAccount', '==', body.email.trim().toLowerCase());
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
      .where('agecAccount', '==', email.trim().toLowerCase())
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
      .where('agecAccount', '==', email)
      .limit(1)
      .get();

    if (snapshot.empty) {
      throw new NotFoundException(`Cannot update: User with email "${email}" not found`);
    }

    const docRef = snapshot.docs[0].ref;

    // Prepare data for update
    const updatedData: any = {
      ...updateData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // ✅ If password is provided, hash it and remove plain password
    if (updateData.password) {
      const passwordHash = await bcrypt.hash(updateData.password, 10);
      updatedData.passwordHash = passwordHash;
      delete updatedData.password;
    }

    await docRef.update(updatedData);

    const updatedDoc = await docRef.get();
    return { id: updatedDoc.id, ...updatedDoc.data() };
  }

  // 🗑️ Delete user by ID
  async deleteUser(email: string) {
    const snapshot = await this.usersCollection
      .where('agecAccount', '==', email.trim().toLowerCase())
      .limit(1)
      .get();

    if (snapshot.empty) {
      throw new NotFoundException(`Cannot delete: User with email "${email}" not found`);
    }

    const doc = snapshot.docs[0];
    await doc.ref.delete();

    return { message: `User with email "${email}" has been deleted` };
  }

  async deleteAllUsers() {
    const snapshot = await this.usersCollection.get();

    if (snapshot.empty) {
      return { message: 'No users found to delete' };
    }

    for (const doc of snapshot.docs) {
      await doc.ref.delete(); // same logic as deleteUser
    }

    return { message: `Deleted ${snapshot.size} users successfully` };
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

async getAbsences(userId: string, userEmail: string, startDate: string, endDate: string): Promise<any> {

  const usersAttendance:AttendanceLog[] = [
  /* ===================== November 2025 ===================== */

  /* 2025-11-01 (Sat) - weekend short shift */
  // { userId: "6Qir9XEZwCUU9lF2kv0G", employeeCode: "EMP-002", deviceId: "DEV-01", timestamp: "2025-11-01T09:05:12+02:00", type: "IN" },
  // { userId: "6Qir9XEZwCUU9lF2kv0G", employeeCode: "EMP-002", deviceId: "DEV-01", timestamp: "2025-11-01T13:12:45+02:00", type: "OUT" },

  /* 2025-11-02 - normal */
  { userId: "6Qir9XEZwCUU9lF2kv0G", employeeCode: "EMP-002", deviceId: "DEV-01", timestamp: "2025-11-02T07:29:00+02:00", type: "IN" },
  { userId: "6Qir9XEZwCUU9lF2kv0G", employeeCode: "EMP-002", deviceId: "DEV-01", timestamp: "2025-11-02T15:30:40+02:00", type: "OUT" },

  /* 2025-11-03 - late IN */
  { userId: "6Qir9XEZwCUU9lF2kv0G", employeeCode: "EMP-002", deviceId: "DEV-01", timestamp: "2025-11-03T08:47:19+02:00", type: "IN" },
  { userId: "6Qir9XEZwCUU9lF2kv0G", employeeCode: "EMP-002", deviceId: "DEV-01", timestamp: "2025-11-03T16:10:05+02:00", type: "OUT" },

  /* 2025-11-04 - early OUT */
  { userId: "6Qir9XEZwCUU9lF2kv0G", employeeCode: "EMP-002", deviceId: "DEV-02", timestamp: "2025-11-04T07:29:55+02:00", type: "IN" },
  { userId: "6Qir9XEZwCUU9lF2kv0G", employeeCode: "EMP-002", deviceId: "DEV-02", timestamp: "2025-11-04T14:58:02+02:00", type: "OUT" },

  /* 2025-11-05 - multiple punches (break) */
  { userId: "6Qir9XEZwCUU9lF2kv0G", employeeCode: "EMP-002", deviceId: "DEV-01", timestamp: "2025-11-05T07:22:12+02:00", type: "IN" },
  { userId: "6Qir9XEZwCUU9lF2kv0G", employeeCode: "EMP-002", deviceId: "DEV-01", timestamp: "2025-11-05T12:05:00+02:00", type: "OUT" },
  { userId: "6Qir9XEZwCUU9lF2kv0G", employeeCode: "EMP-002", deviceId: "DEV-01", timestamp: "2025-11-05T12:40:10+02:00", type: "IN" },
  { userId: "6Qir9XEZwCUU9lF2kv0G", employeeCode: "EMP-002", deviceId: "DEV-01", timestamp: "2025-11-05T16:06:20+02:00", type: "OUT" },

  /* 2025-11-06 - normal */
  { userId: "6Qir9XEZwCUU9lF2kv0G", employeeCode: "EMP-002", deviceId: "DEV-01", timestamp: "2025-11-06T07:30:18+02:00", type: "IN" },
  { userId: "6Qir9XEZwCUU9lF2kv0G", employeeCode: "EMP-002", deviceId: "DEV-01", timestamp: "2025-11-06T16:01:10+02:00", type: "OUT" },

  /* 2025-11-07 - missing OUT */
  // { userId: "6Qir9XEZwCUU9lF2kv0G", employeeCode: "EMP-002", deviceId: "DEV-01", timestamp: "2025-11-07T07:41:05+02:00", type: "IN" },

  /* 2025-11-08 - only OUT (missing IN) */
  // { userId: "6Qir9XEZwCUU9lF2kv0G", employeeCode: "EMP-002", deviceId: "DEV-01", timestamp: "2025-11-08T16:02:59+02:00", type: "OUT" },

  /* 2025-11-09 - normal */
  { userId: "6Qir9XEZwCUU9lF2kv0G", employeeCode: "EMP-002", deviceId: "DEV-02", timestamp: "2025-11-09T07:28:44+02:00", type: "IN" },
  { userId: "6Qir9XEZwCUU9lF2kv0G", employeeCode: "EMP-002", deviceId: "DEV-02", timestamp: "2025-11-09T16:00:25+02:00", type: "OUT" },

  /* 2025-11-10 - duplicate IN */
  { userId: "6Qir9XEZwCUU9lF2kv0G", employeeCode: "EMP-002", deviceId: "DEV-01", timestamp: "2025-11-10T07:30:00+02:00", type: "IN" },
  { userId: "6Qir9XEZwCUU9lF2kv0G", employeeCode: "EMP-002", deviceId: "DEV-01", timestamp: "2025-11-10T07:30:04+02:00", type: "IN" },
  { userId: "6Qir9XEZwCUU9lF2kv0G", employeeCode: "EMP-002", deviceId: "DEV-01", timestamp: "2025-11-10T16:04:00+02:00", type: "OUT" },

  /* 2025-11-11 - normal */
  { userId: "6Qir9XEZwCUU9lF2kv0G", employeeCode: "EMP-002", deviceId: "DEV-01", timestamp: "2025-11-11T07:35:27+02:00", type: "IN" },
  { userId: "6Qir9XEZwCUU9lF2kv0G", employeeCode: "EMP-002", deviceId: "DEV-01", timestamp: "2025-11-11T16:07:12+02:00", type: "OUT" },

  /* 2025-11-12 - very late IN */
  { userId: "6Qir9XEZwCUU9lF2kv0G", employeeCode: "EMP-002", deviceId: "DEV-03", timestamp: "2025-11-12T10:12:33+02:00", type: "IN" },
  { userId: "6Qir9XEZwCUU9lF2kv0G", employeeCode: "EMP-002", deviceId: "DEV-03", timestamp: "2025-11-12T17:05:00+02:00", type: "OUT" },

  /* 2025-11-13 - OUT then IN (out-of-order in array) */
  { userId: "6Qir9XEZwCUU9lF2kv0G", employeeCode: "EMP-002", deviceId: "DEV-01", timestamp: "2025-11-13T16:02:10+02:00", type: "OUT" },
  { userId: "6Qir9XEZwCUU9lF2kv0G", employeeCode: "EMP-002", deviceId: "DEV-01", timestamp: "2025-11-13T07:29:40+02:00", type: "IN" },

  /* 2025-11-14 - normal */
  { userId: "6Qir9XEZwCUU9lF2kv0G", employeeCode: "EMP-002", deviceId: "DEV-02", timestamp: "2025-11-14T07:33:01+02:00", type: "IN" },
  { userId: "6Qir9XEZwCUU9lF2kv0G", employeeCode: "EMP-002", deviceId: "DEV-02", timestamp: "2025-11-14T16:00:58+02:00", type: "OUT" },

  /* 2025-11-15 - half day */
  { userId: "6Qir9XEZwCUU9lF2kv0G", employeeCode: "EMP-002", deviceId: "DEV-02", timestamp: "2025-11-15T08:00:00+02:00", type: "IN" },
  { userId: "6Qir9XEZwCUU9lF2kv0G", employeeCode: "EMP-002", deviceId: "DEV-02", timestamp: "2025-11-15T12:30:00+02:00", type: "OUT" },

  /* 2025-11-16 - overnight shift crossing midnight */
  { userId: "6Qir9XEZwCUU9lF2kv0G", employeeCode: "EMP-002", deviceId: "DEV-03", timestamp: "2025-11-16T19:10:00+02:00", type: "IN" },
  { userId: "6Qir9XEZwCUU9lF2kv0G", employeeCode: "EMP-002", deviceId: "DEV-03", timestamp: "2025-11-17T02:40:00+02:00", type: "OUT" },

  /* 2025-11-17 - normal */
  { userId: "6Qir9XEZwCUU9lF2kv0G", employeeCode: "EMP-002", deviceId: "DEV-01", timestamp: "2025-11-17T07:28:30+02:00", type: "IN" },
  { userId: "6Qir9XEZwCUU9lF2kv0G", employeeCode: "EMP-002", deviceId: "DEV-01", timestamp: "2025-11-17T16:03:00+02:00", type: "OUT" },

  /* 2025-11-18 - from your sample */
  { userId: "6Qir9XEZwCUU9lF2kv0G", employeeCode: "EMP-002", deviceId: "DEV-01", timestamp: "2025-11-18T08:33:22+02:00", type: "IN" },
  { userId: "6Qir9XEZwCUU9lF2kv0G", employeeCode: "EMP-002", deviceId: "DEV-01", timestamp: "2025-11-18T19:58:11+02:00", type: "OUT" },

  /* 2025-11-19 - from your sample (missing OUT) */
  { userId: "6Qir9XEZwCUU9lF2kv0G", employeeCode: "EMP-002", deviceId: "DEV-01", timestamp: "2025-11-19T07:36:58+02:00", type: "IN" },

  /* 2025-11-20 - from your sample (overnight OUT) */
  { userId: "6Qir9XEZwCUU9lF2kv0G", employeeCode: "EMP-002", deviceId: "DEV-01", timestamp: "2025-11-20T08:55:59+02:00", type: "IN" },
  { userId: "6Qir9XEZwCUU9lF2kv0G", employeeCode: "EMP-002", deviceId: "DEV-01", timestamp: "2025-11-21T02:20:44+02:00", type: "OUT" },

  /* 2025-11-21 - from your sample */
  // { userId: "6Qir9XEZwCUU9lF2kv0G", employeeCode: "EMP-002", deviceId: "DEV-01", timestamp: "2025-11-21T07:37:10+02:00", type: "IN" },
  // { userId: "6Qir9XEZwCUU9lF2kv0G", employeeCode: "EMP-002", deviceId: "DEV-01", timestamp: "2025-11-21T16:06:05+02:00", type: "OUT" },

  /* 2025-11-22 - from your sample (extended day) */
  // { userId: "6Qir9XEZwCUU9lF2kv0G", employeeCode: "EMP-002", deviceId: "DEV-01", timestamp: "2025-11-22T07:28:20+02:00", type: "IN" },
  // { userId: "6Qir9XEZwCUU9lF2kv0G", employeeCode: "EMP-002", deviceId: "DEV-01", timestamp: "2025-11-22T16:57:00+02:00", type: "OUT" },

  /* 2025-11-23 - from your sample */
  { userId: "6Qir9XEZwCUU9lF2kv0G", employeeCode: "EMP-002", deviceId: "DEV-01", timestamp: "2025-11-23T08:00:00+02:00", type: "IN" },
  { userId: "6Qir9XEZwCUU9lF2kv0G", employeeCode: "EMP-002", deviceId: "DEV-01", timestamp: "2025-11-23T16:00:00+02:00", type: "OUT" },

  /* 2025-11-24 - normal */
  // { userId: "6Qir9XEZwCUU9lF2kv0G", employeeCode: "EMP-002", deviceId: "DEV-01", timestamp: "2025-11-24T07:30:14+02:00", type: "IN" },
  // { userId: "6Qir9XEZwCUU9lF2kv0G", employeeCode: "EMP-002", deviceId: "DEV-01", timestamp: "2025-11-24T13:05:40+02:00", type: "OUT" },

  /* 2025-11-25 - missing IN (only OUT) */
  { userId: "6Qir9XEZwCUU9lF2kv0G", employeeCode: "EMP-002", deviceId: "DEV-01", timestamp: "2025-11-25T16:01:00+02:00", type: "OUT" },

  /* 2025-11-26 - two shifts same day */
  { userId: "6Qir9XEZwCUU9lF2kv0G", employeeCode: "EMP-002", deviceId: "DEV-02", timestamp: "2025-11-26T07:30:00+02:00", type: "IN" },
  { userId: "6Qir9XEZwCUU9lF2kv0G", employeeCode: "EMP-002", deviceId: "DEV-02", timestamp: "2025-11-26T11:55:00+02:00", type: "OUT" },
  { userId: "6Qir9XEZwCUU9lF2kv0G", employeeCode: "EMP-002", deviceId: "DEV-02", timestamp: "2025-11-26T12:45:00+02:00", type: "IN" },
  { userId: "6Qir9XEZwCUU9lF2kv0G", employeeCode: "EMP-002", deviceId: "DEV-02", timestamp: "2025-11-26T16:18:00+02:00", type: "OUT" },

  /* 2025-11-27 - normal */
  { userId: "6Qir9XEZwCUU9lF2kv0G", employeeCode: "EMP-002", deviceId: "DEV-01", timestamp: "2025-11-27T07:29:08+02:00", type: "IN" },
  { userId: "6Qir9XEZwCUU9lF2kv0G", employeeCode: "EMP-002", deviceId: "DEV-01", timestamp: "2025-11-27T16:02:44+02:00", type: "OUT" },

  /* 2025-11-28 - reversed types (bad data) */
  { userId: "6Qir9XEZwCUU9lF2kv0G", employeeCode: "EMP-002", deviceId: "DEV-01", timestamp: "2025-11-28T07:10:00+02:00", type: "OUT" },
  { userId: "6Qir9XEZwCUU9lF2kv0G", employeeCode: "EMP-002", deviceId: "DEV-01", timestamp: "2025-11-28T07:40:00+02:00", type: "IN" },
  { userId: "6Qir9XEZwCUU9lF2kv0G", employeeCode: "EMP-002", deviceId: "DEV-01", timestamp: "2025-11-28T16:00:00+02:00", type: "OUT" },

  /* 2025-11-29 - weekend work normal */
  { userId: "6Qir9XEZwCUU9lF2kv0G", employeeCode: "EMP-002", deviceId: "DEV-03", timestamp: "2025-11-29T08:15:00+02:00", type: "IN" },
  { userId: "6Qir9XEZwCUU9lF2kv0G", employeeCode: "EMP-002", deviceId: "DEV-03", timestamp: "2025-11-29T15:10:00+02:00", type: "OUT" },

  /* 2025-11-30 - missing OUT */
  { userId: "6Qir9XEZwCUU9lF2kv0G", employeeCode: "EMP-002", deviceId: "DEV-01", timestamp: "2025-11-30T07:33:33+02:00", type: "IN" },
];
// TODO: get year from DB
  //to get kpi for month for diff year 
  // const year = moment(startDate).year();
      const year = 2026
  
  const holidaysCol = this.firebaseService.getFirestore().collection("Holidays");

  const snap = await holidaysCol.where("year", "==", year).limit(1).get();

  if (snap.empty) {
    throw new Error(`No Holidays doc found for year ${year}`);
  }

  const holidayDoc = snap.docs[0].data(); 
  const rawHoliday = holidayDoc; 

  const normalizedHoliday: any = {
    year: rawHoliday?.year ?? year,
    regularWeekend: rawHoliday?.regularWeekend ?? ['friday', 'saturday'],
    official: rawHoliday?.official ?? [],
  };

  const userDoc:any = await this.getUserByEmail(userEmail);
  const events: any[] = userDoc.events ?? [];
  const salaryMonthly = decryptField(userDoc.salary_encrypted);

  return this.helperService.summarizeUserAttendance(usersAttendance, userId, startDate, endDate, normalizedHoliday, userDoc.absences ?? [], Number(salaryMonthly), events);


  // Salary update
}




}
/*
- Productivity 5
  - Completed Tasks - User
  - Quality of Tasks - User 1-2 by default 1
- Attendance 5
  - Absence - Device
    - First day without approve 1.25 from hour and second day 1.5 and third day 2
  - Overtime - Device
    -Shift 1 Hours from 4pm to 8pm calc 1.35 from hour 
    -Shift 2 Hours from 8pm to 12am calc 1.7 from hour
    -Shift 3 Hours from 12am to 7am calc 2 from hour
    * Sturday hour * 1.35
  - Late - Device 
    - Came late 0 to 15 min from 7:30 
    - Came late 15 to 30 min from 7:30 
    - Came late 30 to 1 hour from 7:30
    - Came late more than 1 hour

    - Leave early 0 to 15 min from 4:00
    - Leave early 15 to 30 min from 4:00 
    - Leave early 30 to 1 hour from 4:00
    - Leave early more than 1 hour

- Teamwork 2
  - Bad Event - User -1
  - Good Event - User +1




من 7:15 الي 4م *  1
من 4 الي 8 * 1.35
من 8 الي 12 * 1.7
من 12 الي 3 صباحا * 2
  ن 7:15 ص حتى الساعة  م8 *1.35 من 8 مساءا وحتى 12 منتصف الليل * 1.7 من 12 منتصف الليل وحتى 3
 صباحا * 2
*/ 