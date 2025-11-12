export type ClientResponse<T> = {
  readonly data: T | null;
  readonly error: { readonly message?: string | null } | null;
};

export function ensureClientResponse<T>(value: unknown): ClientResponse<T> {
  if (value && typeof value === "object") {
    const candidate = value as Record<string, unknown>;
    return {
      data: (candidate.data as T | null | undefined) ?? null,
      error: (candidate.error as { message?: string | null } | null) ?? null,
    };
  }

  return { data: null, error: null };
}
