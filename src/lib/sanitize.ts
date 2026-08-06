import DOMPurify from 'isomorphic-dompurify'

// All user content is rendered via React escaping (no dangerouslySetInnerHTML).
// This helper is for the rare case we must inject HTML (none currently).
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })
}

export function sanitizeText(input: string): string {
  return sanitizeHtml(input)
}
