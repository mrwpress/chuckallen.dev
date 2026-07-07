import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://chuckallen.dev',
  integrations: [
    sitemap({
      filter: (page) => !new URL(page).pathname.startsWith('/ppc/'),
    }),
  ],
  build: {
    inlineStylesheets: 'always',
  },
  vite: {
    build: {
      assetsInlineLimit: 100000,
    },
  },
});
