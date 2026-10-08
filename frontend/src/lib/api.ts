const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

export type Genre = { id: string; name: string; slug: string };

export type Book = {
  id: string;
  title: string;
  author_id: string;
  description: string | null;
  genre_id: string | null;
  cover_url: string | null;
  total_pages: number;
  free_page_limit: number;
  is_published: boolean;
  language: string;
  metadata_extra?: Record<string, unknown>;
};

export type AuthUser = {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  is_subscriber: boolean;
};

export type AdminBook = Book & {
  file_encrypted_path: string | null;
  metadata_extra: Record<string, unknown>;
};

export async function fetchHealth(): Promise<Record<string, unknown>> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
  return res.json();
}

export async function fetchGenres(): Promise<Genre[]> {
  const res = await fetch(`${API_BASE}/genres`);
  if (!res.ok) throw new Error(`Genres fetch failed: ${res.status}`);
  return res.json();
}

export async function fetchBooks(): Promise<Book[]> {
  const res = await fetch(`${API_BASE}/books`);
  if (!res.ok) throw new Error(`Books fetch failed: ${res.status}`);
  return res.json();
}

export async function fetchBook(bookId: string): Promise<Book> {
  const res = await fetch(`${API_BASE}/books/${bookId}`);
  if (!res.ok) throw new Error("Book not found");
  return res.json();
}

export async function reparseAdminBook(bookId: string, token: string): Promise<AdminBook> {
  const res = await fetch(`${API_BASE}/admin/books/${bookId}/reparse`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = (data as { detail?: string }).detail ?? "Reparse failed";
    throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
  }
  return data as AdminBook;
}

export async function fetchAdminBooks(token: string): Promise<AdminBook[]> {
  const res = await fetch(`${API_BASE}/admin/books`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to load admin books");
  return res.json();
}

export async function fetchPage(
  bookId: string,
  pageNumber: number,
  token?: string,
): Promise<{ ok: boolean; status: number; data: unknown }> {
  const headers: HeadersInit = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}/books/${bookId}/pages/${pageNumber}`, { headers });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

export async function login(email: string, password: string): Promise<string> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { detail?: string }).detail ?? "Login failed");
  }
  const data = await res.json();
  return data.access_token as string;
}

export async function register(email: string, password: string, fullName?: string): Promise<string> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, full_name: fullName || null }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { detail?: string }).detail ?? "Registration failed");
  }
  const data = await res.json();
  return data.access_token as string;
}

export async function fetchMe(token: string): Promise<AuthUser> {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Session expired");
  return res.json();
}

export async function fetchSubscriptionStatus(token: string) {
  const res = await fetch(`${API_BASE}/subscriptions/status`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to load subscription");
  return res.json();
}

export async function createAdminBook(formData: FormData, token: string): Promise<AdminBook> {
  const res = await fetch(`${API_BASE}/admin/books`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = (data as { detail?: string }).detail ?? `Upload failed (${res.status})`;
    throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
  }
  return data as AdminBook;
}
