/**
 * Errors Unit Tests
 * 错误类单元测试
 */

import { describe, test, expect } from 'bun:test';
import {
  AppError,
  ApiInitializationError,
  ApiCallError,
  ValidationError,
  ParseError,
  TimeoutError,
  ConfigurationError,
  getErrorMessage,
  getErrorCode,
  isRetryableError,
  wrapError
} from '../shared/errors';

describe('AppError', () => {
  test('creates error with default values', () => {
    const error = new AppError('Test error');
    expect(error.message).toBe('Test error');
    expect(error.code).toBe('APP_ERROR');
    expect(error.statusCode).toBe(500);
    expect(error.retryable).toBe(false);
  });

  test('creates error with custom options', () => {
    const error = new AppError('Custom error', {
      code: 'CUSTOM_CODE',
      statusCode: 400,
      retryable: true
    });
    expect(error.code).toBe('CUSTOM_CODE');
    expect(error.statusCode).toBe(400);
    expect(error.retryable).toBe(true);
  });

  test('preserves cause', () => {
    const cause = new Error('Original error');
    const error = new AppError('Wrapped error', { cause });
    expect(error.cause).toBe(cause);
  });
});

describe('ApiInitializationError', () => {
  test('has correct defaults', () => {
    const error = new ApiInitializationError('Init failed');
    expect(error.code).toBe('API_INIT_ERROR');
    expect(error.statusCode).toBe(503);
    expect(error.retryable).toBe(true);
  });
});

describe('ApiCallError', () => {
  test('has correct defaults', () => {
    const error = new ApiCallError('API call failed');
    expect(error.code).toBe('API_CALL_ERROR');
    expect(error.retryable).toBe(true);
  });

  test('stores endpoint and response status', () => {
    const error = new ApiCallError('API error', {
      endpoint: 'https://api.example.com',
      responseStatus: 429
    });
    expect(error.endpoint).toBe('https://api.example.com');
    expect(error.responseStatus).toBe(429);
  });
});

describe('ValidationError', () => {
  test('has correct defaults', () => {
    const error = new ValidationError('Invalid input');
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.statusCode).toBe(400);
    expect(error.retryable).toBe(false);
  });

  test('stores field and value', () => {
    const error = new ValidationError('Invalid limit', {
      field: 'limit',
      value: -1
    });
    expect(error.field).toBe('limit');
    expect(error.value).toBe(-1);
  });
});

describe('ParseError', () => {
  test('has correct defaults', () => {
    const error = new ParseError('Parse failed');
    expect(error.code).toBe('PARSE_ERROR');
    expect(error.statusCode).toBe(422);
    expect(error.retryable).toBe(false);
  });

  test('truncates long input', () => {
    const longInput = 'x'.repeat(500);
    const error = new ParseError('Parse failed', { input: longInput });
    expect(error.input?.length).toBeLessThanOrEqual(200);
  });
});

describe('TimeoutError', () => {
  test('has correct defaults', () => {
    const error = new TimeoutError('Timeout', { timeoutMs: 5000 });
    expect(error.code).toBe('TIMEOUT_ERROR');
    expect(error.statusCode).toBe(504);
    expect(error.retryable).toBe(true);
    expect(error.timeoutMs).toBe(5000);
  });

  test('stores operation name', () => {
    const error = new TimeoutError('Timeout', {
      timeoutMs: 5000,
      operation: 'fetchData'
    });
    expect(error.operation).toBe('fetchData');
  });
});

describe('ConfigurationError', () => {
  test('has correct defaults', () => {
    const error = new ConfigurationError('Config missing');
    expect(error.code).toBe('CONFIG_ERROR');
    expect(error.retryable).toBe(false);
  });

  test('stores config key', () => {
    const error = new ConfigurationError('Missing API key', 'API_KEY');
    expect(error.configKey).toBe('API_KEY');
  });
});

describe('getErrorMessage', () => {
  test('extracts message from Error', () => {
    const error = new Error('Test message');
    expect(getErrorMessage(error)).toBe('Test message');
  });

  test('returns string directly', () => {
    expect(getErrorMessage('String error')).toBe('String error');
  });

  test('extracts message from object', () => {
    expect(getErrorMessage({ message: 'Object error' })).toBe('Object error');
  });

  test('returns default for unknown', () => {
    expect(getErrorMessage(null)).toBe('Unknown error occurred');
    expect(getErrorMessage(undefined)).toBe('Unknown error occurred');
    expect(getErrorMessage(123)).toBe('Unknown error occurred');
  });
});

describe('getErrorCode', () => {
  test('extracts code from AppError', () => {
    const error = new ValidationError('Invalid');
    expect(getErrorCode(error)).toBe('VALIDATION_ERROR');
  });

  test('extracts code from object', () => {
    expect(getErrorCode({ code: 'CUSTOM_CODE' })).toBe('CUSTOM_CODE');
  });

  test('returns default for unknown', () => {
    expect(getErrorCode(new Error('test'))).toBe('UNKNOWN_ERROR');
    expect(getErrorCode(null)).toBe('UNKNOWN_ERROR');
  });
});

describe('isRetryableError', () => {
  test('returns true for retryable AppError', () => {
    const error = new ApiCallError('API error');
    expect(isRetryableError(error)).toBe(true);
  });

  test('returns false for non-retryable AppError', () => {
    const error = new ValidationError('Invalid');
    expect(isRetryableError(error)).toBe(false);
  });

  test('detects network errors', () => {
    expect(isRetryableError(new Error('ECONNRESET'))).toBe(true);
    expect(isRetryableError(new Error('ETIMEDOUT'))).toBe(true);
    expect(isRetryableError(new Error('rate limit exceeded'))).toBe(true);
    expect(isRetryableError(new Error('HTTP 429'))).toBe(true);
    expect(isRetryableError(new Error('HTTP 503'))).toBe(true);
  });

  test('returns false for regular errors', () => {
    expect(isRetryableError(new Error('Something went wrong'))).toBe(false);
  });
});

describe('wrapError', () => {
  test('returns AppError unchanged', () => {
    const error = new ValidationError('Invalid');
    expect(wrapError(error)).toBe(error);
  });

  test('wraps regular Error', () => {
    const error = new Error('Regular error');
    const wrapped = wrapError(error);
    expect(wrapped).toBeInstanceOf(AppError);
    expect(wrapped.message).toBe('Regular error');
    expect(wrapped.cause).toBe(error);
  });

  test('wraps string error', () => {
    const wrapped = wrapError('String error');
    expect(wrapped).toBeInstanceOf(AppError);
    expect(wrapped.message).toBe('String error');
  });

  test('uses default message for unknown', () => {
    const wrapped = wrapError(null, 'Default message');
    expect(wrapped.message).toBe('Unknown error occurred');
  });
});
