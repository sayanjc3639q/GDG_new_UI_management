# GDG Management Platform

A modern, full-stack **Modular Monolith** management platform for **Google Developer Groups (GDG)** chapters.

---

## 🏛️ Project Architecture

```
GDG Management/
├── backend/                       # Node.js + Express 5 + TypeScript + MongoDB
│   ├── src/
│   │   ├── modules/               # Domain vertical slices (Events, Tasks, Meetings, Leaves, Users, RSVP)
│   │   ├── common/                # Error handling, logging, utils
│   │   ├── config/                # Environment configuration
│   │   └── database/              # MongoDB connection layer (Mongoose)
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/                      # Next.js (App Router) + TypeScript + Sharp UI
    ├── src/
    │   ├── app/                   # App Router pages (Dashboard, Calendar, Tasks, Meetings, Leave)
    │   ├── modules/               # Feature slices (Events, Tasks, Meetings, Leaves, Team, RSVP)
    │   ├── shared/                # UI Primitives, ThemeContext, Layout (Sidebar & BottomNav)
    │   └── config/                # API client configuration
    ├── package.json
    └── tsconfig.json
```

---

## 🚀 Getting Started

### 1. Backend Setup
```bash
cd backend
npm install
npm run dev
```
Backend API will be running on [http://localhost:5000](http://localhost:5000).

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend web application will be accessible at [http://localhost:3000](http://localhost:3000).

---

## 🎨 Key Features
- **Clean UI & Sharp Aesthetics**: Minimalist, architectural precision layout with zero curved edges.
- **Light & Dark Mode**: Seamless toggle with local storage persistence.
- **Operations Dashboard**: Real-time overview of tasks, meetings, leaves, and calendar schedules.
- **Operations Calendar**: Monthly schedule grid and session planner.
- **Task Management**: Priority-tagged task tracking with completion status toggles.
- **Leadership Meetings**: Instant sync planning with 1-click Google Meet launch.
- **Leave Application**: Committee absence requests with Lead approval/rejection workflows.
- **Mobile Responsive**: Adaptive layout featuring a fixed Bottom Navigation Bar on mobile screens.
