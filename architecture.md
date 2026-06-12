# Project Architecture -  dev integrated

## Overview
This is a modern React application built with a focus on scalability, maintainability, and clean separation of concerns. It follows a **Feature-Based Modular Architecture** combined with **Clean Architecture** principles within each module.

## Tech Stack
- **Core Framework**: React 19
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 4
- **Routing**: TanStack Router
- **State Management**:
  - **Server State**: TanStack Query (React Query)
  - **Client State**: Zustand
- **Forms & Validation**: React Hook Form + Zod
- **UI Components**: Radix UI (base-ui) & Shadcn/UI
- **Icons**: Lucide React
- **HTTP Client**: Axios

## Directory Structure
```text
src/
├── app/              # Global app configuration
│   ├── layouts/      # Application-wide layouts
│   ├── providers/    # Global context providers (Query, Theme, etc.)
│   ├── routes/       # Root routes and shared layout components
│   └── router.tsx    # Routing configuration (TanStack Router)
├── components/       # Shared UI components
│   └── ui/           # Shadcn/UI components (atomic elements)
├── features/         # Business modules (Domain-driven)
│   └── [feature]/    # e.g., chatsession, bots, campaigns
│       ├── domain/       # Entities and Repository interfaces
│       ├── application/  # Use cases and domain services
│       ├── infra/        # External implementations (API clients)
│       └── presentation/ # Components, hooks, and pages specific to the feature
├── hooks/            # Global custom hooks
├── lib/              # Shared library code (utils, clients)
├── providers/        # Specific global providers
└── assets/           # Static assets (images, fonts)
```

## Architectural Patterns

### 1. Feature-Based Modules
The application is organized by business features rather than technical layers at the top level. Each folder in `src/features` is a self-contained module that could (in theory) be moved to another project with minimal friction.

### 2. Clean Architecture within Features
Complex features (like `chatsession`) further divide their logic into:
- **Domain**: Pure business logic and interfaces. No dependencies on React or APIs.
- **Application**: Orchestrates domain logic and handles use cases.
- **Infra**: Handles data persistence and network requests (e.g., Axios repositories).
- **Presentation**: The React layer (UI, Hooks, Pages).

### 3. Type-Safe Routing
Using **TanStack Router** ensures that all links, search parameters, and route definitions are strictly typed, reducing runtime errors and improving developer experience.

### 4. Hybrid State Management
- **TanStack Query** handles all server-side data fetching, caching, and synchronization.
- **Zustand** is used for simple, predictable client-side state that doesn't belong in a URL or a server.

### 5. Unified Styling
**Tailwind CSS 4** is the primary styling engine, providing a utility-first approach that ensures consistency and performance. **Shadcn/UI** (based on Radix UI) provides accessible, unstyled components that are customized via Tailwind.

## Common Workflows

### Adding a New Feature
1. Create a folder in `src/features/[feature_name]`.
2. Define layers: `presentation`, and if needed, `domain`, `infra`, `application`.
3. Export the main entry point (usually a page) for use in `src/app/router.tsx`.

### Adding a UI Component
1. Add to `src/components/ui` using `npx shadcn@latest add [component]`.
2. Customize styling in the local file to match the design system.
