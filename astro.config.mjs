// @ts-check
import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';
import vue from '@astrojs/vue';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  integrations: [
    vue(),
    tailwind({
      applyBaseStyles: false,
    }),
  ],
  vite: {
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@/components': fileURLToPath(new URL('./src/components', import.meta.url)),
        '@/utils': fileURLToPath(new URL('./src/utils', import.meta.url)),
        '@/stores': fileURLToPath(new URL('./src/stores', import.meta.url)),
        '@/styles': fileURLToPath(new URL('./src/styles', import.meta.url)),
      },
    },
  },
});
