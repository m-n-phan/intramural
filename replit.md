# Intramural Sports Management Platform

## Overview

This is a full-stack web application for managing intramural sports programs at colleges and universities. The platform helps administrators organize sports, manage teams, schedule games, and handle payments, while providing students with an easy way to participate in campus sports activities.

The system now includes comprehensive role-based access control supporting administrators, team captains, referees, and players with appropriate permissions for each role.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite for development and production builds
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth (OpenID Connect)
- **Payment Processing**: Stripe integration
- **Session Management**: Express sessions with PostgreSQL storage

### Database Design
- **ORM**: Drizzle with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` - shared between client and server
- **Migrations**: Managed through Drizzle Kit
- **Connection**: Neon serverless PostgreSQL with connection pooling

## Key Components

### Authentication System
- **Provider**: Replit Auth using OpenID Connect
- **Strategy**: Passport.js with OpenID Client strategy
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **User Management**: Automatic user creation/updates on login
- **Role-Based Access Control**: Four user roles with specific permissions:
  - **Admin**: Full system access, user management, sports creation
  - **Captain**: Team management, player registration, team-specific features
  - **Referee**: Game management, score updates, referee tools
  - **Player**: Team participation, schedule viewing, game participation

### Sports Management
- **Sports**: CRUD operations for different sports with configurable rules
- **Teams**: Team registration, roster management, captain assignments
- **Games**: Scheduling, score tracking, status management
- **Standings**: Automatic calculation based on game results

### Payment Integration
- **Provider**: Stripe for payment processing
- **Features**: Team registration fees, subscription management
- **Security**: Server-side payment intent creation and verification

### Real-time Features
- **WebSocket**: Planned for live score updates and notifications
- **Live Updates**: TanStack Query for real-time data synchronization

## Data Flow

1. **User Authentication**: Users authenticate via Replit Auth, creating/updating user records in PostgreSQL
2. **Data Fetching**: Client uses TanStack Query to fetch data from Express API routes
3. **State Management**: Server state managed by TanStack Query, local state by React hooks
4. **Database Operations**: Express routes use Drizzle ORM to interact with PostgreSQL
5. **Payment Processing**: Stripe integration handles payment flows with webhook validation

## External Dependencies

### Core Infrastructure
- **Database**: Neon PostgreSQL (serverless)
- **Authentication**: Replit Auth service
- **Payments**: Stripe payment processing
- **Development**: Replit development environment

### Key Libraries
- **UI Components**: Radix UI primitives via shadcn/ui
- **Validation**: Zod for schema validation
- **Date Handling**: date-fns for date manipulation
- **HTTP Client**: Fetch API with TanStack Query

## Deployment Strategy

### Development Environment
- **Platform**: Replit with hot reloading
- **Database**: Neon development database
- **Build**: Vite dev server for frontend, tsx for backend
- **Environment**: Development mode with additional debugging tools

### Production Deployment
- **Frontend**: Static build served by Express
- **Backend**: Bundled with esbuild for Node.js
- **Database**: Production PostgreSQL instance
- **Process**: Single Node.js process serving both frontend and API

### Build Process
1. Frontend built with Vite to `dist/public`
2. Backend bundled with esbuild to `dist/index.js`
3. Database schema pushed using Drizzle Kit
4. Production server starts with `node dist/index.js`

### Configuration Management
- Environment variables for database, auth, and payment credentials
- Separate development and production configurations
- Session secrets and API keys managed through environment variables

The application follows a modern full-stack architecture with strong typing throughout, comprehensive error handling, and scalable patterns for growth from small colleges to large universities.