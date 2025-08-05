// Client-side SMS service that calls API routes
'use client';

export interface SMSResponse {
  success: boolean;
  isTestPhone?: boolean;
  testCode?: string;
  message: string;
  error?: string;
}

export class SMSService {
  // Test phone numbers from Firebase console (in different formats)
  private static readonly TEST_PHONES = [
    '+91 90219 47718',
    '+91 93072 29712', 
    '+91 93074 73197',
    // Also include formats without spaces
    '+919021947718',
    '+919307229712',
    '+919307473197'
  ];

  // Check if phone number is a test number (normalize first)
  static isTestPhone(phoneNumber: string): boolean {
    // Normalize phone number by removing spaces
    const normalizedPhone = phoneNumber.replace(/\s/g, '');
    
    // Check against normalized test phones
    const normalizedTestPhones = this.TEST_PHONES.map(phone => phone.replace(/\s/g, ''));
    
    const isTest = normalizedTestPhones.includes(normalizedPhone);
    console.log(`📱 Phone number check: ${phoneNumber} -> ${normalizedPhone} -> ${isTest ? 'TEST' : 'REAL'}`);
    return isTest;
  }

  // Send OTP via API route
  static async sendOTP(phoneNumber: string): Promise<SMSResponse> {
    try {
      console.log(`📱 Sending OTP to: ${phoneNumber}`);
      
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json();
      
      if (data.success) {
        if (data.isTestPhone) {
          console.log(`✅ Test phone detected: ${phoneNumber}`);
          console.log(`📋 For test phones, use code: ${data.testCode}`);
        } else {
          console.log(`✅ SMS sent successfully to: ${phoneNumber}`);
        }
      }
      
      return data;
    } catch (error) {
      console.error('Error sending OTP:', error);
      return {
        success: false,
        error: 'Failed to send OTP',
        message: 'Failed to send OTP'
      };
    }
  }

  // Verify OTP - ONLY accept 654321 for test phones, reject all others
  static async verifyOTP(phoneNumber: string, otp: string): Promise<boolean> {
    try {
      console.log(`🔍 Verifying OTP: ${otp} for ${phoneNumber}`);
      
      if (this.isTestPhone(phoneNumber)) {
        // For test phones, ONLY accept the exact test code from Firebase console
        const isValid = otp === '654321';
        console.log(`✅ Test phone verification: ${isValid ? 'SUCCESS' : 'FAILED'}`);
        console.log(`📋 Expected code: 654321, Received: ${otp}`);
        return isValid;
      }
      
      // For real phones, reject all OTPs since we don't have real SMS verification
      console.log(`❌ Real phone verification: REJECTED (no real SMS verification implemented)`);
      console.log(`📋 Real phones are not supported yet. Use test phones: +91 90219 47718, +91 93072 29712, +91 93074 73197`);
      return false;
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return false;
    }
  }
} 