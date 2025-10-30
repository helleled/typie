import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  strict: true,
  verbose: true,

  schema: './src/db/schemas/*',
  out: './drizzle',

  dialect: 'sqlite',
  dbCredentials: {
    url: './data/typie.db',
  },

  breakpoints: false,
});
