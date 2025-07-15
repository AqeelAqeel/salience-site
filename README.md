# Salience Landing Page

A modern, responsive landing page built with Next.js 15 and Tailwind CSS.

## Features

- ⚡ Built with Next.js 15 and React 19
- 🎨 Styled with Tailwind CSS v4
- 📱 Fully responsive design
- 🌙 Dark mode support
- ✨ Interactive terminal animation
- 🚀 Optimized for performance
- 📝 TypeScript for type safety

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd salience-site
```

2. Install dependencies:
```bash
pnpm install
```

3. Run the development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the result.

## Project Structure

```
.
├── app/              # Next.js App Router
│   ├── layout.tsx    # Root layout
│   ├── page.tsx      # Landing page
│   └── globals.css   # Global styles
├── components/       # React components
│   ├── ui/          # UI components
│   └── terminal.tsx  # Terminal animation
├── lib/             # Utilities
│   └── utils.ts     # Helper functions
└── public/          # Static assets
```

## Development

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server

## Technologies Used

- [Next.js 15](https://nextjs.org/) - React framework
- [React 19](https://react.dev/) - UI library
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS v4](https://tailwindcss.com/) - Styling
- [Lucide React](https://lucide.dev/) - Icons
- [shadcn/ui](https://ui.shadcn.com/) - Component library

## License

This project is licensed under the MIT License - see the LICENSE file for details.