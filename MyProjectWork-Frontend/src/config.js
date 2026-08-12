/**
 * Central configuration for the frontend.
 *
 * All runtime values that vary between environments (dev, staging, prod)
 * come from Vite env vars exposed as `import.meta.env.VITE_*`. Every other
 * module imports from here — never reference `import.meta.env` directly
 * outside this file so the surface area for environment-specific code stays
 * tiny and easy to audit.
 *
 * See `.env` for the defaults that ship with this repo and `.env.example`
 * for the full list of supported variables.
 */

// Trim any accidental trailing slash so callers can safely write
// `${API_BASE_URL}/admin/...` without producing `//admin/...`.
const stripTrailingSlash = (s) => (s || '').replace(/\/+$/, '');

export const API_BASE_URL = stripTrailingSlash(
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8086'
);

export const PROFILE_PHOTO_PATH =
  import.meta.env.VITE_PROFILE_PHOTO_PATH || '/trainee/profile-photo';

/** Full URL prefix for trainee profile photos: `${API_BASE_URL}${PROFILE_PHOTO_PATH}` */
export const PHOTO_BASE_URL = `${API_BASE_URL}${PROFILE_PHOTO_PATH}`;

export const DEFAULT_PAGE_SIZE = Number(
  import.meta.env.VITE_DEFAULT_PAGE_SIZE || 10
);
