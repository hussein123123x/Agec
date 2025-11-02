import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as admin from 'firebase-admin';
import { FirebaseService } from 'src/core/firebase/firebase.service';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService, private readonly firebaseService: FirebaseService) {}
  private get usersCollection() {
    return this.firebaseService.getFirestore().collection('users');
  }
  async validateUser(email: string, password: string) {
    const snapshot = await this.usersCollection
      .where('email', '==', email.trim())
      .limit(1)
      .get();
    console.log("🚀 ~ AuthService ~ validateUser ~ snapshot:", snapshot)

    if (snapshot.empty) {
      throw new UnauthorizedException('Invalid credentials (user not found)');
    }

    const userDoc = snapshot.docs[0].data();

    const isPasswordValid = await bcrypt.compare(password, userDoc.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials (wrong password)');
    }

    return { email: userDoc.email, isResetPassword: userDoc.isResetPassword  };
  }

  async login(email: string, password: string) {
    const data:any = await this.validateUser(email, password);
    const user = data
    const isResetPassword = data.isResetPassword
    
    console.log("🚀 ~ AuthService ~ login ~ user:", user)

    const payload = { email: user.email, sub: user.email }; // you can include user ID if needed
    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      isResetPassword
    };
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
