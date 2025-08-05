'use client';

import { 
  signInWithPhoneNumber, 
  RecaptchaVerifier, 
  PhoneAuthProvider,
  ConfirmationResult,
  UserCredential 
} from 'firebase/auth';
import { auth } from './firebase';

// Test phone numbers that Firebase will auto-verify with code 654321
const TEST_PHONE_NUMBERS = [
  '+919021947718',
  '+919307229712', 
  '+919307473197'
];

export interface FirebaseAuthResponse {
  success: boolean;
  error?: string;
  confirmationResult?: ConfirmationResult;
  isTestPhone?: boolean;
}

export class FirebaseAuthService {
  private static recaptchaVerifier: RecaptchaVerifier | null = null;

  // Initialize reCAPTCHA
  static initializeRecaptcha(containerId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Remove existing verifier if any
        if (this.recaptchaVerifier) {
          this.recaptchaVerifier.clear();
        }

        // Create new reCAPTCHA verifier
        this.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
          'size': 'invisible',
          'callback': () => {
            console.log('✅ reCAPTCHA verified successfully');
            resolve();
          },
          'expired-callback': () => {
            console.log('❌ reCAPTCHA expired');
            reject(new Error('reCAPTCHA expired'));
          }
        });

        // Render the reCAPTCHA
        this.recaptchaVerifier.render().then(() => {
          console.log('✅ reCAPTCHA rendered successfully');
          resolve();
        }).catch((error) => {
          console.error('❌ Failed to render reCAPTCHA:', error);
          reject(error);
        });

      } catch (error) {
        console.error('❌ Error initializing reCAPTCHA:', error);
        reject(error);
      }
    });
  }

  // Check if phone number is a test number
  static isTestPhone(phoneNumber: string): boolean {
    const cleanPhone = phoneNumber.replace(/\s+/g, '');
    return TEST_PHONE_NUMBERS.includes(cleanPhone);
  }

  // Send OTP using Firebase Phone Auth
  static async sendOTP(phoneNumber: string): Promise<FirebaseAuthResponse> {
    try {
      console.log(`📱 Sending OTP to: ${phoneNumber}`);
      
      // Clean phone number
      const cleanPhone = phoneNumber.replace(/\s+/g, '');
      const isTestPhone = this.isTestPhone(cleanPhone);
      
      console.log(`🔍 Phone check: ${phoneNumber} -> ${cleanPhone} -> ${isTestPhone ? 'TEST' : 'REAL'}`);

      if (!this.recaptchaVerifier) {
        throw new Error('reCAPTCHA not initialized. Please call initializeRecaptcha first.');
      }

      // Send OTP using Firebase Phone Auth
      const confirmationResult = await signInWithPhoneNumber(
        auth, 
        cleanPhone, 
        this.recaptchaVerifier
      );

      console.log(`✅ OTP sent successfully to: ${cleanPhone}`);
      
      if (isTestPhone) {
        console.log(`🎯 Test phone detected: ${cleanPhone}`);
        console.log(`📝 Use test code: 654321 for verification`);
      }

      return {
        success: true,
        confirmationResult,
        isTestPhone
      };

    } catch (error: any) {
      console.error('❌ Error sending OTP:', error);
      
      let errorMessage = 'Failed to send OTP';
      
      if (error.code === 'auth/invalid-phone-number') {
        errorMessage = 'Invalid phone number format';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please try again later';
      } else if (error.code === 'auth/quota-exceeded') {
        errorMessage = 'SMS quota exceeded. Please try again later';
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  // Verify OTP using Firebase Phone Auth
  static async verifyOTP(confirmationResult: ConfirmationResult, otp: string): Promise<boolean> {
    try {
      console.log(`🔍 Verifying OTP: ${otp}`);
      
      // Confirm the OTP
      const userCredential: UserCredential = await confirmationResult.confirm(otp);
      
      console.log(`✅ OTP verified successfully`);
      console.log(`👤 User authenticated:`, userCredential.user.phoneNumber);
      
      return true;

    } catch (error: any) {
      console.error('❌ Error verifying OTP:', error);
      
      if (error.code === 'auth/invalid-verification-code') {
        console.log('❌ Invalid OTP code');
      } else if (error.code === 'auth/code-expired') {
        console.log('❌ OTP code expired');
      } else {
        console.log('❌ OTP verification failed:', error.message);
      }
      
      return false;
    }
  }

  // Clear reCAPTCHA
  static clearRecaptcha(): void {
    if (this.recaptchaVerifier) {
      this.recaptchaVerifier.clear();
      this.recaptchaVerifier = null;
    }
  }

  // Sign out current user
  static async signOut(): Promise<void> {
    try {
      await auth.signOut();
      console.log('✅ User signed out successfully');
    } catch (error) {
      console.error('❌ Error signing out:', error);
    }
  }
} 