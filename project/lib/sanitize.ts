// lib/sanitize.ts
// ─────────────────────────────────────────────────────────────────────────────
// Utility: strip undefined values (and deeply nested undefineds) before any
// Firestore write.  Firestore throws if you pass `undefined` as a field value.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Recursively removes all keys whose value is `undefined` from a plain object.
 * Arrays are returned as-is (Firestore handles array members separately).
 *
 * Usage:
 *   await setDoc(ref, sanitizeData({ name, phone, bio }))
 *   await updateDoc(ref, sanitizeData({ phone, bio }))
 *   await addDoc(col, sanitizeData({ ...data }))
 */
export function sanitizeData<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) continue
    if (value !== null && typeof value === "object" && !Array.isArray(value) && !(value instanceof Date)) {
      const nested = sanitizeData(value as Record<string, unknown>)
      // Only include the nested object if it has at least one key
      if (Object.keys(nested).length > 0) {
        result[key] = nested
      }
    } else {
      result[key] = value
    }
  }
  return result as Partial<T>
}
