import {
  validateTitle,
  validateDescription,
  validateTaskForm,
  TITLE_MAX_LENGTH,
  DESCRIPTION_MAX_LENGTH,
} from './taskValidation';

describe('taskValidation', () => {
  describe('validateTitle', () => {
    it('returns error when title is empty', () => {
      expect(validateTitle('').valid).toBe(false);
      expect(validateTitle('   ').valid).toBe(false);
      expect(validateTitle('').error).toBe('Title is required');
    });

    it('accepts non-empty trimmed title', () => {
      expect(validateTitle('Hello').valid).toBe(true);
      expect(validateTitle('  Hello  ').valid).toBe(true);
    });

    it('returns error when title exceeds max length', () => {
      const long = 'a'.repeat(TITLE_MAX_LENGTH + 1);
      const result = validateTitle(long);
      expect(result.valid).toBe(false);
      expect(result.error).toContain(String(TITLE_MAX_LENGTH));
    });

    it('accepts title at exactly max length', () => {
      expect(validateTitle('a'.repeat(TITLE_MAX_LENGTH)).valid).toBe(true);
    });
  });

  describe('validateDescription', () => {
    it('returns error when description is empty', () => {
      expect(validateDescription('').valid).toBe(false);
      expect(validateDescription('   ').valid).toBe(false);
      expect(validateDescription('').error).toBe('Description is required');
    });

    it('accepts non-empty trimmed description', () => {
      expect(validateDescription('Some text').valid).toBe(true);
    });

    it('returns error when description exceeds max length', () => {
      const long = 'a'.repeat(DESCRIPTION_MAX_LENGTH + 1);
      const result = validateDescription(long);
      expect(result.valid).toBe(false);
      expect(result.error).toContain(String(DESCRIPTION_MAX_LENGTH));
    });
  });

  describe('validateTaskForm', () => {
    it('returns null when both title and description are valid', () => {
      expect(validateTaskForm('Title', 'Description')).toBeNull();
    });

    it('returns title error when title invalid', () => {
      expect(validateTaskForm('', 'Desc')).toBe('Title is required');
      expect(validateTaskForm('  ', 'Desc')).toBe('Title is required');
    });

    it('returns description error when description invalid', () => {
      expect(validateTaskForm('Title', '')).toBe('Description is required');
    });
  });
});
