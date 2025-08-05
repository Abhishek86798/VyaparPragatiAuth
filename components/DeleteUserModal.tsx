'use client';

import React, { useState, useEffect } from 'react';
import { DeleteUserModalProps } from '@/types/user';
import { X, AlertTriangle, Shield, Key, Phone, Send, Download } from 'lucide-react';
import { AdminService } from '@/lib/adminService';
import { SMSService } from '@/lib/smsService';
import toast from 'react-hot-toast';

const DeleteUserModal: React.FC<DeleteUserModalProps> = ({
  isOpen,
  onClose,
  user,
  onConfirmDelete,
  loading
}) => {
  const [adminPhone, setAdminPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOTP, setSendingOTP] = useState(false);
  const [fetchingOTP, setFetchingOTP] = useState(false);
  const [error, setError] = useState('');
  const [useRealSMS, setUseRealSMS] = useState(true); // Default to real SMS
  const [generatedOTP, setGeneratedOTP] = useState(''); // Store the generated OTP for mock system

  useEffect(() => {
    if (isOpen && user) {
      setOtp('');
      setOtpSent(false);
      setError('');
      setAdminPhone('');
      setGeneratedOTP(''); // Reset generated OTP
    }
  }, [isOpen, user]);

  const handleSendOTP = async () => {
    if (!adminPhone.trim()) {
      setError('Please enter admin phone number');
      return;
    }

    if (!user) return;

    try {
      setSendingOTP(true);
      setError('');
      
      if (useRealSMS) {
        // Use real SMS via API route
        console.log(`📱 Using REAL SMS API for: ${adminPhone}`);
        
        const smsResponse = await SMSService.sendOTP(adminPhone);
        
        if (smsResponse.success) {
          setOtpSent(true);
          
          if (smsResponse.isTestPhone) {
            // Don't auto-fill, let user enter manually
            toast.success(`SMS sent to test phone: ${adminPhone}`);
            console.log(`✅ Real SMS sent to test phone: ${adminPhone}`);
            console.log(`🎯 Use test code: ${smsResponse.testCode || '654321'}`);
          } else {
            toast.success(`SMS sent to: ${adminPhone}`);
            console.log(`✅ Real SMS sent to: ${adminPhone}`);
          }
        } else {
          setError(smsResponse.error || 'Failed to send SMS');
        }
      } else {
        // Use mock system (for testing)
        console.log(`📱 Using MOCK system for: ${adminPhone}`);
        
        // Generate OTP immediately for testing
        const newGeneratedOTP = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedOTP(newGeneratedOTP); // Store the generated OTP
        
        // Store in Firebase for consistency
        try {
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout')), 5000)
          );

          const sendOTPPromise = AdminService.sendOTPToUser(user.id, adminPhone);
          await Promise.race([sendOTPPromise, timeoutPromise]);
        } catch (firebaseError) {
          console.warn('Firebase storage failed, but continuing with mock OTP');
        }
        
        // Don't auto-fill, let user enter manually
        setOtpSent(true);
        toast.success(`Mock OTP generated: ${newGeneratedOTP}`);
        console.log(`📱 Mock OTP generated for admin ${adminPhone}: ${newGeneratedOTP}`);
        console.log(`🎯 Use this OTP: ${newGeneratedOTP}`);
      }
      
    } catch (error) {
      console.error('Error sending OTP:', error);
      setError('Failed to send OTP. Please try again.');
      
      if (!useRealSMS) {
        // Generate fallback OTP for testing
        const fallbackOTP = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedOTP(fallbackOTP); // Store the fallback OTP
        setOtpSent(true);
        console.log(`🔄 Fallback OTP for admin ${adminPhone}: ${fallbackOTP}`);
        console.log(`🎯 Use this fallback OTP: ${fallbackOTP}`);
      }
    } finally {
      setSendingOTP(false);
    }
  };

  const handleFetchOTP = async () => {
    if (!adminPhone.trim()) {
      setError('Please enter admin phone number');
      return;
    }

    try {
      setFetchingOTP(true);
      setError('');
      
      console.log(`🔍 Fetching OTP from Firebase for: ${adminPhone}`);
      
      // Fetch OTP from Firebase (mock system)
      const fetchedOTP = await AdminService.fetchOTPFromFirebase(adminPhone);
      
      if (fetchedOTP) {
        setOtp(fetchedOTP);
        setGeneratedOTP(fetchedOTP); // Store the fetched OTP
        setOtpSent(true);
        toast.success(`OTP fetched from Firebase: ${fetchedOTP}`);
        console.log(`✅ OTP fetched from Firebase: ${fetchedOTP} for ${adminPhone}`);
      } else {
        setError('No OTP found in Firebase for this phone number');
        console.log(`❌ No OTP found in Firebase for ${adminPhone}`);
      }
      
    } catch (error) {
      console.error('Error fetching OTP:', error);
      setError('Failed to fetch OTP from Firebase');
    } finally {
      setFetchingOTP(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!adminPhone.trim()) {
      setError('Please enter admin phone number');
      return;
    }

    if (!otp.trim()) {
      setError('Please enter the OTP');
      return;
    }

    if (!user) return;

    try {
      let isOTPValid = false;

      if (useRealSMS) {
        // Use real SMS verification
        console.log(`🔍 Verifying OTP with REAL SMS: ${otp}`);
        isOTPValid = await SMSService.verifyOTP(adminPhone, otp);
      } else {
        // Use mock system - ONLY accept the generated OTP
        console.log(`🔍 Verifying OTP with MOCK system: ${otp}`);
        console.log(`📋 Expected OTP: ${generatedOTP}, Received: ${otp}`);
        
        if (otp === generatedOTP && generatedOTP !== '') {
          isOTPValid = true;
          console.log(`✅ Mock OTP verification successful: ${otp}`);
        } else {
          console.log(`❌ Mock OTP verification failed: ${otp}`);
          console.log(`📋 Expected: ${generatedOTP}, Received: ${otp}`);
          isOTPValid = false;
        }
      }

      if (isOTPValid) {
        // If OTP is valid, proceed with user deletion
        console.log(`✅ OTP verification successful, proceeding with user deletion`);
        onConfirmDelete(otp);
      } else {
        setError('Invalid OTP. Please try again.');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setError('Invalid OTP. Please try again.');
    }
  };

  const handleClose = () => {
    setOtp('');
    setAdminPhone('');
    setOtpSent(false);
    setError('');
    setGeneratedOTP(''); // Reset generated OTP
    onClose();
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <AlertTriangle className="h-6 w-6 text-red-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Delete User</h3>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Warning Message */}
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-400 mr-2 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-red-800">Warning</h4>
                <p className="text-sm text-red-700 mt-1">
                  This action cannot be undone. This will permanently delete the user account for{' '}
                  <span className="font-semibold">{user.name || user.id}</span>.
                </p>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="bg-gray-50 rounded-md p-4 mb-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">User Details</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <div><span className="font-medium">Phone:</span> {user.id}</div>
              {user.name && <div><span className="font-medium">Name:</span> {user.name}</div>}
              <div><span className="font-medium">Firm:</span> {user.firm}</div>
              <div><span className="font-medium">Location:</span> {user.city}, {user.district}</div>
            </div>
          </div>

          {/* SMS Mode Toggle */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-yellow-800">SMS Mode:</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={useRealSMS}
                  onChange={(e) => setUseRealSMS(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                <span className="ml-3 text-sm font-medium text-gray-900">
                  {useRealSMS ? 'Real SMS API' : 'Mock System'}
                </span>
              </label>
            </div>
            <p className="text-xs text-yellow-700 mt-1">
              {useRealSMS 
                ? 'Using real SMS via API route (test phones: +91 90219 47718, +91 93072 29712, +91 93074 73197)'
                : 'Using mock system for testing (OTP shown in terminal)'
              }
            </p>
          </div>

          {/* OTP Authentication */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
            <div className="flex items-center mb-2">
              <Shield className="h-5 w-5 text-blue-600 mr-2" />
              <h4 className="text-sm font-medium text-blue-900">OTP Verification Required</h4>
            </div>
            <p className="text-sm text-blue-700 mb-3">
              {useRealSMS 
                ? 'Enter admin phone number and receive SMS OTP via API'
                : 'Enter admin phone number and generate OTP for testing'
              }
            </p>
            
            <form onSubmit={handleSubmit}>
              {/* Admin Phone Input */}
              <div className="mb-3">
                <label htmlFor="adminPhone" className="block text-sm font-medium text-gray-700 mb-1">
                  Admin Phone Number
                </label>
                <div className="flex">
                  <div className="flex-1 relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="tel"
                      id="adminPhone"
                      value={adminPhone}
                      onChange={(e) => setAdminPhone(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="+91 93072 29712"
                      disabled={loading || sendingOTP || fetchingOTP}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSendOTP}
                    disabled={!adminPhone.trim() || sendingOTP || loading || fetchingOTP}
                    className="px-3 py-2 bg-blue-600 text-white border-l-0 border border-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {sendingOTP ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </button>
                  {!useRealSMS && (
                    <button
                      type="button"
                      onClick={handleFetchOTP}
                      disabled={!adminPhone.trim() || fetchingOTP || loading || sendingOTP}
                      className="px-3 py-2 bg-green-600 text-white rounded-r-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {fetchingOTP ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {useRealSMS 
                    ? 'Send: Use SMS API | Test phones: +91 90219 47718, +91 93072 29712, +91 93074 73197'
                    : 'Send: Generate OTP | Fetch: Get OTP from Firebase'
                  }
                </p>
              </div>

              {/* OTP Input */}
              {otpSent && (
                <div className="mb-3">
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                    Enter OTP {useRealSMS ? '(from SMS)' : '(generated for testing)'}
                  </label>
                  <div className="flex items-center">
                    <Key className="h-4 w-4 text-gray-400 mr-2" />
                    <input
                      type="text"
                      id="otp"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                      disabled={loading}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {useRealSMS 
                      ? 'Check your phone for the SMS (test phones use code: 654321)'
                      : 'OTP is shown in terminal/console - enter it manually'
                    }
                  </p>
                </div>
              )}

              {error && (
                <div className="text-red-600 text-sm mb-3">{error}</div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !otp.trim() || !otpSent}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Deleting...
                    </div>
                  ) : (
                    'Delete User'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteUserModal; 