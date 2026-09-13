---
name: copilot-instructions
description: Workspace instructions for Skyscraper-Comics, a Vue 3 + TypeScript e-commerce platform for comics and trading cards.
---

# Skyscraper-Comics Development Guide

## Project Overview

**Skyscraper-Comics** is an e-commerce website for comic books and trading card products. The project uses a **Vue 3 + TypeScript frontend** with a **backend to be determined**.

- **Repo**: mustafahussein04/Skyscraper-Comics
- **Frontend**: `frontend/` (Vue 3, TypeScript, Vite, Tailwind CSS)
- **Backend**: `backend/` (under development — see Backend section)
- **Design**: Figma designs available in `figma-design/`

## Frontend Architecture

### Tech Stack
- **Framework**: Vue 3 (Composition API)
- **Language**: TypeScript
- **Build**: Vite
- **Styling**: Tailwind CSS + PostCSS
- **Routing**: Vue Router 4
- **UI Components**: Custom Vue components + Lucide Vue icons
- **Charts**: ApexCharts
- **Other**: FullCalendar, Dropzone, Swiper (carousel), vue-kanban

### Project Structure

```
frontend/src/
├── components/          # Reusable Vue components
│   ├── charts/         # Chart wrapper components (BarChart, LineChart)
│   ├── common/         # Shared UI components (CommonGridShape, DropdownMenu, etc.)
│   ├── ecommerce/      # E-commerce specific components
│   ├── forms/          # Form-related components
│   ├── layout/         # Layout providers (ThemeProvider, SidebarProvider)
│   ├── profile/        # Profile-related components
│   ├── tables/         # Table components
│   └── ui/             # Generic UI elements
├── icons/              # SVG/Vue icon components
├── views/              # Page-level components (routed by router)
│   ├── HomePage.vue
│   ├── Ecommerce.vue
│   ├── Chart/          # Chart showcase pages
│   ├── Errors/         # Error pages
│   ├── Forms/          # Form demo pages
│   ├── Others/         # Other pages (Calendar, Profile)
│   ├── Pages/
│   ├── Tables/         # Table demo pages
│   └── UiElements/     # UI component showcase
├── composables/        # Reusable logic (useSidebar.ts, etc.)
├── router/            # Vue Router configuration
├── assets/            # Static assets (CSS, images)
├── App.vue            # Root component
└── main.ts            # Entry point
```

### Component Organization

**Component Naming:**
- PascalCase for Vue component files: `UserProfile.vue`, `DropdownMenu.vue`
- Prefix descriptive names based on function or location
- Icon components: `{Name}Icon.vue` (e.g., `HomeIcon.vue`, `UserCircleIcon.vue`)

**Component Structure:**
- Use `<script setup lang="ts">` (Composition API)
- Define props and emits with TypeScript types
- Place template, script, then style in template block

**Common Patterns:**
- Layout wrapper components (`ThemeProvider.vue`, `SidebarProvider.vue`) provide context
- Sidebar state managed via `useSidebar.ts` composable
- Theme toggle in `ThemeToggler.vue`
- Reusable grid shapes in `CommonGridShape.vue`

### Routing

Routes are configured in `router/index.ts` with:
- Lazy-loaded views via `() => import('../views/...')`
- Route metadata (title) for document title updates
- Scroll behavior reset on navigation

**Route Naming Convention:**
- Use kebab-case paths: `/form-elements`, `/basic-tables`
- Name routes in PascalCase: `FormElements`, `BasicTables`
- Add meta.title for page title

### Styling

- **Framework**: Tailwind CSS v4 with PostCSS plugin
- **Utilities**: Include @tailwindcss/forms and @tailwindcss/typography
- **Global Styles**: `src/assets/main.css`
- **Component Styles**: Scoped `<style scoped>` in `.vue` files
- **Dark Mode**: Managed via `ThemeProvider.vue` (check component for implementation)

## Development Workflow

### Setup & Installation
```bash
cd frontend
npm install
```

### Development Server
```bash
npm run dev
```
Starts Vite dev server (typically on `http://localhost:5173`)

### Building
```bash
npm run build
```
Runs type checking (`vue-tsc --build`) then builds with Vite

### Code Quality
```bash
npm run type-check    # TypeScript validation
npm run lint          # ESLint with auto-fix
npm run format        # Prettier formatting
```

### Common Commands
- **Dev + Watch**: `npm run dev` (includes hot reload)
- **Preview Build**: `npm run preview` (preview production build)
- **Type Check**: `npm run type-check` (run TypeScript compiler without emitting)

## TypeScript Conventions

- **Type Definitions**: Use `.d.ts` files for ambient declarations
  - `vue.shims.d.ts`: Vue SFC type support
  - `index.d.ts`: Project-level type definitions
- **No `any`**: Avoid untyped `any` — use generics or unknown
- **Props & Events**: Use TypeScript interfaces/types for component interfaces
- **Async**: Use async/await over promises where readability permits

## Vue 3 Specific Patterns

### Composition API
- Prefer `<script setup>` over `setup()` function
- Define reactive state with `ref()` or `reactive()`
- Use computed properties for derived state
- Leverage composables for shared logic

### Template Features
- Use `v-slot` for named slots
- Prefer `:class="{ isActive }"` for conditional classes over strings
- Use `@click.stop` or `@click.prevent` for event modifiers
- Remember Tailwind classes are dynamic via bindings

### Composables
- Place reusable logic in `composables/` folder
- Export composables as `useMyFeature()`
- Document parameters and return types

## Icon System

**Location**: `src/icons/` contains exported Vue icon components

**Usage**:
```typescript
import { HomeIcon, UserCircleIcon } from '@/icons'
```

**Exported in**: `src/icons/index.ts`

## Backend (Under Development)

- **Location**: `backend/` directory
- **Status**: Initialization phase (README.md empty)
- **TODO**: Determine tech stack (Node.js/Express, Python/FastAPI, etc.), API structure, database

**Coordinate with AI**: Consult on backend framework selection and API contract definition before implementation.

## File-Specific AI Guidance

### When modifying `components/`
- Ensure components are reusable and not over-specialized
- Check for naming collisions in the icon set
- Maintain consistent prop/emit interfaces across similar components

### When modifying `views/`
- Update router metadata (title) if creating new pages
- Consider which layout providers are needed
- Lazy-load hefty views with `() => import(...)`

### When modifying `router/index.ts`
- Always include meta.title for SEO/UX
- Use lazy loading for code splitting
- Test scroll behavior on route transitions

### When modifying styles
- Leverage Tailwind utilities before writing custom CSS
- Use `@apply` in component scopes if needed
- Avoid mixing Tailwind and custom CSS without clear separation

## Git Workflow

- **Main Branch**: `main` (default, production-ready)
- **Feature Branches**: Use descriptive names (`feat/comic-filter`, `fix/cart-total`)
- **Commit Messages**: Conventional commits recommended (`feat:`, `fix:`, `docs:`, etc.)

## Links & References

- [Vue 3 Docs](https://vuejs.org/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Docs](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vue Router](https://router.vuejs.org/)
- [Figma Design](figma-design/figma-link.md)

## Quick Debugging Tips

- **Type errors**: Run `npm run type-check` to get full TypeScript diagnostics
- **Missing imports**: Check `src/icons/index.ts` or component export paths
- **Styling issues**: Inspect with DevTools; verify Tailwind config includes all file paths
- **Component not rendering**: Check router metadata, lazy-load import syntax, and component registration

## Next Steps

1. **Backend Development**: Define tech stack and API contract [suggest task]
2. **Figma → Code**: Review design system in Figma and document component variants [suggest task]
3. **Testing**: Add unit tests for critical components (composables, complex logic) [suggest task]
4. **E2E Tests**: Consider Playwright or Cypress for user flow validation [suggest task]
5. **CI/CD**: Set up GitHub Actions for lint, type-check, build automation [suggest task]
