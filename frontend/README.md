# GDG Management Platform - Modular Monolith Frontend (Next.js)

Production-ready, highly cohesive **Modular Monolith (Feature-Sliced)** frontend architecture built with **Next.js (App Router), TypeScript, and a Vanilla CSS Design System**.

---

## 🏛️ Architecture Breakdown

```
frontend/
├── src/
│   ├── app/                           # Next.js App Router (Composition & Routing)
│   │   ├── layout.tsx                 # Root layout with GDG theme and Google Fonts
│   │   ├── globals.css                # Global CSS design tokens (Google colors, dark glassmorphism)
│   │   ├── page.tsx                   # Chapter Overview & Analytics Hub
│   │   ├── events/page.tsx            # Events & Workshops directory
│   │   ├── team/page.tsx              # GDG Core Team & Organizers
│   │   └── rsvp/page.tsx              # Live Ticket Verification & RSVP Registry
│   │
│   ├── modules/                       # Domain-Driven Vertical Slices (Feature Modules)
│   │   ├── events/                    # Events Module
│   │   │   ├── components/            # EventCard, CreateEventModal
│   │   │   ├── events.service.ts      # API communication & mock fallback
│   │   │   ├── events.types.ts        # TypeScript contracts
│   │   │   └── index.ts               # Public Module API
│   │   │
│   │   ├── team/                      # Team & Organizers Module
│   │   │   ├── components/            # MemberCard, AddMemberModal
│   │   │   ├── team.service.ts        # API communication
│   │   │   ├── team.types.ts          # Member types & domain enums
│   │   │   └── index.ts               # Public Module API
│   │   │
│   │   └── rsvp/                      # RSVP & Check-in Module
│   │       ├── components/            # CheckInDialog (Ticket QR/code verification)
│   │       ├── rsvp.service.ts        # Ticket check-in logic
│   │       ├── rsvp.types.ts          # Ticket & RSVP interfaces
│   │       └── index.ts               # Public Module API
│   │
│   ├── shared/                        # Reusable Primitives & Cross-cutting infrastructure
│   │   ├── components/ui/             # Button, Card, Badge, Input, Modal
│   │   ├── layout/                    # Sidebar, Navbar, DashboardShell
│   │   ├── lib/                       # Typed ApiClient with base URL configuration
│   │   └── types/                     # Shared API response wrapper contracts
│   │
│   └── config/
│       └── env.ts                     # Environment configuration (API URL)
│
├── package.json
└── tsconfig.json
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build
```bash
npm run build
npm start
```
