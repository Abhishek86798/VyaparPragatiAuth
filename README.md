# Vyapar Pragati Admin Dashboard

A modern admin dashboard for user management with Firebase Phone Authentication for secure user deletion.

## 🚀 Features

- **User Management**: View, manage, and delete users
- **Firebase Phone Authentication**: Secure OTP verification using Firebase's built-in phone auth
- **Firebase Integration**: Real-time data with Firestore
- **Responsive Design**: Modern UI with Tailwind CSS
- **TypeScript**: Full type safety
- **Production Ready**: Optimized for deployment

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Lucide React Icons
- **Backend**: Firebase Firestore, Firebase Auth
- **Deployment**: Docker, Standalone Output
- **Package Manager**: pnpm

## 📋 Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- Firebase project with Firestore enabled
- Docker (for containerized deployment)

## 🚀 Quick Start

### Development

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd vyapar_pragati_auth
   pnpm install
   ```

2. **Set up Firebase:**
   - Create a Firebase project
   - Enable Firestore
   - Add test phone numbers in Firebase Auth console
   - Update Firebase config in `lib/firebase.ts`

3. **Add dummy users:**
   ```bash
   node scripts/add-dummy-users.js
   ```

4. **Start development server:**
   ```bash
   pnpm dev
   ```

5. **Open the app:**
   - Navigate to `http://localhost:3000`
   - Test user deletion with OTP verification

### Production Deployment

#### Option 1: Docker Deployment (Recommended)

1. **Build and run with Docker:**
   ```bash
   # Make deploy script executable
   chmod +x deploy.sh
   
   # Run deployment
   ./deploy.sh
   ```

2. **Or manually:**
   ```bash
   docker build -t vyapar-pragati-admin .
   docker run -d --name vyapar-pragati-admin -p 3000:3000 vyapar-pragati-admin
   ```

#### Option 2: Vercel Deployment

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel --prod
   ```

#### Option 3: Manual Deployment

1. **Build the app:**
   ```bash
   pnpm build
   ```

2. **Start production server:**
   ```bash
   pnpm start
   ```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### Firebase Setup

1. **Enable Firestore:**
   - Go to Firebase Console → Firestore Database
   - Create database in production mode

2. **Configure Phone Auth:**
   - Go to Firebase Console → Authentication → Sign-in method
   - Enable Phone authentication
   - Add test phone numbers:
     - `+91 90219 47718` (code: 654321)
     - `+91 93072 29712` (code: 654321)
     - `+91 93074 73197` (code: 654321)

## 🧪 Testing

### Firebase Auth Verification Flow

1. **Open the dashboard** at `http://localhost:3000`
2. **Click "Delete"** on any user
3. **Enter admin phone number**: `+919307229712`
4. **Click "Send"** - Firebase sends OTP via SMS
5. **Enter OTP**: `654321` (test code for test phones)
6. **Confirm deletion** - User will be deleted after verification

### Test Phone Numbers

Use these test numbers for OTP verification:
- `+91 90219 47718` → Code: `654321`
- `+91 93072 29712` → Code: `654321`
- `+91 93074 73197` → Code: `654321`

## 📁 Project Structure

```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main dashboard
├── components/            # React components
│   ├── DeleteUserModal.tsx
│   └── UserTable.tsx
├── lib/                   # Utility libraries
│   ├── firebase.ts        # Firebase config
│   ├── firebaseAuthService.ts # Firebase Auth service
│   └── userService.ts     # User operations
├── scripts/               # Utility scripts
│   └── add-dummy-users.js
├── types/                 # TypeScript types
├── Dockerfile             # Docker configuration
├── deploy.sh              # Deployment script
└── README.md
```

## 🔒 Security Features

- **OTP Verification**: Required for user deletion
- **Phone Number Validation**: Only test numbers allowed
- **Firebase Security Rules**: Configured for production
- **Security Headers**: XSS protection, frame options
- **Input Validation**: All inputs sanitized

## 🚀 Performance Optimizations

- **Standalone Output**: Optimized for containerization
- **Image Optimization**: WebP and AVIF support
- **Gzip Compression**: Enabled for faster loading
- **Code Splitting**: Automatic by Next.js
- **Static Generation**: Where possible

## 🐛 Troubleshooting

### Build Issues

1. **TypeScript Errors:**
   ```bash
   pnpm build
   ```
   Fix any type errors before deployment.

2. **Firebase Connection:**
   - Check Firebase config in `lib/firebase.ts`
   - Verify Firestore rules allow read/write

3. **Docker Issues:**
   ```bash
   docker system prune -a
   docker build --no-cache -t vyapar-pragati-admin .
   ```

### Runtime Issues

1. **Users Not Loading:**
   - Run `node scripts/add-dummy-users.js`
   - Check Firebase console for data

2. **OTP Not Working:**
   - Verify test phone numbers in Firebase Auth
   - Check browser console for errors

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For support, please contact the development team or create an issue in the repository. 