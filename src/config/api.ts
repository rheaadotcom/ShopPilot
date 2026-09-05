// src/config/api.ts
// Centralized API base URL configuration for client-side fetch calls.
// Uses Vite environment variable VITE_API_URL during build and runtime.

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

// Helper to build full endpoint URLs
export const endpoint = (path: string): string => {
  // Ensure leading slash
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
};
