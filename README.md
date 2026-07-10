# Mini IT Helpdesk Ticket Tracking System

A full-stack IT Helpdesk Ticket Tracking System designed for a software developer internship demo. This application runs with zero configuration by utilizing Node's native SQLite module (`node:sqlite`) for database storage. 

## Features
- **Authentication**: JWT-based session security with two pre-configured roles:
  - **Employee**: Can submit new support tickets and view/filter their own tickets.
  - **IT Agent**: Can view all tickets, assign them to agents, and update ticket statuses.
- **Ticket Tracking**: Create support tickets with:
  - **Category**: Hardware, Software, Network
  - **Priority**: Low, Medium, High
  - **Status**: Open, In Progress, Resolved
- **Filtering**: Live list filters for ticket status and priority.
- **Dashboard**: High-fidelity charts showing Ticket Distribution by Status (Pie Chart) and Ticket Counts by Category (Bar Chart) built with `recharts`.
- **Zero-Setup Seeding**: The system automatically initializes the SQLite database and populates it with 2 demo users and 17 realistic sample tickets on its first run.

---

## Tech Stack
- **Frontend**: React (Vite), Tailwind CSS v3, Recharts, Axios, Lucide Icons
- **Backend**: Node.js, Express, Native `node:sqlite` (SQLite), JWT, bcryptjs

---

## Prerequisites
- **Node.js**: **v22.5.0 or higher** is required (to support the native `node:sqlite` module without external C++ compilation binaries).

---

## Setup & Running Instructions

### 1. Run the Backend Server
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```
   *(For development with auto-reload, you can run `npm run dev`)*
   
   The server will start on **`http://localhost:5000`**. On first boot, it will automatically create `helpdesk.db` and seed the database.

---

### 2. Run the Frontend App
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   
   Vite will host the frontend locally, usually on **`http://localhost:5173`**.

---

## Live Demo Login Credentials
Use the following accounts to test the role-based flows:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Employee** | `employee@helpdesk.com` | `employee123` | Submit tickets, view own tickets, view own stats |
| **IT Agent** | `agent@helpdesk.com` | `agent123` | View all tickets, update status, assign agents, view global stats |

---

## Configuration (`.env`)
Backend configurations are loaded via environment variables. An `.env.example` file is included in the `/backend` folder. To customize ports or keys, create a `.env` file in the `/backend` folder:
```env
PORT=5000
JWT_SECRET=helpdesk_secret_key_123_change_me
DB_PATH=helpdesk.db
```
