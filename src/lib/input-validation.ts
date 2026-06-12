/**
 * Input validation and sanitization utilities.
 *
 * These helpers strip characters that can be used for HTML/JS injection or
 * cross-site scripting from user-facing form fields.  They are intentionally
 * restrictive on the client side; the backend performs its own validation.
 */

export const INPUT_LIMITS = {
  /** Generic name / label (bot name, credential label, campaign name, etc.) */
  NAME: 100,
  /** Long-form message text sent to WhatsApp users */
  MESSAGE: 1000,
  /** Short button or option label */
  BUTTON_LABEL: 20,
  /** Optional description field */
  DESCRIPTION: 500,
  /** URL or base-URL fields */
  URL: 2048,
  /** Hostname / domain / subdomain fields */
  HOSTNAME: 253,
  /** Database or schema name */
  DATABASE_NAME: 63,
  /** TCP port (max 65535 → 5 digits) */
  PORT: 5,
  /** DB / service username */
  USERNAME: 64,
  /** Trigger keyword / comparison value */
  COMPARISON_VALUE: 200,
} as const;

/**
 * Removes characters used for HTML-tag injection (`< > \`` ) from a value.
 * Use for name / label / title fields that should still allow most printable
 * characters (spaces, punctuation, etc.) but must not carry HTML markup.
 */
export function sanitizeLabel(value: string): string {
  // Strip < > ` which are the minimum set needed for tag / template injection
  // Also strip " and ; which enable attribute injection and JS semi-colons in
  // inline event handlers (onclick="...", etc.)
  return value.replace(/[<>"`;]/g, "");
}

/**
 * Removes HTML/JS injection characters from free-form text message fields.
 * More permissive than sanitizeLabel — only the angle brackets and backtick
 * are stripped so that normal punctuation (' " ? ! & etc.) is preserved.
 * These messages are delivered over WhatsApp, not rendered as HTML, so the
 * risk surface is backend payload injection rather than DOM injection.
 */
export function sanitizeText(value: string): string {
  return value.replace(/[<>`]/g, "");
}

/**
 * Removes characters not valid in a URL from a URL field.
 * Strips: < > " ` { } | \ ^ and space.
 */
export function sanitizeUrl(value: string): string {
  return value.replace(/[<>"` {}|\\^]/g, "");
}

/**
 * Restricts a hostname / domain / subdomain to RFC-valid characters:
 * letters, digits, hyphens, and dots.
 */
export function sanitizeHostname(value: string): string {
  return value.replace(/[^a-zA-Z0-9.\-]/g, "");
}

/**
 * Restricts a field to letters, digits, underscores, and hyphens.
 * Use for DB names, slugs, identifiers, account SIDs, etc.
 */
export function sanitizeAlphanumericSlug(value: string): string {
  return value.replace(/[^a-zA-Z0-9_\-]/g, "");
}

/**
 * Strips all non-digit characters.  Use for numeric-only fields such as port
 * numbers and numeric IDs.
 */
export function sanitizeNumeric(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Sanitizes a TCP port field: digits only, capped at 5 characters, and the
 * resulting number must be in the valid port range 1–65535.
 */
export function sanitizePort(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, INPUT_LIMITS.PORT);
  if (!digits) return digits;
  const num = parseInt(digits, 10);
  if (num > 65535) return digits.slice(0, -1);
  return digits;
}

/**
 * Sanitizes a button / interactive-option label.
 * Same rules as sanitizeLabel but also enforces the short length cap.
 */
export function sanitizeButtonLabel(value: string): string {
  return sanitizeLabel(value).slice(0, INPUT_LIMITS.BUTTON_LABEL);
}
