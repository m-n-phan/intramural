# Intramural Sports Management Platform

A comprehensive web-based platform for managing college and university intramural sports programs. Built with React, Node.js, and PostgreSQL.

## 🏆 Features

- **User Management**: Role-based access control (Admin, Captain, Referee, Player)
- **Authentication**: Secure login via Replit Auth (OpenID Connect)
- **Sports Management**: Create and manage multiple sports with custom rules
- **Team Management**: Team registration, roster management, captain assignments
- **Game Scheduling**: Advanced scheduling with division and gender restrictions
- **Payment Integration**: Stripe-powered team registration fees
- **Real-time Analytics**: Track participation, engagement, and program success
- **Responsive Design**: Mobile-first design with dark/light theme support

## 🚀 Tech Stack

### Frontend
- **React** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** + **shadcn/ui** for styling
- **TanStack Query** for state management
- **Wouter** for routing
- **React Hook Form** + **Zod** for form validation

### Backend
- **Node.js** with **Express**
- **TypeScript** for type safety
- **Drizzle ORM** with PostgreSQL
- **Replit Auth** for authentication
- **Stripe** for payment processing
- **WebSocket** support for real-time features

### Database
- **PostgreSQL** with Supabase
- **Drizzle Kit** for migrations
- **Connection pooling** for scalability

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd intramural-sports
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file with:
   ```env
   DATABASE_URL=your_postgresql_url
   SESSION_SECRET=your_session_secret
   STRIPE_SECRET_KEY=your_stripe_secret_key
   VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
   ```

4. **Set up the database**
   ```bash
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## 🏗️ Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utility functions
├── server/                # Express backend
│   ├── db.ts             # Database connection
│   ├── routes.ts         # API routes
│   ├── storage.ts        # Database operations
│   └── replitAuth.ts     # Authentication setup
├── shared/               # Shared types and schemas
│   └── schema.ts         # Database schema
└── package.json
```

## 🔐 Authentication Flow

1. **Landing Page**: Users see marketing content and sign-up options
2. **Replit Auth**: Secure authentication via OpenID Connect
3. **User Creation**: Automatic user record creation with default "player" role
4. **Onboarding**: New users complete interest and preference setup
5. **Dashboard Access**: Full platform access based on user role

## 👥 User Roles

- **Admin**: Full system access, user management, sports creation
- **Captain**: Team management, player registration, team-specific features
- **Referee**: Game management, score updates, referee tools
- **Player**: Team participation, schedule viewing, game participation

## 🎯 Key Features

### Sports Management
- Create multiple sports with custom rules
- Configure team limits, player limits, and fees
- Set registration deadlines and season dates
- Gender-specific and co-ed divisions

### Team Management
- Team registration with captain assignment
- Roster management with player roles
- Payment tracking and Stripe integration
- Team statistics and performance tracking

### Game Scheduling
- Smart scheduling with conflict detection
- Division and gender-based restrictions
- Automatic standings calculation
- Real-time score updates

### Analytics Dashboard
- Participation statistics
- Revenue tracking
- Team performance metrics
- User engagement analytics

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run db:push` - Push database schema changes
- `npm run db:studio` - Open Drizzle Studio

### Database Schema

The application uses a comprehensive schema with:
- Users (authentication and profiles)
- Sports (sport definitions and rules)
- Teams (team management and stats)
- Games (scheduling and results)
- Team Members (roster management)

### API Endpoints

- `GET /api/auth/user` - Get current user
- `POST /api/onboarding/complete` - Complete user onboarding
- `GET /api/sports` - List all sports
- `GET /api/teams` - List all teams
- `GET /api/games` - List all games
- `POST /api/create-payment-intent` - Create Stripe payment

## 🚢 Deployment

### Production Build
```bash
npm run build
```

### Environment Setup
Ensure all environment variables are configured:
- Database URL for production PostgreSQL
- Stripe API keys for payment processing
- Session secrets for authentication
- Replit Auth configuration

### Deployment Options
- **Replit Deployments**: Automatic deployment from Git
- **Vercel/Netlify**: Frontend deployment with serverless functions
- **Railway/Heroku**: Full-stack deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the documentation in `replit.md`
- Review the component examples in `/client/src/components`
- Check the API routes in `/server/routes.ts`

## 🔮 Future Enhancements

- Mobile app development (React Native)
- Advanced analytics and reporting
- Tournament bracket management
- Live streaming integration
- Multi-university support
- API for third-party integrations# intramural
