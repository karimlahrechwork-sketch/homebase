# HomeBase 🏠

Home maintenance scheduler with family sharing and push notifications.

## Tech Stack
- Vite + React
- Firebase Auth, Firestore, Cloud Messaging
- Deployed on Vercel

## Setup

### 1. Clone and install
```bash
git clone <your-repo>
cd homebase
npm install
```

### 2. Environment variables
Copy `.env.example` to `.env` and fill in your Firebase values:
```bash
cp .env.example .env
```

### 3. Run locally
```bash
npm run dev
```

### 4. Deploy to Vercel
Push to GitHub, then import the repo in Vercel.
Add your `.env` variables in Vercel → Project Settings → Environment Variables.

## Firebase Security Rules
Copy the contents of `firestore.rules` into Firebase Console → Firestore → Rules.

## Push Notifications
Push notifications work on:
- Android: Chrome browser or any PWA-capable browser
- iOS: Safari 16.4+ (add to home screen as PWA first)

Users tap "Enable push notifications" on the Home screen to opt in.

## Family Sharing
1. Create an account
2. Go to Home → Household Members → Invite by email
3. The invited person must already have a HomeBase account
4. Once added, they share all tasks, logs, and history

## Notification Scheduling
To send scheduled reminders (e.g. daily overdue alerts), set up a Firebase Cloud Function or use a cron job service like Vercel Cron to call the FCM API for users with tasks due.
