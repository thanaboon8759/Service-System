# Service System 

## Architecture

The project is structured as a Monorepo:

- **/server**: Node.js/Express Backend API.
  - Handles Authentication, Ticket Management, and Database connections.
  - Serves the static React build in production.
- **/client**: React + Vite Frontend.
  - Modern, Responsive UI matching the original design.
  - Uses Context API for Authentication and Axios for API requests.

## Prerequisites

- Node.js (v16+)
- MongoDB (running locally or URI in .env)

## Installation

1.  **Install Dependencies** (Root, Server, and Client):
    ```bash
    npm run install:all
    ```
    *Alternatively, install manually in root, `/server`, and `/client`.*

2.  **Environment Setup**:
    - Ensure `/server/.env` is configured with `MONGODB_URL` and other secrets.

## Running Development

To start both the Backend (Port 5000) and Frontend (Port 5173) simultaneously:

```bash
npm run dev
```

- Access Frontend: [http://localhost:5173](http://localhost:5173)
- Access Backend API: [http://localhost:5000](http://localhost:5000)

## Production Build

To build the React frontend and serve it via Express:

1.  **Build Client**:
    ```bash
    npm run build
    ```
    This generates static files in `/client/dist`.

2.  **Serve**:
    ```bash
    npm run serve
    ```
    The Express server will detect `NODE_ENV=production` (set by the script or manually) and serve the frontend at [http://localhost:5000](http://localhost:5000).

## Features

- **User Authentication**: Register/Login (JWT).
- **User Dashboard**: Create tickets, view history, chat/notes, real-time status updates.
- **Admin Dashboard**: Manage tickets, update status, assign technicians, view stats.
- **Modern UI**: Polished interface with responsive design.

## Recent Updates

- **Fix Server Startup**: Resolved an issue with `path-to-regexp` in Express 5 by updating route definitions in `server.js`.
- **Logo Update**: Updated the application logo in the navigation bar and browser favicon (`/client/public/4449037.png`).
