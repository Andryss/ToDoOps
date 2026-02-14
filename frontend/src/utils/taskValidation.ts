/**
 * Task field constraints matching backend API (api.yaml).
 */
export const TITLE_MAX_LENGTH = 200;
export const DESCRIPTION_MAX_LENGTH = 4000;

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateTitle(value: string): ValidationResult {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: 'Title is required' };
  }
  if (trimmed.length > TITLE_MAX_LENGTH) {
    return { valid: false, error: `Title must be at most ${TITLE_MAX_LENGTH} characters` };
  }
  return { valid: true };
}

export function validateDescription(value: string): ValidationResult {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: 'Description is required' };
  }
  if (trimmed.length > DESCRIPTION_MAX_LENGTH) {
    return { valid: false, error: `Description must be at most ${DESCRIPTION_MAX_LENGTH} characters` };
  }
  return { valid: true };
}

export function validateTaskForm(title: string, description: string): string | null {
  const titleResult = validateTitle(title);
  if (!titleResult.valid) return titleResult.error ?? null;
  const descResult = validateDescription(description);
  if (!descResult.valid) return descResult.error ?? null;
  return null;
}
