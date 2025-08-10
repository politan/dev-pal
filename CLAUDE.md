# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DevPal is an AI-powered web application designed as a comprehensive developer utility suite. The application combines essential developer tools with specialized AI-powered features to streamline daily workflows using modern web technologies.

## Tech Stack

- **Frontend Framework**: Astro with Vue 3 islands architecture
- **Styling**: Tailwind CSS 4 + shadcn/ui design system
- **Build Tool**: Vite (integrated with Astro)
- **Language**: TypeScript
- **Icons**: Lucide Vue Next
- **Utilities**: VueUse for Vue composition utilities

## Project Structure

```
src/
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── tools/           # Tool-specific Vue components
│   ├── ToolCard.vue     # Reusable tool card component
│   └── ToolGrid.vue     # Main landing page grid
├── layouts/
│   └── BaseLayout.astro # Main layout template
├── pages/
│   ├── index.astro      # Landing page
│   └── tools/           # Individual tool pages (to be created)
├── stores/              # Vue state management (Pinia)
├── styles/
│   └── globals.css      # Global styles and CSS variables
└── utils/               # Utility functions
```

## Development Commands

| Command | Action |
|---------|--------|
| `npm run dev` | Start development server at `localhost:4321` |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Run TypeScript type checking |

## Architecture

### Layout System
- **AppLayout.astro**: Main application layout with sidebar navigation
- **BaseLayout.astro**: Base HTML structure and global styles
- **Sidebar.vue**: Left navigation panel with categorized tool links
- Uses Astro's islands architecture for optimal performance
- Vue components are hydrated only when needed using `client:load` directive

### Navigation Structure
The application uses a sidebar-based navigation where users:
1. Select tools from the left sidebar organized by categories
2. Main content area displays the selected tool
3. Welcome screen shown when no tool is selected

### Tool Categories

1. **Core Developer Utilities** (🔧)
   - Currency/timezone converters, UUID generators, hash tools, encoding utilities

2. **Code & Text Tools** (📝) 
   - JSON formatter, regex tester, text diff, lorem ipsum generator

3. **Specialized AI Toolkit** (🤖)
   - Prompt sandbox, tokenizer, synthetic data generator, semantic similarity

4. **API & Integration Tools** (🔌)
   - HTTP client, webhook tester

### Component Structure
- `Sidebar.vue`: Main navigation with tool categories and links
- `WelcomeContent.vue`: Landing content when no tool is selected
- `ToolPage.vue`: Reusable wrapper for individual tool pages
- Each tool has its own route in `src/pages/tools/` using the AppLayout
- Vue components use Composition API with `<script setup>`

### Routing
- `/` - Welcome page with sidebar navigation
- `/tools/{tool-name}` - Individual tool pages
- Active tool is highlighted in sidebar via `currentTool` prop

## Styling Guidelines

- Uses Tailwind CSS 4 with custom CSS variables for theming
- Dark mode enabled by default (class="dark" on html element)
- shadcn/ui color system with HSL color variables
- Responsive design with mobile-first approach

## Implementation Notes

- **Security**: Handle API keys and tokens securely for AI integrations
- **Performance**: Real-time feedback for tools like regex testing, JSON formatting
- **Extensibility**: Modular architecture allows easy addition of new tools
- **Type Safety**: Full TypeScript support across Astro and Vue components