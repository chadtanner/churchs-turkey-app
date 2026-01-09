# Church's Texas Chicken - Thanksgiving Turkey Reservation System

A Next.js-based web application for reserving fully cooked, smoked turkeys for Thanksgiving pickup at Church's Texas Chicken locations.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Firebase project (for database integration)

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Visit **http://localhost:3000** to see the application.

### Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
turkey-app/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Homepage (PDP layout)
│   ├── admin/             # Admin dashboard
│   └── reserve/           # Reservation flow
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── layout/           # Header, Footer
│   └── admin/            # Admin-specific components
├── lib/                  # Utilities and configuration
│   ├── firebase.ts       # Firebase setup
│   ├── types.ts          # TypeScript interfaces
│   └── utils.ts          # Helper functions
└── public/               # Static assets
```

## 🎨 Features

### Customer-Facing
- ✅ **Homepage** - Product description page (PDP) layout
- ✅ **Turkey Hero Image** - Professional food photography
- ✅ **Pricing Display** - Clear pricing with tax disclaimers
- ✅ **How It Works** - 3-step process explanation
- 🚧 **Reservation Flow** - Coming soon (location search, time selection, checkout)

### Admin Dashboard
- ✅ **Summary Cards** - Key metrics at a glance
- ✅ **Location Search** - Search by 6-digit ID, state, city, or name
- ✅ **Inventory Status Panels**:
  - 🔴 No Reservations (0%)
  - 🟡 Half Reserved (50-74%)
  - 🟠 Three-Quarters Reserved (75-99%)
  - 🟢 Sold Out (100%)
- ✅ **CSV Export** - Download data for each category
- ✅ **Real-time Filtering** - Debounced search with instant results

### Design System
- **Brand Colors**: Black Pepper, Honey-Butter, OG Heat, Mayo
- **Typography**: Inter font family with responsive type scale
- **Components**: Buttons, Inputs, Cards, Badges
- **Responsive**: Mobile-first design

## 🔥 Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Firestore Database**
4. Create a web app to get credentials

### 2. Configure Environment Variables

Copy the example file and add your credentials:

```bash
cp env.example .env.local
```

Edit `.env.local` with your Firebase credentials:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. Seed Database

Install Firebase Admin SDK:

```bash
npm install firebase-admin
```

Download service account key from Firebase Console and save as `firebase-service-account.json`.

Run the seeding script:

```bash
npx ts-node scripts/seed-firebase.ts
```

This will upload 50 restaurant locations from `../seed-data/seed-data-restaurants.json`.

### 4. Set Up Security Rules

In Firebase Console → Firestore → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /restaurants/{restaurantId} {
      allow read: if true;
      allow write: if false;
    }
    match /reservations/{reservationId} {
      allow create: if request.resource.data.customer.email is string;
      allow read: if request.auth != null;
      allow update, delete: if false;
    }
    match /systemConfig/{document} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: Firebase Firestore
- **Styling**: Custom CSS (Design System)
- **Maps**: Leaflet + OpenStreetMap (for location features)
- **Date Handling**: date-fns

## 📚 Documentation

- `docs/turkey-reservation-prd.md` - Complete product requirements
- `docs/homepage-pdp-layout-guide.md` - Homepage design specifications
- `docs/modern-design-system.md` - Design system documentation
- `docs/admin-inventory-status-guide.md` - Admin dashboard specifications
- `docs/admin-location-search-guide.md` - Location search implementation

## 🧪 Testing

```bash
# Build the project
npm run build

# Run development server
npm run dev
```

Visit:
- **Homepage**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/admin
- **Reserve Page**: http://localhost:3000/reserve

## 📝 Next Steps

1. **Connect Firebase** - Add your credentials to `.env.local`
2. **Seed Database** - Run the seeding script
3. **Implement Reservation Flow** - Build location search, time selection, and checkout
4. **Add Email Notifications** - Integrate email service for confirmations
5. **Deploy to Vercel** - One-click deployment

## 🤝 Contributing

This is a prototype project. For production use:
- Add comprehensive error handling
- Implement proper authentication for admin dashboard
- Add automated tests
- Set up monitoring and analytics
- Implement email service (SendGrid, AWS SES, or Resend)

## 📄 License

Proprietary - Church's Texas Chicken

---

**Built with ❤️ for Church's Texas Chicken**
