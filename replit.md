# Overview

GameWin is a comprehensive Free Fire tournament platform with advanced reward systems, loyalty features, and monetization capabilities similar to MPL, WinZO, and PlayerzPot. Users can participate in Free Fire tournaments, earn DIL (hearts), medals, and real money prizes through an engaging gamified experience. The platform features custom room management, anti-cheat systems, spin wheels, referral programs, and VIP memberships.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**Framework**: React 18 with TypeScript using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Radix UI with shadcn/ui component library for consistent design
- **Styling**: Tailwind CSS with a custom gaming theme featuring dark mode and neon accents
- **State Management**: TanStack React Query for server state management and caching
- **Form Handling**: React Hook Form with Zod validation

**Design System**: Custom gaming-themed UI with glass morphism effects, neon colors (cyan, purple, amber), and responsive mobile-first design. The theme uses CSS custom properties for consistent color management.

## Backend Architecture

**Framework**: Express.js with TypeScript running on Node.js
- **API Design**: RESTful API structure with organized route handlers
- **Error Handling**: Centralized error middleware with proper HTTP status codes
- **Request Logging**: Custom middleware for API request/response logging
- **Development**: Hot reload with Vite integration for seamless development experience

**Storage Interface**: Abstracted storage layer with IStorage interface allowing for multiple implementations (currently using in-memory storage with plans for database integration)

## Data Storage Solutions

**Database**: PostgreSQL with Drizzle ORM
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Type Safety**: Full TypeScript integration with Drizzle-Zod for runtime validation
- **Connection**: Neon Database serverless PostgreSQL instance

**Data Models**:
- Users: Enhanced profiles with Free Fire UID, DIL balance, medals, trophies, VIP status, referral codes
- Tournaments: Advanced tournament system with kill bonuses, DIL rewards, medal distribution, VIP-only matches
- Registrations: Result verification with screenshot uploads, bonus tracking, medal awards
- Transactions: Complete payment gateway integration with UPI/Razorpay support, multiple transaction types
- Spin Wheel System: Reward distribution with probability-based prizes using DIL currency
- Medal System: Achievement tracking with bronze/silver/gold/platinum/diamond medals
- Referral System: User acquisition with bonus rewards for referrers and referees
- VIP Benefits: Premium membership with exclusive tournaments and enhanced rewards
- Daily Bonuses: Loyalty retention with daily DIL and cash rewards
- Tournament Templates: Quick tournament creation with predefined prize structures

## External Dependencies

**Database & ORM**:
- PostgreSQL (via Neon Database serverless)
- Drizzle ORM for type-safe database operations
- Drizzle Kit for schema migrations

**UI & Styling**:
- Radix UI for accessible component primitives
- Tailwind CSS for utility-first styling
- Lucide React for consistent iconography
- Class Variance Authority for component variants

**State & Forms**:
- TanStack React Query for server state management
- React Hook Form for form handling
- Zod for schema validation

**Development Tools**:
- Vite for fast development and building
- TypeScript for type safety
- ESBuild for production bundling
- Replit-specific plugins for development environment integration

**Session Management**:
- Connect-pg-simple for PostgreSQL session storage
- Express session middleware for user authentication

The application follows a clean architecture pattern with clear separation between frontend, backend, and data layers, making it maintainable and scalable for a gaming tournament platform.