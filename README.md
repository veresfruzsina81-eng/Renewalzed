# Renewalzed — MealStudio Villa

Cinematic, lightweight studio website built with Vite and pre-rendered visual environments.

The experience begins outside a mysterious creative manor. Selecting ENTER triggers a cinematic camera transition through the central door into an interactive MealStudio great room. The experience uses optimized WebP environments and CSS transforms instead of continuous WebGL rendering.

## Local development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

The repository includes `netlify.toml`; importing it into Netlify is enough for deployment.

## Content editing

- Interface copy and links: `index.html`
- Entrance transition, room portals and sound: `src/main.js`
- Colors and layout: `src/styles.css`
- Generated environment assets: `public/assets/`
