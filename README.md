# Galli-7Kids

A card-based counseling tool for therapists, based on the German Galli Theater's "7 Dark Room Children" personality archetypes.

Users select 1–10 cards from a 49-card deck (7 characters x 7 cards), flip them to reveal hidden character associations, then drag cards to matching character slots for interpretation.

**Live Demo:** [https://cfvbaibai.github.io/galli-7kids/](https://cfvbaibai.github.io/galli-7kids/)

## Tech Stack

- **Vue 3** + TypeScript + Vite
- **Tailwind CSS** (mobile-first)
- **Pinia** (state management)
- **VueUse** + **Lodash-ES** (utilities)

## Project Setup

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

### Build

```bash
pnpm build
```

## Architecture

```
src/
├── composables/     # Pure state logic (useCardRing, useCardDrag)
├── stores/          # Pinia stores (cardGame)
├── components/      # UI components
├── themes/          # Theme definitions
├── pages/           # Page-level views
├── types/           # TypeScript definitions
└── data/            # Static card data (49 cards)
```
