# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `pnpm dev` - Start development server with Turbopack on http://localhost:3000
- `pnpm build` - Build for production
- `pnpm start` - Start production server

## Architecture Overview

This is a modern Next.js 15 landing page using App Router with the following architecture:

### Tech Stack
- Next.js 15 with App Router
- React 19
- TypeScript
- Tailwind CSS v4 with CSS variables for theming
- Lucide React for icons
- shadcn/ui component library

### File Organization
- `/app` - Next.js App Router pages
  - `layout.tsx` - Root layout with font and dark mode setup
  - `page.tsx` - Main landing page
  - `globals.css` - Global styles and Tailwind configuration
- `/components` - React components
  - `/ui` - shadcn/ui components (button, card, etc.)
  - `terminal.tsx` - Interactive terminal animation component
- `/lib` - Utilities
  - `utils.ts` - Class name utility for Tailwind
- `/public` - Static assets (images, fonts, etc.)

### Key Features
- Responsive design with mobile-first approach
- Dark mode support via CSS variables
- Interactive terminal animation
- Modern gradient effects
- Optimized for performance with static generation

### Styling
- Tailwind CSS v4 with custom theme configuration
- CSS variables for consistent theming
- Manrope font from Google Fonts
- Responsive utilities and breakpoints