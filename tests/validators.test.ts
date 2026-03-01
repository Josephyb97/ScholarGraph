/**
 * Validators Unit Tests
 * 验证函数单元测试
 */

import { describe, test, expect } from 'bun:test';
import {
  validateNumberRange,
  validateSearchSource,
  validateSortBy,
  validateLearningDepth,
  validateAnalysisMode,
  validateReportType,
  validateNonEmptyString,
  validateUrl,
  validateSearchParams,
  validateLearnParams,
  validateAnalyzeParams,
  validateGraphParams,
  formatValidationErrors,
  mergeValidationResults,
  isValidSearchSource,
  isValidSortBy,
  isValidLearningDepth,
  isValidAnalysisMode
} from '../shared/validators';

describe('validateNumberRange', () => {
  test('accepts valid number in range', () => {
    const result = validateNumberRange(5, 1, 10, 'count');
    expect(result.valid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  test('accepts boundary values', () => {
    expect(validateNumberRange(1, 1, 10, 'count').valid).toBe(true);
    expect(validateNumberRange(10, 1, 10, 'count').valid).toBe(true);
  });

  test('rejects number below minimum', () => {
    const result = validateNumberRange(0, 1, 10, 'count');
    expect(result.valid).toBe(false);
    expect(result.errors[0].field).toBe('count');
  });

  test('rejects number above maximum', () => {
    const result = validateNumberRange(11, 1, 10, 'count');
    expect(result.valid).toBe(false);
  });

  test('rejects NaN', () => {
    const result = validateNumberRange(NaN, 1, 10, 'count');
    expect(result.valid).toBe(false);
  });
});

describe('validateSearchSource', () => {
  test('accepts valid sources', () => {
    expect(validateSearchSource('arxiv').valid).toBe(true);
    expect(validateSearchSource('semantic_scholar').valid).toBe(true);
    expect(validateSearchSource('web').valid).toBe(true);
  });

  test('rejects invalid source', () => {
    const result = validateSearchSource('invalid');
    expect(result.valid).toBe(false);
    expect(result.errors[0].field).toBe('source');
  });
});

describe('validateSortBy', () => {
  test('accepts valid sort options', () => {
    expect(validateSortBy('relevance').valid).toBe(true);
    expect(validateSortBy('date').valid).toBe(true);
    expect(validateSortBy('citations').valid).toBe(true);
  });

  test('rejects invalid sort option', () => {
    const result = validateSortBy('popularity');
    expect(result.valid).toBe(false);
  });
});

describe('validateLearningDepth', () => {
  test('accepts valid depths', () => {
    expect(validateLearningDepth('beginner').valid).toBe(true);
    expect(validateLearningDepth('intermediate').valid).toBe(true);
    expect(validateLearningDepth('advanced').valid).toBe(true);
  });

  test('rejects invalid depth', () => {
    const result = validateLearningDepth('expert');
    expect(result.valid).toBe(false);
  });
});

describe('validateAnalysisMode', () => {
  test('accepts valid modes', () => {
    expect(validateAnalysisMode('quick').valid).toBe(true);
    expect(validateAnalysisMode('standard').valid).toBe(true);
    expect(validateAnalysisMode('deep').valid).toBe(true);
  });

  test('rejects invalid mode', () => {
    const result = validateAnalysisMode('thorough');
    expect(result.valid).toBe(false);
  });
});

describe('validateReportType', () => {
  test('accepts valid types', () => {
    expect(validateReportType('daily').valid).toBe(true);
    expect(validateReportType('weekly').valid).toBe(true);
    expect(validateReportType('monthly').valid).toBe(true);
  });

  test('rejects invalid type', () => {
    const result = validateReportType('yearly');
    expect(result.valid).toBe(false);
  });
});

describe('validateNonEmptyString', () => {
  test('accepts non-empty string', () => {
    const result = validateNonEmptyString('hello', 'name');
    expect(result.valid).toBe(true);
  });

  test('rejects empty string', () => {
    const result = validateNonEmptyString('', 'name');
    expect(result.valid).toBe(false);
  });

  test('rejects whitespace-only string', () => {
    const result = validateNonEmptyString('   ', 'name');
    expect(result.valid).toBe(false);
  });
});

describe('validateUrl', () => {
  test('accepts valid URLs', () => {
    expect(validateUrl('https://example.com').valid).toBe(true);
    expect(validateUrl('http://localhost:3000').valid).toBe(true);
    expect(validateUrl('https://arxiv.org/abs/2301.00001').valid).toBe(true);
  });

  test('rejects invalid URLs', () => {
    expect(validateUrl('not-a-url').valid).toBe(false);
    expect(validateUrl('').valid).toBe(false);
  });
});

describe('validateSearchParams', () => {
  test('accepts valid search params', () => {
    const result = validateSearchParams({
      query: 'transformer',
      limit: 10,
      source: 'arxiv',
      sortBy: 'relevance'
    });
    expect(result.valid).toBe(true);
  });

  test('rejects missing query', () => {
    const result = validateSearchParams({ limit: 10 });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'query')).toBe(true);
  });

  test('rejects invalid limit', () => {
    const result = validateSearchParams({ query: 'test', limit: 200 });
    expect(result.valid).toBe(false);
  });

  test('rejects invalid source', () => {
    const result = validateSearchParams({ query: 'test', source: 'invalid' as any });
    expect(result.valid).toBe(false);
  });
});

describe('validateLearnParams', () => {
  test('accepts valid learn params', () => {
    const result = validateLearnParams({
      concept: 'BERT',
      depth: 'intermediate'
    });
    expect(result.valid).toBe(true);
  });

  test('rejects missing concept', () => {
    const result = validateLearnParams({ depth: 'beginner' });
    expect(result.valid).toBe(false);
  });
});

describe('validateAnalyzeParams', () => {
  test('accepts valid analyze params', () => {
    const result = validateAnalyzeParams({
      url: 'https://arxiv.org/abs/2301.00001',
      mode: 'deep'
    });
    expect(result.valid).toBe(true);
  });

  test('rejects missing URL', () => {
    const result = validateAnalyzeParams({ mode: 'quick' });
    expect(result.valid).toBe(false);
  });

  test('rejects invalid URL', () => {
    const result = validateAnalyzeParams({ url: 'not-a-url' });
    expect(result.valid).toBe(false);
  });
});

describe('validateGraphParams', () => {
  test('accepts valid graph params', () => {
    const result = validateGraphParams({
      concepts: ['BERT', 'GPT', 'Transformer']
    });
    expect(result.valid).toBe(true);
  });

  test('rejects less than 2 concepts', () => {
    const result = validateGraphParams({ concepts: ['BERT'] });
    expect(result.valid).toBe(false);
  });

  test('rejects empty concepts', () => {
    const result = validateGraphParams({ concepts: [] });
    expect(result.valid).toBe(false);
  });
});

describe('formatValidationErrors', () => {
  test('formats errors correctly', () => {
    const errors = [
      { field: 'query', message: 'Query is required' },
      { field: 'limit', message: 'Limit must be at least 1', value: 0 }
    ];
    const formatted = formatValidationErrors(errors);

    expect(formatted).toContain('query');
    expect(formatted).toContain('Query is required');
    expect(formatted).toContain('limit');
    expect(formatted).toContain('(got: 0)');
  });

  test('returns empty string for no errors', () => {
    expect(formatValidationErrors([])).toBe('');
  });
});

describe('mergeValidationResults', () => {
  test('merges multiple results', () => {
    const result1 = { valid: false, errors: [{ field: 'a', message: 'Error A' }] };
    const result2 = { valid: false, errors: [{ field: 'b', message: 'Error B' }] };
    const merged = mergeValidationResults(result1, result2);

    expect(merged.valid).toBe(false);
    expect(merged.errors.length).toBe(2);
  });

  test('returns valid when all results are valid', () => {
    const result1 = { valid: true, errors: [] };
    const result2 = { valid: true, errors: [] };
    const merged = mergeValidationResults(result1, result2);

    expect(merged.valid).toBe(true);
  });
});

describe('type guards', () => {
  test('isValidSearchSource', () => {
    expect(isValidSearchSource('arxiv')).toBe(true);
    expect(isValidSearchSource('invalid')).toBe(false);
    expect(isValidSearchSource(123)).toBe(false);
  });

  test('isValidSortBy', () => {
    expect(isValidSortBy('relevance')).toBe(true);
    expect(isValidSortBy('invalid')).toBe(false);
  });

  test('isValidLearningDepth', () => {
    expect(isValidLearningDepth('beginner')).toBe(true);
    expect(isValidLearningDepth('invalid')).toBe(false);
  });

  test('isValidAnalysisMode', () => {
    expect(isValidAnalysisMode('quick')).toBe(true);
    expect(isValidAnalysisMode('invalid')).toBe(false);
  });
});
