export function toQueryString(params: Record<string, unknown>): string {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') {
      continue;
    }

    if (Array.isArray(value)) {
      value.forEach((entry) => {
        if (entry !== undefined && entry !== null) {
          search.append(key, String(entry));
        }
      });
      continue;
    }

    search.append(key, String(value));
  }

  const query = search.toString();
  return query ? `?${query}` : '';
}
