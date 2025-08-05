export interface AdminAuth {
  isAuthenticated: boolean;
  adminPhone?: string;
}

export interface OTPRequest {
  userPhone: string;
  adminPhone: string;
  otp: string;
  expiresAt: Date;
}

export interface DeleteUserRequest {
  userId: string;
  userPhone: string;
  adminPhone: string;
  otp: string;
} 