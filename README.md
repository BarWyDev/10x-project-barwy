# 10x Astro Starter

[![CI/CD Pipeline](https://github.com/YOUR-USERNAME/YOUR-REPO-NAME/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR-USERNAME/YOUR-REPO-NAME/actions/workflows/ci.yml)

A modern, opinionated starter template for building fast, accessible, and AI-friendly web applications.

## Tech Stack

- [Astro](https://astro.build/) v5 - Modern web framework for building fast, content-focused websites
- [React](https://react.dev/) v19 - UI library for building interactive components
- [TypeScript](https://www.typescriptlang.org/) v5 - Type-safe JavaScript
- [Tailwind CSS](https://tailwindcss.com/) v4 - Utility-first CSS framework
- [Supabase](https://supabase.com/) - Backend as a Service (auth, database, storage)
- [OpenAI](https://openai.com/) - AI-powered flashcard generation
- [shadcn/ui](https://ui.shadcn.com/) - Beautifully designed components
- [Zod](https://zod.dev/) - TypeScript-first schema validation

## Prerequisites

- Node.js v22.14.0 (as specified in `.nvmrc`)
- npm (comes with Node.js)

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/przeprogramowani/10x-astro-starter.git
cd 10x-astro-starter
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

Create a `.env` file in the root directory with the following variables:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key-here

# OpenAI API Configuration
OPENAI_API_KEY=sk-your-openai-api-key-here
```

**Getting your credentials:**
- **Supabase**: Get your project URL and anon key from [Supabase Dashboard](https://app.supabase.com/project/_/settings/api)
- **OpenAI**: Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)

4. Set up the database:

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Start local Supabase (optional for local development)
supabase start

# Or link to your remote Supabase project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

5. Run the development server:

```bash
npm run dev
```

6. Build for production:

```bash
npm run build
```

## Available Scripts

### Development
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Code Quality
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

### Testing
- `npm run test` - Run unit tests in watch mode
- `npm run test:run` - Run unit tests once
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:e2e` - Run E2E tests with Playwright
- `npm run test:e2e:ui` - Run E2E tests in UI mode
- `npm run test:all` - Run all tests (unit + E2E)

## Project Structure

```md
.
├── src/
│   ├── layouts/    # Astro layouts
│   ├── pages/      # Astro pages
│   │   └── api/    # API endpoints
│   ├── components/ # UI components (Astro & React)
│   └── assets/     # Static assets
├── public/         # Public assets
├── test/
│   ├── unit/       # Unit tests (Vitest)
│   └── e2e/        # E2E tests (Playwright)
└── .github/
    └── workflows/  # CI/CD pipeline
```

## CI/CD Pipeline

This project includes a complete CI/CD setup using GitHub Actions that automatically:

- ✅ Lints code with ESLint
- ✅ Runs unit tests with Vitest
- ✅ Runs E2E tests with Playwright
- ✅ Builds production bundle
- ✅ Generates coverage and test reports

### Quick Start

1. **Set GitHub Secrets** (Settings > Secrets > Actions):
   - `SUPABASE_URL` - Your Supabase project URL
   - `SUPABASE_ANON_KEY` - Your Supabase anon key

2. **Trigger Manually**: Actions > CI/CD Pipeline > Run workflow

3. **Automatic**: Pipeline runs on every push to `master` or `main`

**Total execution time:** 5-8 minutes

### Documentation

- 📖 [Quick Start Guide](.github/CI-CD-QUICK-START.md) - Get started in 3 steps
- 📚 [Full Documentation](.github/workflows/README.md) - Technical details
- ✅ [Setup Checklist](.github/SETUP-CHECKLIST.md) - Verify your setup
- 🏗️ [Architecture](.github/ARCHITECTURE.md) - Diagrams and deep dive
- 📊 [Implementation Summary](.github/CI-CD-SUMMARY.md) - Complete overview

## AI Development Support

This project is configured with AI development tools to enhance the development experience, providing guidelines for:

- Project structure
- Coding practices
- Frontend development
- Styling with Tailwind
- Accessibility best practices
- Astro and React guidelines

### Cursor IDE

The project includes AI rules in `.cursor/rules/` directory that help Cursor IDE understand the project structure and provide better code suggestions.

### GitHub Copilot

AI instructions for GitHub Copilot are available in `.github/copilot-instructions.md`

### Windsurf

The `.windsurfrules` file contains AI configuration for Windsurf.

## Deployment

This application can be deployed to various platforms:

### Deploy to Mikrus (Polish VPS Provider)

Full deployment guide for Mikrus hosting:

- 📖 **[Quick Start (5 min)](MIKRUS-QUICK-START.md)** - Fast deployment guide
- 📚 **[Complete Guide](MIKRUS-DEPLOYMENT.md)** - Detailed deployment instructions
- 🔧 **Preparation Scripts**:
  - Windows: `.\prepare-deployment.ps1`
  - Linux/macOS: `./prepare-deployment.sh`

### Deploy to Other Platforms

The application uses **Astro with SSR** and can be deployed to:

- **Vercel** - Automatic deployment with GitHub integration
- **Netlify** - Full SSR support
- **AWS/GCP/Azure** - Using Docker or Node.js
- **Any VPS** - Following the Mikrus guide

**Requirements:**
- Node.js 22.x
- Environment variables (see `env.example.txt`)
- Supabase project (backend)

## Contributing

Please follow the AI guidelines and coding practices defined in the AI configuration files when contributing to this project.

## License

MIT
