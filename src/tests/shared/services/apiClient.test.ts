import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  apiRequest, 
  setAuthTokenProvider, 
  addRequestInterceptor, 
  addResponseInterceptor, 
  addErrorInterceptor
} from '@/shared/services/apiClient';

vi.mock('@/shared/config/env', () => ({
  buildApiUrl: vi.fn((path) => `http://api.test${path}`),
}));

describe('apiClient', () => {
  const mockFetch = vi.fn();
  vi.stubGlobal('fetch', mockFetch);

  beforeEach(() => {
    vi.clearAllMocks();
    setAuthTokenProvider(null);
    // Note: No built-in way to clear interceptors in the current implementation,
    // so we must be careful or add a reset helper.
  });

  afterEach(() => {
    // Clear interceptors if possible or reset them
  });

  it('performs a basic GET request successfully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ data: 'success' }),
    });

    const result = await apiRequest('/test');

    expect(mockFetch).toHaveBeenCalledWith('http://api.test/test', expect.objectContaining({
      method: 'GET',
      headers: expect.objectContaining({
        Accept: 'application/json',
      }),
    }));
    expect(result).toEqual({ data: 'success' });
  });

  it('includes auth token from provider if available', async () => {
    setAuthTokenProvider(() => 'test-token');
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({}),
    });

    await apiRequest('/test');

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
        }),
      })
    );
  });

  it('skips auth when skipAuth option is true', async () => {
    setAuthTokenProvider(() => 'test-token');
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({}),
    });

    await apiRequest('/test', { skipAuth: true });

    const headers = mockFetch.mock.calls[0][1].headers;
    expect(headers.Authorization).toBeUndefined();
  });

  it('handles 204 No Content by returning undefined', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 204,
      headers: new Headers(),
    });

    const result = await apiRequest('/test');
    expect(result).toBeUndefined();
  });

  it('throws correct error on non-ok response with JSON error detail', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ detail: 'Invalid request', code: 'VALIDATION_ERROR' }),
      url: 'http://api.test/test'
    });

    try {
      await apiRequest('/test');
      expect.fail('Should have thrown');
    } catch (error: any) {
      expect(error.status).toBe(400);
      expect(error.message).toBe('Invalid request');
      expect(error.code).toBe('VALIDATION_ERROR');
    }
  });

  it('handles 503 Service Unavailable for auth endpoints', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 503,
      headers: new Headers(),
      url: 'http://api.test/auth/forgot-password',
      text: async () => 'Service Unavailable'
    });

    await expect(apiRequest('/auth/forgot-password')).rejects.toThrow(/Email service is temporarily unavailable/);
  });

  it('runs request interceptors', async () => {
    const interceptor = vi.fn((config) => ({
      ...config,
      headers: { ...config.headers, 'X-Test': 'intercepted' }
    }));
    addRequestInterceptor(interceptor);

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({}),
    });

    await apiRequest('/test');

    expect(interceptor).toHaveBeenCalled();
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          'X-Test': 'intercepted',
        }),
      })
    );
  });

  it('runs response interceptors', async () => {
    const interceptor = vi.fn((response) => response);
    addResponseInterceptor(interceptor);

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({}),
    });

    await apiRequest('/test');

    expect(interceptor).toHaveBeenCalled();
  });

  it('runs error interceptors', async () => {
    const interceptor = vi.fn((error) => error);
    addErrorInterceptor(interceptor);

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      headers: new Headers(),
      text: async () => 'Error',
      url: 'http://api.test/test'
    });

    await expect(apiRequest('/test')).rejects.toThrow();
    expect(interceptor).toHaveBeenCalled();
  });

  it('handles request timeouts', async () => {
    // Mock fetch to simulate an AbortError as thrown by fetchWithTimeout's AbortController
    mockFetch.mockRejectedValueOnce(new DOMException('The operation was aborted', 'AbortError'));

    try {
      await apiRequest('/test', { timeoutMs: 100 });
      expect.fail('Should have thrown due to timeout');
    } catch (error: any) {
      expect(error.message).toContain('Request timed out or was aborted');
    }
  });

  it('normalizes array error details from backend', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 422,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({
        detail: [
          { msg: 'Field required', loc: ['body', 'name'] },
          { msg: 'Must be positive', loc: ['body', 'quantity'] }
        ]
      }),
      url: 'http://api.test/test'
    });

    try {
      await apiRequest('/test');
      expect.fail('Should have thrown an error');
    } catch (error: any) {
      expect(error.message).toContain('Field required');
      expect(error.message).toContain('Must be positive');
    }
  });

  it('removes interceptors correctly', async () => {
    const interceptor = vi.fn((config) => config);
    const remove = addRequestInterceptor(interceptor);
    
    remove(); // Remove immediately
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({}),
    });

    await apiRequest('/test');
    expect(interceptor).not.toHaveBeenCalled();
  });

  it('handles non-object error payloads', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => 'Internal Server Error', // Not an object
      url: 'http://api.test/test'
    });

    await expect(apiRequest('/test')).rejects.toThrow('Request failed');
  });

  it('handles error payloads with message property instead of detail', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ message: 'Custom error message' }),
      url: 'http://api.test/test'
    });

    await expect(apiRequest('/test')).rejects.toThrow('Custom error message');
  });

  it('respects manual AbortSignal via options', async () => {
    const controller = new AbortController();
    
    // Mock fetch to reject with AbortError when called
    mockFetch.mockRejectedValueOnce(new DOMException('The operation was aborted', 'AbortError'));
    
    const promise = apiRequest('/test', { signal: controller.signal });
    
    controller.abort();
    
    await expect(promise).rejects.toThrow(/timed out or was aborted/);
  });
});
