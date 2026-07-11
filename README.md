# TradeTrust

TradeTrust is a platform designed to simplify and secure B2B trade. It gives businesses the tools they need to manage their product listings, negotiate deals, and conduct transactions with confidence, all backed by features like identity verification, secure escrow, and clear processes for inspections and dispute resolution. Essentially, it helps connect buyers and sellers and ensures their trades happen smoothly and safely.

## Description

This project offers a robust backend solution for a secure trade platform, built to facilitate transparent and efficient B2B transactions. It handles everything from user authentication and profile management to complex trade workflows, including product listings, secure escrow, and integrated mechanisms for dispute resolution. With a focus on reliability and scalability, TradeTrust aims to be the go-to platform for businesses looking to trade with confidence.

## Installation

Let's get TradeTrust up and running on your local machine. This project is a monorepo, so you'll set up both the backend and frontend.

First, clone the repository:

```bash
git clone https://github.com/Earnicle-APP/trade-trust.git
cd trade-trust
```

Next, install dependencies for the entire monorepo:

```bash
npm install
```

### Backend Setup (`apps/backend`)

The backend is a NestJS application that uses PostgreSQL as its database.

1.  **Navigate to the backend directory**:

    ```bash
    cd apps/backend
    ```

2.  **Set up your environment variables**:
    Create a `.env` file in the `apps/backend` directory based on the example below.

    ```dotenv
    # App
    PORT=8000
    FRONTEND_URL=http://localhost:3000

    # Database
    DATABASE_URL="postgresql://postgres:postgres@localhost:5433/trade-trust?schema=public"

    # JWT
    JWT_SECRET="yourSuperSecretJwtKey"
    JWT_ACCESS_EXPIRATION="15m" # e.g., 15m, 1h, 7d
    JWT_REFRESH_EXPIRATION="7d" # e.g., 15m, 1h, 7d

    # Resend (Email Service)
    RESEND_API_KEY="re_yourResendApiKey" # Optional, emails will log to console if not set
    RESEND_FROM="TradeTrust <onboarding@resend.dev>"
    APP_URL="http://localhost:3000" # URL for email links (e.g., verification, password reset)

    # Google OAuth (Optional)
    GOOGLE_CLIENT_ID="yourGoogleClientId"
    GOOGLE_CLIENT_SECRET="yourGoogleClientSecret"
    GOOGLE_CALLBACK_URL="http://localhost:8000/auth/google/callback"
    ```

3.  **Start the PostgreSQL database using Docker Compose**:

    ```bash
    docker-compose up -d
    ```

    This will start a PostgreSQL container accessible on `localhost:5433`.

4.  **Run Prisma migrations**:
    This will create the necessary database schema.

    ```bash
    npx prisma migrate dev --name init
    ```

5.  **Start the backend in development mode**:

    ```bash
    npm run dev
    ```

    The backend will be running on `http://localhost:8000`. API documentation (Swagger UI) will be available at `http://localhost:8000/api/docs`.

### Frontend Setup (`apps/frontend`)

The frontend is a Next.js application.

1.  **Navigate to the frontend directory**:

    ```bash
    cd apps/frontend
    ```

2.  **Start the frontend in development mode**:

    ```bash
    npm run dev
    ```

    The frontend will be running on `http://localhost:3000`.

## Usage

Once you have both the backend and frontend running:

*   **Access the Frontend**: Open your browser and go to `http://localhost:3000`. You'll see the main Next.js landing page. From here, you can build out the user interface to interact with the backend API.
*   **Explore the Backend API**: For API testing and documentation, visit the Swagger UI at `http://localhost:8000/api/docs`. Here you can see all available endpoints, their expected request bodies, and example responses. You can also send requests directly from the interface.

To interact with the backend, you'll typically:

1.  **Register** a new user or **Log in** to an existing account via the `/auth/register` or `/auth/login` endpoints.
2.  Use the `accessToken` received from login/refresh in the `Authorization: Bearer <token>` header for protected endpoints. You can set this in the Swagger UI for easy testing.
3.  Manage user profiles using the `/users` endpoints.
4.  If you enable Google OAuth, users can sign in using their Google accounts.

## Features

TradeTrust comes packed with features to handle a comprehensive B2B trade lifecycle:

*   **User Authentication**: Secure sign-up and sign-in with email/password, along with Google OAuth integration for convenience.
*   **Session Management**: JWT-based access tokens and long-lived refresh tokens for secure and persistent user sessions.
*   **Email Verification & Password Reset**: Automated email workflows for account verification and password recovery.
*   **User Profile Management**: Users can update their personal and company details.
*   **Role-Based Access Control (RBAC)**: Supports various roles like Buyer, Seller, Inspector, Arbitrator, and Admin, with appropriate permissions.
*   **Product Listings**: Sellers can create, manage, and view their product listings with details like price, quantity, category, and Incoterms.
*   **Trade Management**: Comprehensive workflow for trades, from drafting and negotiation to funding, shipment, and completion.
*   **Escrow System**: A secure escrow system to hold funds until trade conditions are met, protecting both buyers and sellers.
*   **Shipment Tracking**: Record shipment details, tracking numbers, and proof documents.
*   **Inspection Process**: Facilitates product inspections, allowing for the recording of results, photos, and notes by designated inspectors.
*   **Dispute Resolution**: A structured process for raising and resolving trade disputes, including evidence submission and arbitration.
*   **Notifications**: System for sending various types of notifications to users (e.g., trade status updates, messages).
*   **KYC (Know Your Customer)**: Manages different levels and statuses of KYC documents for user verification.
*   **Rate Limiting**: Built-in rate limiting to protect the API from abuse.

## Technologies Used

| Technology    | Description                                       |
| :------------ | :------------------------------------------------ |
| **Node.js**   | JavaScript runtime for server-side applications   |
| **NestJS**    | Progressive Node.js framework for building efficient, reliable, and scalable server-side applications |
| **TypeScript**| Superset of JavaScript that adds static types     |
| **Prisma**    | Next-generation ORM for Node.js and TypeScript    |
| **PostgreSQL**| Powerful, open-source object-relational database system |
| **Docker**    | Containerization platform for easy environment setup |
| **Passport.js**| Flexible authentication middleware for Node.js    |
| **JWT**       | JSON Web Tokens for secure API authentication     |
| **Resend**    | Email API for developers                          |
| **Swagger**   | API documentation and visualization (OpenAPI)     |
| **Next.js**   | React framework for production (frontend)         |
| **React**     | JavaScript library for building user interfaces (frontend) |
| **Tailwind CSS**| Utility-first CSS framework for rapid UI development |
| **Turborepo** | High-performance build system for JavaScript and TypeScript monorepos |

## Contributing

We'd love for you to contribute to TradeTrust! If you have suggestions, bug reports, or want to add new features, please feel free to fork the repository and open a pull request.

Here’s a general guide:

1.  **Fork** the repository.
2.  **Create** a new branch for your feature or bug fix: `git checkout -b feature/your-feature-name`.
3.  **Make** your changes and ensure your code adheres to the project's coding standards.
4.  **Write** clear and concise commit messages.
5.  **Push** your branch: `git push origin feature/your-feature-name`.
6.  **Open** a pull request with a detailed description of your changes.

## License

This project is licensed under the ISC License.

## Author Info

*   **LinkedIn**: [Your LinkedIn](https://linkedin.com/in/yourusername)
*   **X (Twitter)**: [@yourhandle](https://x.com/yourhandle)

---

[![Readme was generated by Dokugen](https://img.shields.io/badge/Readme%20was%20generated%20by-Dokugen-brightgreen)](https://www.npmjs.com/package/dokugen)