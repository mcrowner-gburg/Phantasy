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

### July 24, 2025 - Dashboard Concert Integration
- Successfully integrated Phish.net API v5 for authentic concert data
- Updated dashboard to display last 3 completed shows in "Recent Shows" section
- Limited upcoming concerts to 3 shows with proper venue and location details
- Fixed dashboard routing and API query implementation for proper data fetching
- Dashboard now shows real Phish concert venues: Forest Hills Stadium, United Center, Hampton Coliseum
- Added date sorting for upcoming shows (closest to farthest chronological order)
- Implemented clickable links to Phish.net show pages for all concerts (dashboard and concerts page)
- Fixed URL formatting to match Phish.net structure with full month names (e.g., "july-23-2025")

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

### July 24, 2025 - 24-Month Rarity Focus & Conservative Scoring
- Updated rarity calculation to focus on last 24 months of performance data instead of all-time
- Implemented conservative scoring thresholds where medium rarity becomes low, high becomes medium
- Adjusted frequency thresholds: 1 play = high rarity, 2-3 plays = medium-high, 4-6 plays = medium
- Modified gap scoring to be more conservative with 40+ shows = max rarity, 20-39 = high rarity
- Changed default rarity scores from 50 to 35 points for more balanced gameplay
- Implemented new point calculation system: 1pt for played + 1pt for set opener + 1pt for encore (max 3pts per performance)
- Created comprehensive scoring engine with performance tracking (playedCount, openerCount, encoreCount)
- Added smart activity descriptions that dynamically reflect point combinations based on performance type

### July 24, 2025 - Draft Limit Reduction & Authentication Fix
- Reduced maximum drafted songs per user from 20 to 10 for more strategic gameplay
- Added backend validation to enforce 10-song draft limit with proper error messages
- Replaced all hardcoded DEMO_USER_ID constants with real authentication using useAuth hook
- Fixed TypeScript errors by updating all pages to use authenticated user data
- Updated dashboard, draft, and leaderboard pages to work with user-specific leagues
- Enhanced draft system to show accurate "slots remaining" count based on 10-song limit
- Expanded song catalog from 15 demo songs to 70 authentic Phish songs across all eras
- Added comprehensive song categories: Gamehendge, Classic, Jam, Rare, Modern, Cover, Epic, Funk, Composed
- Integrated Phish.net API to fetch complete song catalog with authentic performance data
- Implemented 24-month performance frequency sorting (most played to least played) 
- Songs now display real rarity scores based on actual recent performance statistics
- Expanded song catalog to 125 authentic Phish songs to support multiplayer drafting (10 players x 10 songs = 100+ needed)
- Added comprehensive song collection spanning all eras: 1.0 classics, 2.0 funk, 3.0 jams, 4.0 modern favorites

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
- **Base Points**: 1 point when a drafted song is played at a concert
- **Bonus Points**: +1 point if the song opens Set 1 or Set 2
- **Encore Bonus**: +1 point if the song is played as an encore
- **Maximum per performance**: 3 points (played + opener + encore)
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