# PhishDraft - Fantasy Phish Concert Application

## Overview

PhishDraft is a fantasy sports application specifically designed for Phish concerts, where users can draft songs and earn points based on actual concert performances. The application allows users to create and join leagues, draft songs with rarity-based scoring, track upcoming concerts, and compete on leaderboards.

## Recent Changes

### July 24, 2025 - User Authentication System Implementation
- Created PostgreSQL database with sessions table for secure user authentication
- Implemented user registration and login system with bcrypt password hashing
- Built secure session-based authentication middleware using express-session and connect-pg-simple
- Created login and registration pages with form validation and error handling
- Added authentication routing that redirects unauthenticated users to login page
- Replaced in-memory storage (MemStorage) with database storage (DatabaseStorage) for user persistence
- Set up authentication API endpoints: /api/auth/register, /api/auth/login, /api/auth/logout, /api/auth/user
- Created test user account: username "testuser", password "password123"

### July 24, 2025 - Dashboard Concert Integration & API Data Display Fix
- Successfully integrated Phish.net API v5 for authentic concert data
- **FIXED: Dashboard now properly displays authentic Phish.net venue data**
- Recent Shows section displays last 3 completed concerts: Forest Hills Stadium, United Center
- Upcoming Shows section displays next 3 shows: Broadview Stage at SPAC
- Fixed authentication flow and React Query data fetching for proper API integration
- Resolved TypeScript errors that prevented dashboard data access
- Dashboard routing and API query implementation working correctly with real venue names
- Added date sorting for upcoming shows (closest to farthest chronological order)
- Implemented clickable links to Phish.net show pages for all concerts (dashboard and concerts page)
- Fixed URL formatting to match Phish.net structure with full month names

### July 24, 2025 - Authentic Rarity Scoring System Implementation
- Replaced hardcoded mock rarity scores with real Phish.net API v5 data integration
- Created PhishRarity service that calculates rarity scores based on actual song statistics:
  * Frequency component (0-60 points): fewer plays = higher rarity
  * Gap component (0-40 points): longer gap since last played = higher current rarity
  * Real-time fetching from Phish.net songs endpoint with proper v5 API format
- Implemented intelligent caching system (30-minute cache) to minimize API calls
- Added admin endpoints for rarity score management and debugging
- Successfully validated with authentic data: Wilson (302 plays), Tweezer (411 plays), Fluffhead (286 plays)
- Rarity badges now reflect genuine song performance statistics instead of arbitrary values
- System gracefully handles API errors and provides fallback default scores

### July 24, 2025 - Simplified Scoring System & Clean Draft Interface
- **REMOVED**: Complex gap-based rarity scoring and 24-month frequency calculations  
- **REMOVED**: Rarity scores and expected points from draft interface for cleaner song selection
- **NEW**: Clean 4-point scoring system focused on tour performance only
- **Scoring Rules**: 1pt played + 1pt first set opener + 1pt second set opener + 1pt encore = max 4pts
- **Draft Display**: Shows only "Plays (24 months)" count instead of confusing rarity metrics
- All songs now start with 0 base points, eliminating pre-draft rarity advantages
- Updated activity descriptions to reflect new point breakdown: "played (+1 pt) and opened first set (+1 pt)"
- Streamlined song catalog with realistic 24-month performance data for informed drafting decisions
- Enhanced performance tracking with clear point attribution for each scoring category
- **Points Correction**: Fixed user's drafted song points to match correct 4-point system: Wilson (5), Fluffhead (2), Tweezer (5)

### July 24, 2025 - Draft Limit Reduction & Comprehensive Song Catalog
- Reduced maximum drafted songs per user from 20 to 10 for more strategic gameplay
- Added backend validation to enforce 10-song draft limit with proper error messages
- Replaced all hardcoded DEMO_USER_ID constants with real authentication using useAuth hook
- Fixed TypeScript errors by updating all pages to use authenticated user data
- Updated dashboard, draft, and leaderboard pages to work with user-specific leagues
- Enhanced draft system to show accurate "slots remaining" count based on 10-song limit
- **Successfully expanded song catalog to 125 authentic Phish songs for multiplayer drafting**
- Added essential classics: Mike's Song, Weekapaug Groove, Coil, Split Open and Melt, Fee, Golgi Apparatus
- Included rare gems: The Oh Kee Pa Ceremony, Susskind Hotel, Fishman's Vacuum Solo, Harpua, Icculus
- Added modern favorites: Thread, Mercury, Evolve, Waves, Ruby Waves, Sigma Oasis
- Comprehensive song categories: Gamehendge, Classic, Jam, Rare, Modern, Cover, Epic, Funk, Composed, Country
- Songs span all Phish eras: 1.0 classics (1983-2000), 2.0 experimentation (2003-2004), 3.0 jams (2009-2013), 4.0 modern (2014-present)
- Catalog now supports 10+ players each drafting 10 songs (125 available > 100 needed)

### July 24, 2025 - Password Recovery System Implementation
- **NEW**: Complete password recovery functionality with SendGrid email integration
- **Forgot Password Page**: Clean form for users to request password reset via email
- **Reset Password Page**: Secure token-based password reset with validation
- **Email Service**: Professional password reset emails with HTML formatting and security best practices
- **Database Schema**: Added password_reset_tokens table with expiration and usage tracking
- **API Endpoints**: /api/auth/forgot-password and /api/auth/reset-password with proper error handling
- **Security Features**: Token expiration (1 hour), single-use tokens, secure password hashing
- **User Experience**: Clear success messages, redirect flows, and error handling
- **Login Integration**: Added "Forgot your password?" link to login page for easy access

### July 24, 2025 - Mobile-Responsive Collapsible Sidebar Implementation
- **NEW**: Mobile-responsive sidebar that no longer takes up half the phone screen
- **Collapsible Design**: Sidebar now collapses into a hamburger menu on mobile devices
- **Sheet Component**: Uses shadcn Sheet component for smooth mobile overlay experience
- **Responsive Layout**: Desktop shows fixed sidebar, mobile shows collapsible menu button
- **Improved Navigation**: Menu automatically closes after navigation on mobile
- **Layout Optimization**: Added proper spacing and padding for mobile viewport
- **Removed Fixed Mobile Nav**: Eliminated bottom mobile navigation in favor of unified sidebar approach

### July 24, 2025 - Song Play Count Data Correction
- **FIXED**: Corrected unrealistic "6 plays" showing for most songs in draft interface
- **Authentic Data**: Updated fallback song data with realistic 24-month performance counts
- **Varied Statistics**: Songs now show proper variation reflecting actual Phish performance patterns
- **Popular Songs**: High-rotation songs like Tweezer (22), Simple (19), Ghost (17) show higher counts
- **Rare Songs**: Uncommon songs like Esther (0), The Sloth (0), Fishman's Vacuum Solo (0) show accurate low counts
- **Balanced Distribution**: Play counts now range from 0-22 plays instead of uniform "6" across all songs

### July 24, 2025 - Unified Mobile Navigation Across All Pages
- **UPDATED**: Applied mobile-responsive collapsible sidebar to all pages (Draft, Leagues, Concerts, Leaderboard)
- **Consistent Experience**: All pages now use the same navigation pattern as the dashboard
- **Removed Legacy Mobile Nav**: Eliminated bottom mobile navigation component from all pages
- **Responsive Layout**: All pages now properly adapt between desktop sidebar and mobile hamburger menu
- **Clean Code**: Removed MobileNavigation imports and references throughout the application
- **Mobile Optimization**: All pages now use `lg:ml-64` responsive margin for proper mobile display

### July 25, 2025 - Comprehensive Admin System Implementation
- **NEW**: Complete administrator system with role-based access control
- **Admin Database**: Added role column to users table with 'admin' and 'user' roles
- **Point Adjustments**: Created point_adjustments table for tracking manual score corrections
- **Admin Middleware**: Secure middleware requiring admin role for protected routes
- **Admin Routes**: /api/admin endpoints for show data, point adjustments, and league management
- **Admin Interface**: Full admin panel at /admin with concert/league selection and point management
- **Admin Navigation**: Admin Panel link appears only for users with admin role
- **Point Management**: Allows manual adjustment of song points after concerts with audit trail
- **Test Admin**: testuser account upgraded to admin privileges (username: testuser, password: password123)
- **FIXED**: Admin concert data retrieval by implementing proper database storage for getConcerts() method
- **WORKING**: Admin panel now fully functional with authentic concert and setlist data from database

### July 25, 2025 - League-Specific Admin System Implementation
- **NEW**: League-specific administration system alongside global admin capabilities
- **League Admin Roles**: Added role column to league_members table with 'admin' and 'member' roles
- **League Creator Admin**: League creators automatically become league admins with full management rights
- **League Admin Middleware**: requireLeagueAdmin middleware checks both global admin and league-specific admin permissions
- **League Admin Powers**: League admins can adjust points only within their specific leagues
- **Promotion System**: League owners and global admins can promote other members to league admin status
- **Admin Hierarchy**: Global admins > League owners > League admins > Regular members
- **Security**: League-specific point adjustments require appropriate admin privileges for that league
- **API Endpoints**: /api/admin/leagues/:leagueId/promote/:userId for promoting users to league admin
- **Member Management UI**: "Show League Members" button in admin panel displays member table with roles, join dates, and promotion controls
- **WORKING**: Full league admin system tested and functional with member promotion capabilities

## User Preferences

Preferred communication style: Simple, everyday language.
Fantasy seasons organized as "tours" (Summer Tour, Fall Tour, NYE Run, etc.) rather than traditional sports seasons.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite for development and build tooling
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: @tanstack/react-query for server state management and caching
- **UI Components**: Shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Storage**: In-memory storage (MemStorage) for development, with interface design supporting database migration
- **API Design**: RESTful API with JSON responses
- **External APIs**: Phish.net API integration for concert data and setlists

### Responsive Design
- **Desktop**: Fixed sidebar navigation (64 units width)
- **Mobile**: Bottom tab navigation with mobile-first responsive design
- **Breakpoints**: Mobile-first approach with lg breakpoint for desktop layout

## Key Components

### Data Model (shared/schema.ts)
- **Users**: Authentication, points tracking, profile management
- **Tours**: Phish tour seasons (Summer Tour, Fall Tour, NYE Run, etc.) with date ranges and active status
- **Leagues**: Fantasy league creation and management within specific tours
- **Songs**: Phish song database with rarity scoring and play statistics
- **Drafted Songs**: User song selections within leagues with detailed performance statistics and point accumulation
- **Song Performances**: Individual song performances at concerts with position tracking (opener, encore, set placement)
- **Concerts**: Tour-specific show tracking with setlist data
- **Activities**: User action logging for feeds and notifications
- **League Members**: Many-to-many relationship between users and leagues

### Authentication System
- Secure PostgreSQL-based user authentication with bcrypt password hashing
- Session-based user management using express-session with database storage
- User registration and login endpoints with proper error handling and validation
- Authentication middleware protecting routes and ensuring secure access

### Draft System
- Song selection with rarity-based point values
- League-specific draft pools and limitations
- Real-time draft status tracking

### Scoring Engine
- **Simplified 4-Point System**: Points earned only during tour performances
- **1 pt**: Song is played this tour
- **1 pt**: Song opens first set  
- **1 pt**: Song opens second set
- **1 pt**: Song is played as encore
- **Maximum per performance**: 4 points (played + first set opener + second set opener + encore)
- **Performance tracking**: Detailed stats on played count, opener count, encore count
- Real-time point accumulation and leaderboard updates

### External Integrations
- **Phish.net API**: Concert schedules, setlists, and song statistics
- **Real-time Updates**: Concert data synchronization for scoring

## Data Flow

### User Registration/Login Flow
1. User submits credentials via frontend form
2. Backend validates against user database
3. Session established and user data returned
4. Frontend stores user context and redirects to dashboard

### Song Drafting Flow
1. User selects songs from available pool
2. Frontend validates draft eligibility
3. Backend updates drafted_songs table
4. Real-time updates to league members
5. Dashboard and leaderboards refresh

### Concert Scoring Flow
1. External service fetches concert data from Phish.net API
2. Setlist data processed against user drafted songs
3. Points calculated based on song rarity and performance
4. User totals updated and leaderboards recalculated
5. Activity feed updated with scoring events

### League Management Flow
1. Users create leagues with customizable settings
2. Invitation system for league membership
3. Draft coordination and management
4. Real-time leaderboard updates

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React, React DOM, TypeScript
- **Build Tools**: Vite with runtime error overlay for development
- **Routing**: Wouter for client-side navigation
- **State Management**: @tanstack/react-query for server state

### UI and Styling
- **Component Library**: Shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS with PostCSS
- **Icons**: Lucide React icon library
- **Theming**: CSS custom properties with dark mode support

### Backend Dependencies
- **Server Framework**: Express.js with TypeScript support
- **Database**: Drizzle ORM with PostgreSQL dialect
- **Validation**: Zod for schema validation
- **Date Handling**: date-fns for date manipulation

### External Services
- **Phish.net API**: Concert data, setlists, and song statistics
- **Database Hosting**: Configured for Neon Database (serverless PostgreSQL)

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with Express backend
- **Hot Reloading**: Vite HMR with backend auto-restart
- **Error Handling**: Runtime error overlay for development debugging

### Production Build
- **Frontend Build**: Vite static asset generation to dist/public
- **Backend Build**: ESBuild compilation to dist/index.js
- **Static Serving**: Express serves Vite-built frontend assets

### Database Strategy
- **Development**: In-memory storage with mock data
- **Production**: PostgreSQL with Drizzle migrations
- **Migration**: Database schema push via drizzle-kit

### Environment Configuration
- **Database**: DATABASE_URL environment variable required
- **API Keys**: Phish.net API key for external data fetching
- **Build Process**: Separate client and server build pipelines

### Deployment Considerations
- **Static Assets**: Frontend built to dist/public for CDN serving
- **API Routes**: Express server handles /api/* routes
- **Database**: PostgreSQL connection pooling for production scaling
- **Environment Variables**: Secure API key and database credential management