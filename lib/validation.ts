export function isAbsoluteUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function isValidReviewScore(value: number) {
  return value >= 0 && value <= 10;
}

export function isNonNegative(value: number) {
  return value >= 0;
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
