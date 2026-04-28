/**
 * Checks if a string represents a dynamic variable placeholder (e.g., {{variable_name}}).
 */
export function isDynamicVariable(val: unknown): boolean {
    if (typeof val !== "string" || !val.trim()) return false;
    const str = val.trim();
    return str.includes("{{") && str.includes("}}");
}

/**
 * Validates if a value is a valid absolute URL or a dynamic variable.
 */
export function isValidUrlOrVariable(val: unknown): boolean {
    if (isDynamicVariable(val)) return true;
    if (typeof val !== "string") return false;
    try {
        new URL(val.trim());
        return true;
    } catch {
        return false;
    }
}
