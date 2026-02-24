# Studex Global Markets MVP - Frontend

A modern, production-ready Next.js 14+ frontend for the Studex Global Markets MVP platform. Connect investors and entrepreneurs worldwide with secure deal management, real-time messaging, and AI-powered insights.

## Features

- **Authentication**: Firebase Auth with email/password and Google OAuth
- **Dashboard**: Real-time revenue tracking, active deals, and AI Deal Well insights
- **Deal Pipeline**: Collaborative deal management with status tracking and document sharing
- **Messaging**: Private communications between matched users
- **Time Tracker**: Log hours across projects and tasks
- **Settings**: Profile management, security, notifications, and privacy controls
- **Responsive Design**: Mobile-first approach with dark theme and gold accents
- **Production-Ready**: Error handling, loading states, accessibility, and TypeScript

## Tech Stack

- **Framework**: Next.js 14.1.0 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom color scheme
- **Authentication**: Firebase
- **Database**: Firestore
- **UI Components**: Custom built with accessibility in mind
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod
- **Notifications**: React Hot Toast
- **Charts**: Recharts

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Firebase project with Auth and Firestore enabled

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd studex-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

4. Add your Firebase configuration to `.env.local`:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

5. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
studex-frontend/
├── app/                          # Next.js app directory
│   ├── layout.tsx               # Root layout
│   ├── globals.css              # Global styles
│   ├── page.tsx                 # Landing page
│   ├── login/                   # Login page
│   ├── signup/                  # Signup page
│   ├── dashboard/               # Dashboard with overview
│   ├── deals/                   # Deal pipeline
│   ├── messages/                # Messaging interface
│   ├── tracker/                 # Time tracking
│   └── settings/                # User settings
├── components/
│   ├── providers/
│   │   └── AuthProvider.tsx     # Auth context and routing
│   ├── layout/
│   │   ├── Header.tsx           # Navigation header
│   │   └── Sidebar.tsx          # Sidebar navigation
│   └── ui/
│       ├── Button.tsx           # Reusable button
│       ├── Card.tsx             # Card component
│       ├── Input.tsx            # Form input
│       ├── Modal.tsx            # Modal dialog
│       ├── Badge.tsx            # Status badge
│       ├── Select.tsx           # Select dropdown
│       ├── Textarea.tsx         # Textarea component
│       ├── Tabs.tsx             # Tab component
│       ├── LoadingSpinner.tsx   # Loading indicator
│       └── StatusIndicator.tsx  # Status indicator
├── lib/
│   ├── firebase.ts              # Firebase configuration
│   ├── auth.ts                  # Auth functions
│   ├── utils.ts                 # Utility functions
│   └── hooks.ts                 # Custom React hooks
├── public/                       # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
└── next.config.js
```

## Key Pages

### Landing Page (`/`)
- Hero section with feature overview
- Call-to-action buttons for signup/login
- Responsive feature cards
- Footer

### Authentication (`/login`, `/signup`)
- Email/password authentication
- Google OAuth integration
- Multi-step signup flow (email → role selection → details)
- Form validation and error handling

### Dashboard (`/dashboard`)
- Revenue metrics and trends
- Active deals overview
- AI Deal Well insights
- Recent messages
- Upcoming events
- Time logged summary

### Deal Pipeline (`/deals`)
- Searchable list of active deals
- Status filtering
- Progress tracking
- Team participant display
- Document and chat links

### Messages (`/messages`)
- Conversation list with search
- Real-time chat interface
- User online status
- Message timestamps
- Mobile-responsive chat view

### Time Tracker (`/tracker`)
- Active timer with play/pause
- Time entry logging
- Category filtering
- Weekly breakdown
- Statistics dashboard

### Settings (`/settings`)
- Profile information
- Security settings
- Notification preferences
- Privacy controls
- Account management

## Components

### UI Components

All UI components are located in `components/ui/` and follow these principles:

- **Accessibility**: WCAG 2.1 AA compliant
- **Type Safety**: Full TypeScript support
- **Customizable**: Accept className and variant props
- **Consistent**: Use Tailwind CSS for styling
- **Reusable**: Built to be used across multiple pages

#### Button
```tsx
<Button
  variant="primary"
  size="md"
  isLoading={false}
  icon={<Icon />}
  fullWidth
>
  Click Me
</Button>
```

#### Card
```tsx
<Card hover clickable onClick={() => {}}>
  Card content here
</Card>
```

#### Input
```tsx
<Input
  label="Email"
  type="email"
  error={error}
  helper="Enter your email"
  icon={<MailIcon />}
/>
```

### Layout Components

- **Header**: Top navigation with user menu and notifications
- **Sidebar**: Left navigation with links and quick stats

## Styling & Theme

### Color Scheme
- **Primary**: Dark navy blue (`#001f3f` to `#0284c7`)
- **Accent**: Gold (`#fbbf24` to `#f59e0b`)
- **Dark**: Neutral grays (`#030712` to `#374151`)

### Custom Classes

```css
/* Gradients */
.bg-gradient-dark          /* Main background */
.text-gradient             /* Gold text gradient */
.bg-gradient-accent        /* Gold gradient */

/* Effects */
.glass                     /* Glass morphism */
.shadow-glow-gold          /* Gold glow effect */

/* Components */
.card                      /* Base card style */
.btn-primary               /* Primary button */
.badge-success             /* Success badge */
```

## Authentication

The app uses Firebase Authentication with two methods:

### Email/Password
- Sign up with email and password
- Role selection (Investor/Entrepreneur)
- Profile creation during signup

### Google OAuth
- One-click sign-in with Google
- Automatic profile creation
- Default role assignment

### Session Persistence
- Sessions persist using browser local storage
- Auto-redirect based on auth state
- Protected routes redirect unauthenticated users to login

## Hooks

### Custom Hooks (`lib/hooks.ts`)

- `useUser()` - Get current authenticated user
- `useFirestoreQuery()` - Subscribe to real-time Firestore data
- `useIsAuthenticated()` - Check authentication status
- `useMediaQuery()` - Media query hook for responsive design
- `useIsMobile()` - Check if device is mobile
- `useDebounce()` - Debounce values
- `useLocalStorage()` - Manage local storage
- `useAsync()` - Handle async operations with loading state

## Firebase Integration

### Configuration
Firebase config is in `lib/firebase.ts` with:
- Authentication (Auth, GoogleAuthProvider)
- Firestore database
- Storage for file uploads
- Persistent login

### Auth Functions (`lib/auth.ts`)
- `signUpWithEmail()` - Create new account
- `signInWithEmail()` - Login with email
- `signInWithGoogle()` - Google OAuth login
- `signOut()` - Logout
- `getUserProfile()` - Fetch user data
- `searchUsers()` - Search by role or query

### User Profile Structure
```typescript
interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'investor' | 'entrepreneur';
  createdAt: Date;
  industry?: string;
  bio?: string;
}
```

## Forms & Validation

Forms use React Hook Form with Zod for validation:

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export default function MyForm() {
  const { register, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  return (
    <input {...register('email')} />
  );
}
```

## Error Handling

- Firebase errors are caught and user-friendly messages displayed
- Toast notifications for success/error feedback
- Form validation with error messages
- Network error handling in API calls

## Loading States

- `LoadingSpinner` component for async operations
- Button loading states with disabled attribute
- Page loading fallback in AuthProvider
- Skeleton loading states (optional implementation)

## Responsive Design

- Mobile-first approach
- Tailwind breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Sidebar collapses on mobile
- Touch-friendly button sizes
- Readable text on all screen sizes

## Performance

- Static generation where possible
- Image optimization with Next.js Image component
- CSS-in-JS minimization with Tailwind
- Code splitting automatic with Next.js
- Font optimization with system fonts

## Accessibility

- Semantic HTML elements
- ARIA labels and roles
- Keyboard navigation support
- Focus states on interactive elements
- Color contrast compliance
- Form labels associated with inputs

## Environment Variables

```
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID

# API
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001

# AI
NEXT_PUBLIC_GEMINI_API_KEY
```

All `NEXT_PUBLIC_` variables are exposed to the browser and safe for public use.

## Available Scripts

```bash
# Development
npm run dev              # Start dev server

# Production
npm run build            # Build for production
npm start                # Start production server

# Quality
npm run lint             # Run ESLint
npm run type-check       # TypeScript type checking
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Android 90+)

## Future Enhancements

- [ ] Real-time messaging with WebSockets
- [ ] Document collaboration and sharing
- [ ] Calendar integration
- [ ] Google Forms questionnaire embedding
- [ ] Gemini AI integration for deal analysis
- [ ] Video call integration
- [ ] Deal document templates
- [ ] Analytics dashboard
- [ ] Email notifications
- [ ] Two-factor authentication
- [ ] Profile verification system
- [ ] Advanced search and filtering

## Security

- Firebase Authentication for user management
- Environment variables for sensitive data
- CORS configuration for API calls
- HTTPS enforced in production
- Input validation and sanitization
- XSS protection with React's built-in escaping

## Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit changes (`git commit -m 'Add amazing feature'`)
3. Push to branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## License

This project is proprietary to Studex Global Markets.

## Support

For support, contact the development team or create an issue in the repository.

## Changelog

### Version 0.1.0 (Initial MVP)
- User authentication with Firebase
- Dashboard with metrics and charts
- Deal pipeline management
- Real-time messaging interface
- Time tracking system
- User settings and profile management
- Responsive mobile-first design
- Production-ready code structure
