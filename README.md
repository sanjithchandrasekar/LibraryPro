# Library Management System (Pro)

A modern, full-stack Library Management System built with **React (Vite)** and **Supabase**.

## 🚀 Key Features
- **Dashboard**: Real-time stats (Total, Issued, Overdue books).
- **Authentication**: Staff login via Supabase Auth.
- **Book Management**: Full CRUD, categories, stock tracking.
- **User Management**: Students/Faculty directory with borrowing history.
- **Circulation Engine**: Automated issue/return with late fine calculation (₹10/day).
- **Visual Analytics**: Interactive charts using Recharts.
- **Dark Mode**: Sleek glassmorphic UI with theme persistence.
- **Export**: Generate CSV reports of all transactions.

## 🛠 Tech Stack
- **Frontend**: React, Tailwind CSS, Lucide Icons.
- **Backend/DB**: Supabase (PostgreSQL + Auth + Realtime).
- **Charts**: Recharts.
- **State/Logic**: Context API, React Hook Form, TanStack React Query (optional, using hooks/services here).

## 📦 Setup Instructions

### 1. Supabase Setup
- Create a new project on [Supabase](https://supabase.com/).
- Go to **SQL Editor** and paste the content from `schema.sql`.
- In **Authentication > Providers**, ensure Email/Password is enabled.
- Add a demo user in **Authentication > Users** (e.g., `admin@library.com`).

### 2. Frontend Configuration
- Clone this repository.
- Rename `.env.example` to `.env`.
- Fill in your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

### 3. Run Locally
```bash
cd frontend
npm install
npm run dev
```

## 📂 Project Structure
```
frontend/
├── src/
│   ├── components/  # Reusable UI (Layout, Modals, Loader)
│   ├── pages/       # Dashboard, Books, Users, etc.
│   ├── services/    # Supabase CRUD logic
│   ├── context/     # Auth & Theme state
│   ├── hooks/       # Custom data hooks
│   └── App.jsx      # Router & Layout config
```
