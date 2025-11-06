import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as admin from 'firebase-admin';
import { FirebaseService } from 'src/core/firebase/firebase.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService, private readonly firebaseService: FirebaseService, private usersService: UsersService) {}
  private get usersCollection() {
    return this.firebaseService.getFirestore().collection('users');
  }
  async validateUser(email: string, password: string) {
    try {
      const snapshot = await this.usersCollection
        .where('email', '==', email.trim())
        .limit(1)
        .get();

      console.log("📘 [validateUser] Firestore snapshot:", snapshot);

      if (snapshot.empty) {
        console.warn("❌ [validateUser] User not found for email:", email);
        return { isValid: false, reason: 'user_not_found' };
      }

      const userDoc = snapshot.docs[0].data();

      const isPasswordValid = await bcrypt.compare(password, userDoc.passwordHash);

      if (!isPasswordValid) {
        console.warn("❌ [validateUser] Incorrect password for user:", email);
        return { isValid: false, reason: 'wrong_password' };
      }

      return {
        isValid: true,
        email: userDoc.email,
        isResetPassword: userDoc.isResetPassword || false,
        isLocked: userDoc.isLocked || false
      };
    } catch (error) {
      console.error("🔥 [validateUser] Unexpected error:", error);
      return { isValid: false, reason: 'internal_error' };
    }
  }


  async login(email: string, password: string) {
    try {
      const result: any = await this.validateUser(email, password);

      if (!result.isValid) {
        return {
          success: false,
          reason: result.reason, // 'user_not_found' | 'wrong_password' | 'internal_error'
        };
      }

      const payload = { email: result.email, sub: result.email }; // Add userId if available
      const token = this.jwtService.sign(payload);

      return {
        success: true,
        access_token: token,
        isResetPassword: result.isResetPassword,
      };
    } catch (error) {
      console.error("🔥 [login] Unexpected error:", error);
      return {
        success: false,
        reason: 'internal_error',
      };
    }
  }


  async forgetPassword(email: string) {
    const normalizedEmail = email?.trim().toLowerCase();

    const snapshot = await this.usersCollection
      .where('email', '==', normalizedEmail)
      .limit(1)
      .get();

    if (snapshot.empty) {
      throw new NotFoundException(`User with email "${normalizedEmail}" not found`);
    }

    const docRef = snapshot.docs[0].ref;

    // 🔐 Generate new plain password
    const newPassword = this.generateRandomPassword();

    // 🔐 Hash the password using bcrypt
    const passwordHash = await bcrypt.hash(newPassword, 10);

    const updateData = {
      passwordHash: passwordHash, // Save hash, not raw password
      isResetPassword: true, 
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // ✏️ Update Firestore document
    await docRef.update(updateData);

    // ✅ Log or notify the admin (optional)
    console.log(`Password for ${normalizedEmail} reset to: ${newPassword}`);

    await this.usersService.updateUser({email: normalizedEmail, notifications: [{title: "أستعادة كلمه المرور", message: `تمت إعادة تعيين كلمة المرور للبريد الإلكتروني ${normalizedEmail} إلى: ${newPassword}`, isRead: false, createdAt: new Date()}]})
    // await this.notifyAdmin(normalizedEmail, newPassword);

    const updatedDoc = await docRef.get();
    return { id: updatedDoc.id, ...updatedDoc.data(), plainPassword: newPassword }; // Optionally return new password
  }

  generateRandomPassword(length: number = 10): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  }

  async updatePassword(email: string, newPassword: string) {
    const normalizedEmail = email?.trim().toLowerCase();

    const snapshot = await this.usersCollection
      .where('email', '==', normalizedEmail)
      .limit(1)
      .get();

    if (snapshot.empty) {
      throw new NotFoundException(`User with email "${normalizedEmail}" not found`);
    }

    const docRef = snapshot.docs[0].ref;

    // 🔐 Hash the password using bcrypt
    const passwordHash = await bcrypt.hash(newPassword, 10);

    const updateData = {
      passwordHash: passwordHash, // Save hash, not raw password
      isResetPassword: false, 
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // ✏️ Update Firestore document
    await docRef.update(updateData);

    const updatedDoc = await docRef.get();
    return { id: updatedDoc.id, ...updatedDoc.data() };
  }
}
