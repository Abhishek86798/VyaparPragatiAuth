'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DeleteUserModalProps } from '@/types/user';
import { X, AlertTriangle, Shield, Key, Phone, Send } from 'lucide-react';
import { FirebaseAuthService } from '@/lib/firebaseAuthService';
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
  const [error, setError] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && user) {
      setOtp('');
      setOtpSent(false);
      setError('');
      setAdminPhone('');
      setConfirmationResult(null);
      
      // Initialize reCAPTCHA when modal opens
      if (recaptchaContainerRef.current) {
        initializeRecaptcha();
      }
    }
  }, [isOpen, user]);

  const initializeRecaptcha = async () => {
    try {
      await FirebaseAuthService.initializeRecaptcha('recaptcha-container');
      console.log('✅ reCAPTCHA initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize reCAPTCHA:', error);
      setError('Failed to initialize security verification. Please refresh and try again.');
    }
  };

  const handleSendOTP = async () => {
    if (!adminPhone.trim()) {
      setError('Please enter admin phone number');
      return;
    }

    if (!user) return;

    try {
      setSendingOTP(true);
      setError('');
      
      console.log(`📱 Sending OTP via Firebase Auth to: ${adminPhone}`);
      
      const response = await FirebaseAuthService.sendOTP(adminPhone);
      
      if (response.success && response.confirmationResult) {
        setConfirmationResult(response.confirmationResult);
        setOtpSent(true);
        
        if (response.isTestPhone) {
          toast.success(`OTP sent to test phone: ${adminPhone}`);
          console.log(`✅ Firebase Auth OTP sent to test phone: ${adminPhone}`);
          console.log(`🎯 Use test code: 654321 for verification`);
        } else {
          toast.success(`OTP sent to: ${adminPhone}`);
          console.log(`✅ Firebase Auth OTP sent to: ${adminPhone}`);
        }
      } else {
        setError(response.error || 'Failed to send OTP');
      }
      
    } catch (error) {
      console.error('Error sending OTP:', error);
      setError('Failed to send OTP. Please try again.');
    } finally {
      setSendingOTP(false);
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

    if (!user || !confirmationResult) {
      setError('Please send OTP first');
      return;
    }

    try {
      console.log(`🔍 Verifying OTP with Firebase Auth: ${otp}`);
      
      const isOTPValid = await FirebaseAuthService.verifyOTP(confirmationResult, otp);

      if (isOTPValid) {
        console.log(`✅ Firebase Auth OTP verification successful`);
        
        // Sign out after successful verification
        await FirebaseAuthService.signOut();
        
        // Proceed with user deletion
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
    setConfirmationResult(null);
    
    // Clear reCAPTCHA
    FirebaseAuthService.clearRecaptcha();
    
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

          {/* Firebase Auth Authentication */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
            <div className="flex items-center mb-2">
              <Shield className="h-5 w-5 text-blue-600 mr-2" />
              <h4 className="text-sm font-medium text-blue-900">Firebase Auth Verification</h4>
            </div>
            <p className="text-sm text-blue-700 mb-3">
              Enter admin phone number and receive OTP via Firebase Phone Authentication
            </p>
            
            {/* reCAPTCHA Container */}
            <div id="recaptcha-container" ref={recaptchaContainerRef} className="mb-3"></div>
            
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
                      disabled={loading || sendingOTP}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSendOTP}
                    disabled={!adminPhone.trim() || sendingOTP || loading}
                    className="px-3 py-2 bg-blue-600 text-white border-l-0 border border-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {sendingOTP ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Test phones: +91 90219 47718, +91 93072 29712, +91 93074 73197 (use code: 654321)
                </p>
              </div>

              {/* OTP Input */}
              {otpSent && (
                <div className="mb-3">
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                    Enter OTP (from Firebase Auth)
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
                    Check your phone for the SMS (test phones use code: 654321)
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