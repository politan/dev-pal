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

### Astro Islands
- Uses Astro's islands architecture for optimal performance
- Vue components are hydrated only when needed using `client:load` directive
- Static content is server-rendered by default

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
- `ToolCard.vue`: Reusable card component for each tool
- `ToolGrid.vue`: Landing page with categorized tool sections  
- Each tool will have its own route in `src/pages/tools/`
- Vue components use Composition API with `<script setup>`

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