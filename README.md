# Fitness Tracker MVP

This is a feature-rich, single-page application (SPA) designed as a Minimum Viable Product (MVP) for a fitness tracking service. It allows users to monitor their daily caloric intake, log workouts, and manage their fitness goals. The application is built with a modern tech stack and features a clean, responsive user interface.

## Features

*   **User Authentication:** A mock login system to simulate user accounts.
*   **Multi-Profile Management:** Supports multiple user profiles under a single account.
*   **Dashboard:** A comprehensive summary of the user's daily activity, including:
    *   Net calorie tracking with a visual pie chart.
    *   Breakdown of consumed and burned calories.
    *   Calorie goal display.
*   **Meal Logger:**
    *   Search for food items from a pre-defined database.
    *   Log meals for breakfast, lunch, dinner, and snacks.
    *   View a log of today's meals and their caloric value.
*   **Workout Tracker:**
    *   Choose between home and gym workout sessions.
    *   Follow pre-defined workout plans based on experience level and fitness goals.
    *   Track completed sets and automatically calculate calories burned.
*   **Settings:**
    *   Update user profile information (name, etc.).
    *   Adjust daily fitness goals (e.g., calorie targets).

## Tech Stack

*   **Frontend:** [React](https://react.dev/)
*   **Build Tool:** [Vite](https://vitejs.dev/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **Charts:** [Recharts](https://recharts.org/)
*   **Icons:** [Lucide React](https://lucide.dev/guide/packages/lucide-react)
*   **State Management:** React Redux

## Project Structure

The project is organized into a modular structure to separate concerns and improve maintainability:

```
/src
├───assets/         # Static assets like images and SVGs
├───components/     # Reusable UI components (e.g., Card, NavItem)
├───context/        # Global state management (AppContext)
├───data/           # Mock database and static data
├───hooks/          # Custom React hooks
├───layouts/        # Application layout components (e.g., AppShell)
├───pages/          # Top-level page components (e.g., Dashboard, MealLogger)
├───App.jsx         # Main application component
├───index.css       # Global CSS styles
└───main.jsx        # Application entry point
```

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

*   [Node.js](https://nodejs.org/en/) (v18.x or later)
*   [npm](https://www.npmjs.com/)

### Installation

1.  Clone the repo
    ```sh
    git clone https://github.com/your_username/fitness-app.git
    ```
2.  Install NPM packages
    ```sh
    npm install
    ```

### Running the Application

1.  Start the development server:
    ```sh
    npm run dev
    ```
2.  Open your browser and navigate to `http://localhost:5173` (or the address shown in your terminal).

### Login Credentials

Use the following credentials to log in to the application:

*   **Email:** `user@example.com`
*   **Password:** `password123`