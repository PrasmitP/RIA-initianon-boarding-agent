/**
 * Helpers for money inputs.
 *
 * The form stores money as a *raw digit string* (e.g. "1000") — that's what the
 * review screen and the document prompts later run through `parseInt`. We only
 * add thousands separators for display, so the user sees "1,000" while typing
 * but the stored value stays parseable.
 */

/** Strip everything but digits, for the value we store in state. "$1,000" → "1000".
 *  Tolerates undefined/null (fields start unset), so callers never have to guard. */
export const toRawDigits = (value: string | undefined | null) =>
  String(value ?? '').replace(/\D/g, '');

/** Format a raw digit string with thousands separators for display. "1000" → "1,000". */
export const formatThousands = (value: string | undefined | null) => {
  const digits = toRawDigits(value);
  return digits ? Number(digits).toLocaleString('en-US') : '';
};
