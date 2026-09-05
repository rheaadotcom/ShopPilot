// src/vite-env.d.ts
// TypeScript declarations for Vite environment variables.
// Provides typings for import.meta.env used in the project.

interface ImportMetaEnv {
  // Vite environment variables used in the codebase.
  VITE_API_URL?: string;
  // Add additional VITE_ variables here as needed.
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
