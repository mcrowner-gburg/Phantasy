# PhishDraft - Fantasy Phish Concert Application

## Overview
PhishDraft is a fantasy sports application where users draft Phish songs and score points based on their live performance in actual concerts. The application aims to provide an engaging experience for Phish fans by allowing them to create and join leagues, draft songs with dynamic rarity-based scoring, track upcoming concerts, and compete on leaderboards. The project ambition is to become the go-to platform for fantasy Phish concert enthusiasts, offering a unique blend of music fandom and competitive gaming.

## User Preferences
Preferred communication style: Simple, everyday language.
Fantasy seasons organized as "tours" (Summer Tour, Fall Tour, NYE Run, etc.) rather than traditional sports seasons.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, using Vite for development and build.
- **Routing**: Wouter for lightweight client-side routing.
- **State Management**: @tanstack/react-query for server state management and caching.
- **UI Components**: Shadcn/ui component library built on Radix UI primitives.
- **Styling**: Tailwind CSS with custom CSS variables for theming.
- **Forms**: React Hook Form with Zod for validation.
- **Responsive Design**: Mobile-first approach with a collapsible sidebar on mobile (hamburger menu) and a fixed sidebar on desktop.

### Backend Architecture
- **Framework**: Express.js with TypeScript.
- **Database**: PostgreSQL with Drizzle ORM for type-safe operations.
- **Authentication**: Secure, session-based user authentication using bcrypt for password hashing and express-session with PostgreSQL storage. Includes password recovery via SendGrid and optional phone authentication with Twilio SMS verification.
- **API Design**: RESTful API with JSON responses.
- **Core Logic**:
    - **Draft System**: Supports real-time, scheduled, turn-based snake drafts where each song can only be drafted once per league.
    - **Scoring Engine**: Simplified 4-point system based on song performance in concerts (1pt played, 1pt first set opener, 1pt second set opener, 1pt encore).
    - **Admin System**: Comprehensive role-based access control (global and league-specific admins) for managing points, users, and leagues.
    - **Dynamic Song System**: Fetches and caches song data, including rarity scores and categories, dynamically from Phish.net API, persisting only drafted songs to the database.
- **Data Model**: Key entities include Users, Tours, Leagues, Songs, Drafted Songs, Song Performances, Concerts, Activities, and League Members.

## External Dependencies

- **Phish.net API**: Primary source for authentic concert schedules, setlists, and song statistics.
- **SendGrid**: Used for email services, specifically for password recovery notifications.
- **Twilio**: Integrated for SMS services, enabling phone-based authentication and sending league invitations.
- **Neon Database**: Configured for production PostgreSQL database hosting.