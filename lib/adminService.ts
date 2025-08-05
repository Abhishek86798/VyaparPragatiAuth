import { collection, addDoc, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from './firebase';
import { OTPRequest, DeleteUserRequest } from '@/types/admin';

export class AdminService {
  private static readonly OTP_COLLECTION = 'otp_requests';

  // Generate OTP for user deletion
  static generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Fetch OTP from Firebase for a given phone number
  static async fetchOTPFromFirebase(phoneNumber: string): Promise<string | null> {
    try {
      console.log(`🔍 Fetching OTP from Firebase for phone: ${phoneNumber}`);
      
      // Query Firestore for OTP requests with this phone number
      const otpQuery = query(
        collection(db, this.OTP_COLLECTION),
        where('adminPhone', '==', phoneNumber)
      );

      const querySnapshot = await getDocs(otpQuery);
      
      if (!querySnapshot.empty) {
        const latestOTP = querySnapshot.docs[0].data() as OTPRequest;
        console.log(`✅ Found OTP in Firebase: ${latestOTP.otp} for ${phoneNumber}`);
        return latestOTP.otp;
      } else {
        console.log(`❌ No OTP found in Firebase for ${phoneNumber}`);
        return null;
      }
    } catch (error) {
      console.error('Error fetching OTP from Firebase:', error);
      return null;
    }
  }

  // Send OTP to admin's phone (for testing purposes) - Optimized
  static async sendOTPToUser(userPhone: string, adminPhone: string): Promise<string> {
    try {
      const otp = this.generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

      // Store OTP request in Firestore with timeout
      const otpRequest: OTPRequest = {
        userPhone,
        adminPhone,
        otp,
        expiresAt
      };

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Firebase timeout')), 5000)
      );

      const addDocPromise = addDoc(collection(db, this.OTP_COLLECTION), otpRequest);
      
      await Promise.race([addDocPromise, timeoutPromise]);

      // For testing purposes, send OTP to admin's phone instead of user's phone
      console.log(`📱 OTP ${otp} sent to admin phone: ${adminPhone} (for testing)`);
      console.log(`💾 OTP stored in Firebase for ${adminPhone}`);
      
      return otp;
    } catch (error) {
      console.error('Error sending OTP:', error);
      // For testing, still return OTP even if Firebase fails
      const fallbackOTP = this.generateOTP();
      console.log(`🔄 Fallback OTP ${fallbackOTP} for admin phone: ${adminPhone}`);
      return fallbackOTP;
    }
  }

  // Verify OTP for user deletion - Optimized
  static async verifyOTP(userPhone: string, adminPhone: string, inputOTP: string): Promise<boolean> {
    try {
      const otpQuery = query(
        collection(db, this.OTP_COLLECTION),
        where('userPhone', '==', userPhone),
        where('adminPhone', '==', adminPhone),
        where('otp', '==', inputOTP)
      );

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Firebase timeout')), 5000)
      );

      const getDocsPromise = getDocs(otpQuery);
      const querySnapshot = await Promise.race([getDocsPromise, timeoutPromise]);
      
      if (querySnapshot.empty) {
        return false;
      }

      const otpDoc = querySnapshot.docs[0];
      const otpData = otpDoc.data() as OTPRequest;
      
      // Check if OTP is expired
      if (new Date() > otpData.expiresAt) {
        return false;
      }

      // Delete the OTP request after successful verification
      try {
        await deleteDoc(doc(db, this.OTP_COLLECTION, otpDoc.id));
      } catch (deleteError) {
        console.warn('Failed to delete OTP request:', deleteError);
        // Continue even if deletion fails
      }
      
      return true;
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return false;
    }
  }

  // Delete user with OTP verification - Optimized
  static async deleteUserWithOTP(request: DeleteUserRequest): Promise<void> {
    try {
      // Verify OTP
      const isOTPValid = await this.verifyOTP(
        request.userPhone,
        request.adminPhone,
        request.otp
      );

      if (!isOTPValid) {
        throw new Error('Invalid or expired OTP');
      }

      // If OTP is valid, proceed with user deletion
      return;
    } catch (error) {
      console.error('Error in delete user with OTP:', error);
      throw error;
    }
  }
} 