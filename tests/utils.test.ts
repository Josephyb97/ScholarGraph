/**
 * Utils Unit Tests
 * 工具函数单元测试
 */

import { describe, test, expect } from 'bun:test';
import { parseArxivXml, extractJson, truncate, normalizeTitle } from '../shared/utils';

describe('parseArxivXml', () => {
  test('parses valid XML with single entry', () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
<entry>
<id>http://arxiv.org/abs/2301.00001</id>
<title>Test Paper Title</title>
<summary>This is the abstract of the test paper.</summary>
<published>2023-01-01T00:00:00Z</published>
<updated>2023-01-02T00:00:00Z</updated>
<author><name>John Doe</name></author>
<author><name>Jane Smith</name></author>
<category term="cs.AI"/>
<category term="cs.LG"/>
</entry>
</feed>`;

    const results = parseArxivXml(xml);
    expect(results.length).toBe(1);
    expect(results[0].title).toBe('Test Paper Title');
    expect(results[0].abstract).toBe('This is the abstract of the test paper.');
    expect(results[0].authors).toEqual(['John Doe', 'Jane Smith']);
    expect(results[0].categories).toEqual(['cs.AI', 'cs.LG']);
    expect(results[0].published).toBe('2023-01-01');
  });

  test('parses multiple entries', () => {
    const xml = `<feed>
<entry>
<id>http://arxiv.org/abs/2301.00001</id>
<title>Paper 1</title>
<summary>Abstract 1</summary>
<published>2023-01-01T00:00:00Z</published>
<author><name>Author 1</name></author>
</entry>
<entry>
<id>http://arxiv.org/abs/2301.00002</id>
<title>Paper 2</title>
<summary>Abstract 2</summary>
<published>2023-01-02T00:00:00Z</published>
<author><name>Author 2</name></author>
</entry>
</feed>`;

    const results = parseArxivXml(xml);
    expect(results.length).toBe(2);
    expect(results[0].title).toBe('Paper 1');
    expect(results[1].title).toBe('Paper 2');
  });

  test('handles empty XML', () => {
    const xml = `<feed></feed>`;
    const results = parseArxivXml(xml);
    expect(results.length).toBe(0);
  });

  test('handles malformed entries gracefully', () => {
    const xml = `<feed>
<entry>
<id>http://arxiv.org/abs/2301.00001</id>
<title>Valid Paper</title>
<summary>Valid Abstract</summary>
<published>2023-01-01T00:00:00Z</published>
</entry>
<entry>
</entry>
</feed>`;

    const results = parseArxivXml(xml);
    // Both entries are parsed, but the second one has empty values
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].title).toBe('Valid Paper');
  });
});

describe('extractJson', () => {
  test('extracts JSON object from plain text', () => {
    const text = 'Here is the result: {"name": "test", "value": 123}';
    const result = extractJson<{ name: string; value: number }>(text);

    expect(result.success).toBe(true);
    expect(result.data).toEqual({ name: 'test', value: 123 });
  });

  test('extracts JSON array from plain text', () => {
    const text = 'Results: [1, 2, 3, 4, 5]';
    const result = extractJson<number[]>(text);

    expect(result.success).toBe(true);
    expect(result.data).toEqual([1, 2, 3, 4, 5]);
  });

  test('extracts JSON from markdown code block', () => {
    const text = `Here is the JSON:
\`\`\`json
{"key": "value", "nested": {"a": 1}}
\`\`\`
End of response.`;

    const result = extractJson<{ key: string; nested: { a: number } }>(text);
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ key: 'value', nested: { a: 1 } });
  });

  test('handles nested JSON correctly', () => {
    const text = `{"outer": {"inner": {"deep": [1, 2, {"x": 3}]}}}`;
    const result = extractJson<{ outer: { inner: { deep: unknown[] } } }>(text);

    expect(result.success).toBe(true);
    expect(result.data?.outer.inner.deep).toEqual([1, 2, { x: 3 }]);
  });

  test('handles strings with braces inside', () => {
    const text = `{"message": "Use {placeholder} syntax", "count": 5}`;
    const result = extractJson<{ message: string; count: number }>(text);

    expect(result.success).toBe(true);
    expect(result.data?.message).toBe('Use {placeholder} syntax');
  });

  test('returns error for invalid JSON', () => {
    const text = 'No JSON here, just plain text.';
    const result = extractJson(text);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  test('returns error for unbalanced brackets', () => {
    const text = '{"key": "value"';
    const result = extractJson(text);

    expect(result.success).toBe(false);
  });
});

describe('truncate', () => {
  test('returns original string if shorter than max', () => {
    expect(truncate('hello', 10)).toBe('hello');
  });

  test('truncates long string with default suffix', () => {
    expect(truncate('hello world', 8)).toBe('hello...');
  });

  test('truncates with custom suffix', () => {
    expect(truncate('hello world', 9, '…')).toBe('hello wo…');
  });

  test('handles exact length', () => {
    expect(truncate('hello', 5)).toBe('hello');
  });
});

describe('normalizeTitle', () => {
  test('converts to lowercase', () => {
    expect(normalizeTitle('HELLO World')).toBe('helloworld');
  });

  test('removes special characters', () => {
    expect(normalizeTitle('Hello, World!')).toBe('helloworld');
  });

  test('preserves Chinese characters', () => {
    expect(normalizeTitle('测试Title')).toBe('测试title');
  });

  test('truncates to 50 characters', () => {
    const longTitle = 'a'.repeat(100);
    expect(normalizeTitle(longTitle).length).toBe(50);
  });
});
