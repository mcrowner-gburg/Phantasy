# PhishDraft - Fantasy Phish Concert Application

## Overview

PhishDraft is a fantasy sports application specifically designed for Phish concerts, where users can draft songs and earn points based on actual concert performances. The application allows users to create and join leagues, draft songs with rarity-based scoring, track upcoming concerts, and compete on leaderboards.

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
- Simple username/password authentication
- Session-based user management
- User registration and login endpoints

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