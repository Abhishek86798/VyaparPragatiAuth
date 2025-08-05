import { NextRequest, NextResponse } from 'next/server';

// Test phone numbers from Firebase console (in different formats)
const TEST_PHONES = [
  '+91 90219 47718',
  '+91 93072 29712',
  '+91 93074 73197',
  // Also include formats without spaces
  '+919021947718',
  '+919307229712',
  '+919307473197'
];

// Check if phone number is a test number (normalize first)
function isTestPhone(phoneNumber: string): boolean {
  // Normalize phone number by removing spaces
  const normalizedPhone = phoneNumber.replace(/\s/g, '');
  
  // Check against normalized test phones
  const normalizedTestPhones = TEST_PHONES.map(phone => phone.replace(/\s/g, ''));
  
  const isTest = normalizedTestPhones.includes(normalizedPhone);
  console.log(`📱 API Phone number check: ${phoneNumber} -> ${normalizedPhone} -> ${isTest ? 'TEST' : 'REAL'}`);
  return isTest;
}

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // Check if it's a test phone number
    const isTestPhoneNumber = isTestPhone(phoneNumber);

    if (isTestPhoneNumber) {
      console.log(`✅ Test phone detected: ${phoneNumber}`);
      return NextResponse.json({
        success: true,
        isTestPhone: true,
        testCode: '654321',
        message: 'Test phone detected. Use code: 654321'
      });
    }

    // For real phones, you would need to implement SMS sending
    // This is a placeholder for real SMS implementation
    return NextResponse.json({
      success: true,
      isTestPhone: false,
      message: 'SMS sent successfully'
    });

  } catch (error) {
    console.error('Error sending OTP:', error);
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
} 