# 🚀 Deployment Checklist

## Pre-Deployment Checklist

### ✅ Code Quality
- [ ] All TypeScript errors fixed
- [ ] Build passes successfully (`pnpm build`)
- [ ] No console errors in development
- [ ] All imports are correct
- [ ] Environment variables configured

### ✅ Firebase Setup
- [ ] Firestore database created
- [ ] Phone authentication enabled
- [ ] Test phone numbers added:
  - `+91 90219 47718` (code: 654321)
  - `+91 93072 29712` (code: 654321)
  - `+91 93074 73197` (code: 654321)
- [ ] Firebase config updated in `lib/firebase.ts`
- [ ] Dummy users added (`node scripts/add-dummy-users.js`)

### ✅ Security
- [ ] Environment variables set
- [ ] Firebase security rules configured
- [ ] No sensitive data in code
- [ ] Security headers enabled

## Deployment Options

### Option 1: Docker Deployment (Recommended)

```bash
# 1. Build Docker image
docker build -t vyapar-pragati-admin .

# 2. Run container
docker run -d --name vyapar-pragati-admin -p 3000:3000 vyapar-pragati-admin

# 3. Check status
docker ps
docker logs vyapar-pragati-admin
```

### Option 2: Vercel Deployment

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Deploy
vercel --prod

# 3. Set environment variables in Vercel dashboard
```

### Option 3: Manual Deployment

```bash
# 1. Build the app
pnpm build

# 2. Start production server
pnpm start

# 3. Access at http://localhost:3000
```

## Post-Deployment Verification

### ✅ Functionality Tests
- [ ] Dashboard loads without errors
- [ ] Users are displayed correctly
- [ ] OTP verification works with test numbers
- [ ] User deletion works properly
- [ ] Error handling works as expected

### ✅ Performance Tests
- [ ] Page load time < 3 seconds
- [ ] No memory leaks
- [ ] Responsive design works
- [ ] Mobile compatibility

### ✅ Security Tests
- [ ] OTP verification is required
- [ ] Invalid OTPs are rejected
- [ ] Real phone numbers are blocked
- [ ] No sensitive data exposed

## Troubleshooting

### Common Issues

1. **Build Fails**
   ```bash
   # Clear cache and rebuild
   rm -rf .next
   pnpm build
   ```

2. **Users Not Loading**
   ```bash
   # Add dummy users
   node scripts/add-dummy-users.js
   ```

3. **OTP Not Working**
   - Check Firebase Auth console
   - Verify test phone numbers
   - Check browser console for errors

4. **Docker Issues**
   ```bash
   # Clean Docker
   docker system prune -a
   docker build --no-cache -t vyapar-pragati-admin .
   ```

### Environment Variables

Create `.env.local` for development:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## Monitoring

### Health Checks
- [ ] Application responds to requests
- [ ] Firebase connection is stable
- [ ] No error logs in production
- [ ] Performance metrics are good

### Logs to Monitor
- Firebase connection errors
- OTP verification failures
- User deletion operations
- Build and deployment logs

## Rollback Plan

If deployment fails:
1. Stop the current deployment
2. Revert to previous version
3. Fix issues in development
4. Test thoroughly
5. Redeploy

## Support Contacts

- **Development Team**: [Contact Info]
- **Firebase Support**: [Firebase Console]
- **Deployment Platform**: [Platform Support] 