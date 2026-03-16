export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
export const API_PREFIX = import.meta.env.VITE_API_PREFIX || ''

export function buildApiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE_URL}${API_PREFIX}${normalizedPath}`
}
