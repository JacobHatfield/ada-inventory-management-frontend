import { buildApiUrl } from '../config/env';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

const DEFAULT_TIMEOUT_MS = 15000;

export class ApiError extends Error {
  status: number | null;
  code?: string;
  details?: unknown;
  raw?: unknown;

  constructor(
    message: string,
    status: number | null,
    options?: { code?: string; details?: unknown; raw?: unknown },
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = options?.code;
    this.details = options?.details;
    this.raw = options?.raw;
  }
}

type RequestOptions = {
  method?: HttpMethod;
  token?: string;
  body?: unknown;
  headers?: Record<string, string>;
  timeoutMs?: number;
  signal?: AbortSignal;
  skipAuth?: boolean;
};

type RequestConfig = {
  url: string;
  method: HttpMethod;
  headers: Record<string, string>;
  body?: BodyInit;
  timeoutMs: number;
  signal?: AbortSignal;
};

type RequestInterceptor = (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;
type ResponseInterceptor = (response: Response) => Response | Promise<Response>;
type ErrorInterceptor = (error: ApiError) => ApiError | Promise<ApiError>;

const requestInterceptors: RequestInterceptor[] = [];
const responseInterceptors: ResponseInterceptor[] = [];
const errorInterceptors: ErrorInterceptor[] = [];

let authTokenProvider: (() => string | null | undefined) | null = null;

export function setAuthTokenProvider(provider: (() => string | null | undefined) | null): void {
  authTokenProvider = provider;
}

export function addRequestInterceptor(interceptor: RequestInterceptor): () => void {
  requestInterceptors.push(interceptor);
  return () => {
    const index = requestInterceptors.indexOf(interceptor);
    if (index >= 0) {
      requestInterceptors.splice(index, 1);
    }
  };
}

export function addResponseInterceptor(interceptor: ResponseInterceptor): () => void {
  responseInterceptors.push(interceptor);
  return () => {
    const index = responseInterceptors.indexOf(interceptor);
    if (index >= 0) {
      responseInterceptors.splice(index, 1);
    }
  };
}

export function addErrorInterceptor(interceptor: ErrorInterceptor): () => void {
  errorInterceptors.push(interceptor);
  return () => {
    const index = errorInterceptors.indexOf(interceptor);
    if (index >= 0) {
      errorInterceptors.splice(index, 1);
    }
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function normalizeErrorPayload(payload: unknown): {
  message: string;
  code?: string;
  details?: unknown;
} {
  if (!isRecord(payload)) {
    return { message: 'Request failed' };
  }

  const detail = payload.detail;
  if (typeof detail === 'string') {
    return {
      message: detail,
      code: typeof payload.code === 'string' ? payload.code : undefined,
      details: payload,
    };
  }

  if (Array.isArray(detail)) {
    const message = detail
      .map((entry) => {
        if (!isRecord(entry)) {
          return null;
        }

        const msg = entry.msg;
        return typeof msg === 'string' ? msg : null;
      })
      .filter((entry): entry is string => entry !== null)
      .join(', ');

    return {
      message: message || 'Validation failed',
      code: typeof payload.code === 'string' ? payload.code : undefined,
      details: detail,
    };
  }

  if (typeof payload.message === 'string') {
    return {
      message: payload.message,
      code: typeof payload.code === 'string' ? payload.code : undefined,
      details: payload,
    };
  }

  return {
    message: 'Request failed',
    code: typeof payload.code === 'string' ? payload.code : undefined,
    details: payload,
  };
}

async function parseErrorResponse(response: Response): Promise<ApiError> {
  const contentType = response.headers.get('content-type') || '';
  const url = new URL(response.url);
  const path = url.pathname;

  // Handle 503 Service Unavailable for email service
  if (response.status === 503) {
    if (path.includes('/auth/forgot-password') || path.includes('/inventory/alerts/check')) {
      return new ApiError(
        'Email service is temporarily unavailable. Please try again in a few minutes.',
        503,
      );
    }
  }

  if (contentType.includes('application/json')) {
    const payload = (await response.json().catch(() => null)) as unknown;
    const normalized = normalizeErrorPayload(payload);
    return new ApiError(normalized.message, response.status, {
      code: normalized.code,
      details: normalized.details,
      raw: payload,
    });
  }

  const text = await response.text().catch(() => '');
  return new ApiError(text || `Request failed with status ${response.status}`, response.status);
}

async function fetchWithTimeout(config: RequestConfig): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, config.timeoutMs);

  if (config.signal) {
    config.signal.addEventListener('abort', () => {
      controller.abort();
    });
  }

  try {
    return await fetch(config.url, {
      method: config.method,
      headers: config.headers,
      body: config.body,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function runErrorInterceptors(error: ApiError): Promise<ApiError> {
  let currentError = error;

  for (const interceptor of errorInterceptors) {
    currentError = await interceptor(currentError);
  }

  return currentError;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const {
    method = 'GET',
    token,
    body,
    headers = {},
    timeoutMs = DEFAULT_TIMEOUT_MS,
    signal,
    skipAuth = false,
  } = options;

  const resolvedToken = !skipAuth ? token || authTokenProvider?.() || undefined : undefined;
  const requestHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...(resolvedToken ? { Authorization: `Bearer ${resolvedToken}` } : {}),
    ...headers,
  };

  const requestBody = body !== undefined ? JSON.stringify(body) : undefined;
  if (requestBody) {
    requestHeaders['Content-Type'] = requestHeaders['Content-Type'] || 'application/json';
  }

  let requestConfig: RequestConfig = {
    url: buildApiUrl(path),
    method,
    headers: requestHeaders,
    body: requestBody,
    timeoutMs,
    signal,
  };

  for (const interceptor of requestInterceptors) {
    requestConfig = await interceptor(requestConfig);
  }

  let response: Response;

  try {
    response = await fetchWithTimeout(requestConfig);
  } catch (error) {
    const isAbortError = error instanceof DOMException && error.name === 'AbortError';
    const apiError = new ApiError(
      isAbortError ? 'Request timed out or was aborted' : 'Network error',
      null,
      {
        raw: error,
      },
    );

    throw await runErrorInterceptors(apiError);
  }

  for (const interceptor of responseInterceptors) {
    response = await interceptor(response);
  }

  if (!response.ok) {
    const apiError = await parseErrorResponse(response);
    throw await runErrorInterceptors(apiError);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return (await response.json()) as T;
  }

  return (await response.text()) as T;
}
