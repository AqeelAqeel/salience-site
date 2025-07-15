# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `pnpm dev` - Start development server with Turbopack on http://localhost:3000
- `pnpm build` - Build for production
- `pnpm start` - Start production server

### Database
- `pnpm db:setup` - Create .env file with database configuration
- `pnpm db:migrate` - Run database migrations
- `pnpm db:seed` - Seed database with test user (test@test.com / admin123)
- `pnpm db:generate` - Generate migration files from schema changes
- `pnpm db:studio` - Open Drizzle Studio for database management

### Stripe Testing
- `stripe listen --forward-to localhost:3000/api/stripe/webhook` - Listen for local webhook events

## Architecture Overview

This is a Next.js 15 SaaS starter template using App Router with the following architecture:

### Authentication & Authorization
- Custom JWT-based authentication stored in httpOnly cookies
- Session management via `lib/auth/session.ts`
- Global middleware in `middleware.ts` protects `/dashboard/*` routes
- RBAC with Owner/Member roles for team management
- Protected Server Actions using `validatedAction` and `validatedActionWithUser` wrappers

### Database Layer
- PostgreSQL with Drizzle ORM
- Schema definitions in `lib/db/schema.ts`
- Database queries organized in `lib/db/queries.ts`
- Tables: users, teams, team_members, invitations, activity_logs
- Migrations stored in `lib/db/migrations/`

### Payment Integration
- Stripe integration for subscriptions and one-time payments
- Webhook handler at `app/api/stripe/webhook/route.ts`
- Customer portal integration for subscription management
- Payment logic in `lib/payments/stripe.ts`

### Server Actions Pattern
The codebase uses a consistent pattern for Server Actions:
1. Define actions in `lib/db/queries.ts` with proper validation
2. Use `validatedAction` or `validatedActionWithUser` middleware for authorization
3. Return typed responses with `{ error?: string }` pattern
4. Client components use SWR for data fetching with `fetcher` utility

### UI Components
- Uses shadcn/ui component library with Radix UI primitives
- Components in `components/ui/` are generated/maintained by shadcn CLI
- Custom business components should go in `components/` root
- Styling with TailwindCSS v4 using CSS variables for theming

### Key Architectural Decisions
1. **No external auth libraries** - Custom implementation for full control
2. **Server-first approach** - Leverages React Server Components and Server Actions
3. **Type-safe database queries** - Drizzle provides full TypeScript support
4. **Minimal client state** - SWR for server state synchronization
5. **Activity logging** - Built-in audit trail for all user actions

### File Organization
- `/app` - Next.js App Router pages and API routes
- `/components` - React components (UI primitives and business components)
- `/lib` - Core business logic, utilities, and configurations
  - `/auth` - Authentication and session management
  - `/db` - Database schema, queries, and migrations
  - `/payments` - Stripe integration
- Public routes: `/`, `/pricing`, `/sign-in`, `/sign-up`
- Protected routes: `/dashboard/*` (requires authentication)




Design Principles to Follow
Law	Apply by…
Aesthetic Usability	Use spacing/typography to make forms feel easier
Hick’s Law	Avoid clutter; collapse complex settings
Jakob’s Law	Stick to familiar WP Admin patterns (cards, sidebars, modals)
Fitts’s Law	Place important buttons close, large, clear
Law of Proximity	Group logic and inputs with spacing + PanelBody + layout components
Zeigarnik Effect	Use progress indicators, save states
Goal-Gradient	Emphasize progress in wizards (e.g. New Rule flow)
Law of Similarity	Ensure toggles, selectors, filters share styling and layout conventions
Aesthetic-Usability Effect
Clean, consistent spacing (e.g. gap-2, px-4)

Typography hierarchy (e.g. headings text-lg font-semibold)

Visual cues like subtle shadows or border separators improve perceived usability

Hick's Law
Reduce visible options per screen

Collapse complex filters/conditions into toggles or expandable sections

Jakob’s Law
Match WordPress admin conventions (e.g. table lists, modals, top bar)

Stick to familiar placement of "Add New", status toggles, and trash icons

Fitts’s Law
Important actions (edit, delete) should be large, clickable buttons

Avoid tiny icon-only targets unless they are grouped and spaced (space-x-2)

Law of Proximity
Group related controls using spacing + containers (e.g. PanelBody, Card)

Inputs related to conditions or filters should be visually bundled

Zeigarnik Effect
Show progress in multi-step rule creation (stepper, breadcrumb, or "Step X of Y")

Save state feedback (e.g. "Saving..." or "Unsaved changes" banners)

Goal-Gradient Effect
Emphasize next step in workflows (highlight active step, primary button styling)

Use progress bars or steppers to encourage completion

Law of Similarity
Use consistent styles for toggle switches, buttons, badges, filters

Align icon sizing and spacing across all rows for visual rhythm

Miller's Law
Don’t overload the user with options; chunk rule configuration into steps/panels

Default to collapsed sections (e.g. advanced options)

Doherty Threshold
Aim for sub-400ms interactions (e.g. loading skeletons, optimistic UI)

Use loading states with spinners or shimmer placeholders