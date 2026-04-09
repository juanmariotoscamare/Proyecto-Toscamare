/**
 * Configuración dinámica de la API dependiente del entorno.
 * VITE_API_URL debe definirse en los archivos .env (.env.local, .env.production, etc.)
 */

const IS_PROD = import.meta.env.PROD;
const RENDER_API_URL = "https://proyecto-toscamare.onrender.com";

export const API_URL = import.meta.env.VITE_API_URL || (IS_PROD ? RENDER_API_URL : "http://localhost:3001");

export const ENDPOINTS = {
  CONTACT: `${API_URL}/api/contact`,
  HEALTH: `${API_URL}/health`,
};
