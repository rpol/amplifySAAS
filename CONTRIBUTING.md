# Contributing to Studio Admin

Thanks for showing interest in improving **Studio Admin** (repo: `next-shadcn-admin-dashboard`).  
This guide will help you set up your environment and understand how to contribute.

---

## Overview

This project is built with **Next.js 16**, **NestJS (latest)**, **TypeScript**, **Tailwind CSS v4**, and **Shadcn UI**.  
The goal is to keep the codebase modular, scalable, and easy to extend.

---

## Project Layout

We use a **colocation-based file system**. Each feature keeps its own pages, components, and logic.

```
apps
├── api
│   └── src
│       ├── app.controller.ts  # NestJS REST controller
│       ├── app.module.ts      # Root NestJS module
│       ├── app.service.ts     # Service layer for simple responses
│       └── main.ts            # API bootstrap entrypoint
└── web
   ├── src
   │   ├── app             # Next.js routes (App Router)
   │   │   ├── (auth)      # Auth layouts & screens
   │   │   ├── (main)      # Main dashboard routes
   │   │   │   └── (dashboard)
   │   │   │       ├── crm
   │   │   │       ├── finance
   │   │   │       ├── default
   │   │   │       └── ...
   │   │   └── layout.tsx
   │   ├── components      # Shared UI components
   │   ├── hooks           # Reusable hooks
   │   ├── lib             # Config & utilities
   │   ├── styles          # Tailwind / theme setup
   │   └── types           # TypeScript definitions
   ├── public              # Static assets
   └── media               # Documentation assets
```

If you’d like a more detailed example of this setup, check out the [Next Colocation Template](https://github.com/arhamkhnz/next-colocation-template), where the full structure is explained with examples.

---

## Getting Started

### Fork and Clone the Repository

1. Fork the Repository

   Click [here](https://github.com/arhamkhnz/next-shadcn-admin-dashboard/fork) to fork the repository.

2. Clone the Repository
   ```bash
   git clone https://github.com/YOUR_USERNAME/next-shadcn-admin-dashboard.git
   ```
3. Navigate into the Project

   ```bash
   cd next-shadcn-admin-dashboard
   ```

4. **Install dependencies**

   ```bash
   pnpm install
   ```

5. **Run the dev server(s)**
   ```bash
   pnpm dev
   ```
   App will be available at [http://localhost:3000](http://localhost:3000).
   API will be available at [http://localhost:3001](http://localhost:3001).

---

## Contribution Flow

- Always create a new branch before working on changes:

  ```bash
  git checkout -b feature/my-update
  ```

- Use clear commit messages:

  ```bash
  git commit -m "feat: add finance dashboard screen"
  ```

- Open a Pull Request once ready.
- If your change adds a new UI screen or component, include a screenshot in your PR description.

---

## Where to Contribute

- **External Pages**: Landing pages or other non-dashboard routes → `apps/web/src/app/(external)/`
- **Auth Screens**: Login, register, and authentication layouts → `apps/web/src/app/(main)/auth/`
- **Dashboard Screens**: Feature dashboards like CRM, Finance, Analytics → `apps/web/src/app/(main)/dashboard/`
- **Components**: Reusable UI goes in `apps/web/src/components/`
- **Hooks**: Custom logic goes in `apps/web/src/hooks/`
- **Themes**: New presets under `apps/web/src/styles/presets/`
- **API Endpoints**: Backend routes, services, and modules → `apps/api/src/`

---

## Guidelines

- Prefer **TypeScript types** over `any`
- Husky pre-commit hooks are enabled - linting and formatting run automatically when you commit, and if there are errors the commit will be blocked until they are fixed.
- Follow **Shadcn UI** style & Tailwind v4 conventions
- Keep accessibility in mind (ARIA, keyboard nav)
- Use clear commit messages with conventional prefixes (`feat:`, `fix:`, `chore:`, etc.)
- Avoid unnecessary dependencies — prefer existing utilities where possible

---

## Submitting PRs

- Open a Pull Request once your changes are ready.
- Ensure your branch is up to date with `main` before submitting.
- Reference any related issue in your PR for context.

---

## Questions & Support

- Report bugs, suggestions, or issues via [GitHub Issues](https://github.com/arhamkhnz/next-shadcn-admin-dashboard/issues)

---

Your contributions keep this project growing. 🚀

**Happy Vibe Coding!**
