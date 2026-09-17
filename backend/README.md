# GDG Management Platform - Modular Monolith Backend

A production-ready **Modular Monolith** architecture built with **Node.js, Express, and TypeScript**.

## 🏗️ Architecture Overview

The modular monolith pattern balances the simplicity of a single deployable unit (monolith) with the clean boundaries and high cohesion of microservices.

```
backend/
├── src/
│   ├── app.ts                  # Express application setup & middleware registration
│   ├── server.ts               # Server bootstrap, DB initialization & graceful shutdown
│   │
│   ├── config/                 # Centralized configuration & environment variables
│   │   └── env.ts
│   │
│   ├── common/                 # Cross-cutting concerns & shared utilities
│   │   ├── errors/             # Standard AppError hierarchy (BadRequest, NotFound, etc.)
│   │   ├── middlewares/        # Global error & request logging middlewares
│   │   ├── utils/              # Standardized API response formatters & logger
│   │   └── types/              # Common global TypeScript interfaces
│   │
│   ├── database/               # Database connection abstraction (Prisma, Drizzle, etc.)
│   │   └── index.ts
│   │
│   ├── modules/                # Domain-driven vertical slices (isolated modules)
│   │   │
│   │   ├── auth/               # Authentication & Authorization
│   │   │   ├── auth.types.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.routes.ts
│   │   │   └── index.ts        # Module public interface
│   │   │
│   │   ├── users/              # Core Team & Members Management
│   │   │   ├── users.types.ts
│   │   │   ├── users.service.ts
│   │   │   ├── users.controller.ts
│   │   │   ├── users.routes.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── events/             # Workshops, Tech Talks & Hackathons
│   │   │   ├── events.types.ts
│   │   │   ├── events.service.ts
│   │   │   ├── events.controller.ts
│   │   │   ├── events.routes.ts
│   │   │   └── index.ts
│   │   │
│   │   └── rsvp/               # Event RSVP & Ticket Check-ins
│   │       ├── rsvp.types.ts
│   │       ├── rsvp.service.ts
│   │       ├── rsvp.controller.ts
│   │       ├── rsvp.routes.ts
│   │       └── index.ts
│   │
│   └── routes/                 # Aggregated API route mounter (/api/v1)
│       └── index.ts
│
├── .env.example                # Sample environment variables
├── .env                        # Local environment configuration
├── tsconfig.json               # TypeScript compiler configuration
└── package.json
```

---

## 🧩 Principles of Each Module

Each domain module under `src/modules/<module-name>` is self-contained:

1. **`*.types.ts`**: Domain entities, DTOs, and internal interfaces.
2. **`*.service.ts`**: Pure business logic (independent of HTTP/Express request objects).
3. **`*.controller.ts`**: HTTP transport layer, input validation, and mapping to HTTP responses.
4. **`*.routes.ts`**: Router definition attaching middlewares and controllers.
5. **`index.ts`**: The public API of the module. Only import between modules via their `index.ts`.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Development Mode (with Hot Reloading)
```bash
npm run dev
```

### 3. Build & Production Start
```bash
npm run build
npm start
```

---

## 📡 API Endpoints (v1)

| Module | Method | Endpoint | Description |
|---|---|---|---|
| **System** | `GET` | `/api/v1/health` | Health & uptime check |
| **Auth** | `POST` | `/api/v1/auth/register` | Register new member |
| **Auth** | `POST` | `/api/v1/auth/login` | Login |
| **Users** | `GET` | `/api/v1/users` | List GDG team & members |
| **Users** | `GET` | `/api/v1/users/:id` | Get user by ID |
| **Users** | `POST` | `/api/v1/users` | Create user |
| **Events** | `GET` | `/api/v1/events` | List upcoming GDG events |
| **Events** | `GET` | `/api/v1/events/:id` | Get event details |
| **Events** | `POST` | `/api/v1/events` | Create new event |
| **RSVP** | `POST` | `/api/v1/rsvp` | Register for an event |
| **RSVP** | `POST` | `/api/v1/rsvp/check-in`| Ticket check-in |
| **RSVP** | `GET` | `/api/v1/rsvp/event/:eventId` | Get event attendee RSVPs |
