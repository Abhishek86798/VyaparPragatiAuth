export interface User {
  id: string; // Phone number as document ID
  appInstallDate: string;
  city: string;
  createdAt: string;
  district: string;
  dob: string;
  firm: string;
  groups: {
    hasFullAccess: boolean;
  };
  lastLoginAt: string;
  // Additional fields that might exist
  email?: string;
  name?: string;
  phone?: string;
  status?: 'active' | 'inactive' | 'suspended';
}

export interface UserTableProps {
  users: User[];
  onDeleteUser: (userId: string) => void;
  loading: boolean;
}

export interface DeleteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onConfirmDelete: (otp: string) => void;
  loading: boolean;
} 