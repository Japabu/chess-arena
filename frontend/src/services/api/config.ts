// API Configuration
if (!import.meta.env.VITE_API_URL) {
  throw new Error(
    "VITE_API_URL environment variable is not set. Please configure it before running the application."
  );
}

export const API_URL = import.meta.env.VITE_API_URL as string;
