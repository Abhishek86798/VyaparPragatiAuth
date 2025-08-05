import { collection, getDocs, doc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import { User } from '@/types/user';

export class UserService {
  private static readonly USERS_COLLECTION = 'users';

  // Fetch all users from Firestore - Optimized
  static async getUsers(): Promise<User[]> {
    try {
      const usersRef = collection(db, this.USERS_COLLECTION);
      const q = query(usersRef, orderBy('createdAt', 'desc'));
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Firebase timeout')), 10000)
      );

      const getDocsPromise = getDocs(q);
      const querySnapshot = await Promise.race([getDocsPromise, timeoutPromise]);
      
      const users: User[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        users.push({
          id: doc.id,
          appInstallDate: data.appInstallDate || '',
          city: data.city || '',
          createdAt: data.createdAt || '',
          district: data.district || '',
          dob: data.dob || '',
          firm: data.firm || '',
          groups: data.groups || { hasFullAccess: false },
          lastLoginAt: data.lastLoginAt || '',
          email: data.email || '',
          name: data.name || '',
          phone: data.phone || '',
          status: data.status || 'active',
        });
      });
      
      return users;
    } catch (error) {
      console.error('Error fetching users:', error);
      // Return empty array instead of throwing error for better UX
      return [];
    }
  }

  // Delete a user from Firestore - Optimized
  static async deleteUser(userId: string): Promise<void> {
    try {
      const userRef = doc(db, this.USERS_COLLECTION, userId);
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Firebase timeout')), 10000)
      );

      const deletePromise = deleteDoc(userRef);
      await Promise.race([deletePromise, timeoutPromise]);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new Error('Failed to delete user');
    }
  }

  // Generate OTP for admin authentication
  static generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Verify OTP (in a real app, this would be more secure)
  static verifyOTP(inputOTP: string, expectedOTP: string): boolean {
    return inputOTP === expectedOTP;
  }
} 