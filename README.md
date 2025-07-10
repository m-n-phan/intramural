# Intramural - Sports Management Platform

Intramural is a web and mobile platform designed to help colleges and universities manage their intramural sports programs. It provides a modern, streamlined experience for administrators, team captains, players, and staff, replacing outdated spreadsheet-based workflows. This platform aims to reduce administrative time, increase student engagement, and provide a reliable monetization solution.

-----

## Key Features

  * **Role-Based Access Control**: Different user roles (Admin, Captain, Player, Referee) with specific permissions.
  * **Team and Roster Management**: Captains can create teams, manage rosters, and handle player invitations.
  * **Scheduling and Standings**: Automated game scheduling and real-time updates of standings.
  * **Mobile-First Design**: A fully responsive interface with a focus on mobile usability for players and staff.
  * **Offline Functionality**: Staff can enter live scores from their mobile devices, even with intermittent internet connectivity.
  * **Secure Payments**: Integration with Stripe for handling team and player fees securely.

-----

## Tech Stack

| Category      | Technology                                                                                                  |
| ------------- | ----------------------------------------------------------------------------------------------------------- |
| **Frontend** | [React](https://reactjs.org/), [Vite](https://vitejs.dev/), [Tailwind CSS](https://tailwindcss.com/)           |
| **Backend** | [Node.js](https://nodejs.org/), [Express](https://expressjs.com/)                                             |
| **Database** | [PostgreSQL](https://www.postgresql.org/), [Drizzle ORM](https://orm.drizzle.team/)                           |
| **Auth** | [Clerk](https://clerk.com/)                                                                                 |
| **UI** | [shadcn/ui](https://ui.shadcn.com/)                                                                         |
| **Testing** | [Vitest](https://vitest.dev/), [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) |

-----

## File Structure

```
├── client/         # Frontend application
│   ├── src/
│   │   ├── components/ # UI components
│   │   ├── hooks/      # Custom React hooks
│   │   ├── lib/        # Utility functions
│   │   └── pages/      # Application pages
├── migrations/     # Database migrations
├── server/         # Backend server
│   ├── __tests__/  # Server-side tests
│   └── ...
├── shared/         # Shared code (e.g., database schema)
└── ...
```

-----

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

  * Node.js and npm
  * PostgreSQL

### Installation

1.  Clone the repo
    ```sh
    git clone https://github.com/your_username/intramural.git
    ```
2.  Install NPM packages
    ```sh
    npm install
    ```
3.  Set up your environment variables by creating a `.env` file and adding the necessary keys (see `.env.backup` for an example).
4.  Run the database migrations
    ```sh
    npm run db:push
    ```
5.  Start the development server
    ```sh
    npm run dev
    ```

-----

## Environment Variables

To run this project, you will need to add the following environment variables to your `.env` file:

  * `DATABASE_URL`: The connection string for your PostgreSQL database.
  * `STRIPE_SECRET_KEY`: Your secret key from Stripe for payment processing.
  * `VITE_STRIPE_PUBLIC_KEY`: Your public key from Stripe.
  * `VITE_CLERK_PUBLISHABLE_KEY`: Your publishable key from Clerk for authentication.
  * `CLERK_SECRET_KEY`: Your secret key from Clerk.
  * `CLERK_WEBHOOK_SECRET`: Your webhook secret from Clerk.
  * `GEMINI_API_KEY`: Your API key for Gemini.

-----

## Usage

Once the application is running, you can access it at `http://localhost:3000`. You can sign up as a new user and explore the different features of the platform.

The main dashboard provides an overview of ongoing and upcoming games, team standings, and other relevant information. From there, you can navigate to different sections to manage sports, teams, and schedules.

-----

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

-----

## License

Distributed under the MIT License. See `LICENSE` for more information.