import { toQueryString } from './queryParams';

describe('toQueryString', () => {
  it('returns empty string when no params are provided', () => {
    expect(toQueryString({})).toBe('');
  });

  it('ignores null, undefined and empty string values', () => {
    expect(toQueryString({ a: null, b: undefined, c: '' })).toBe('');
  });

  it('serializes simple key-value pairs', () => {
    const result = toQueryString({ search: 'widget', page: 1 });
    expect(result).toBe('?search=widget&page=1');
  });

  it('serializes array values as repeated keys', () => {
    const result = toQueryString({ ids: [1, 2, 3] });
    expect(result).toBe('?ids=1&ids=2&ids=3');
  });

  it('skips null entries inside arrays', () => {
    const result = toQueryString({ ids: [1, null, 3] });
    expect(result).toBe('?ids=1&ids=3');
  });
});
