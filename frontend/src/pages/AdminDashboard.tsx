import { FormEvent, useEffect, useState } from "react";
import { FileDropzone } from "../components/FileDropzone";
import { AdminHeader } from "../components/layout/AdminHeader";
import { AppShell } from "../components/layout/AppShell";
import { ToastContainer } from "../components/Toast";
import {
  Button,
  Card,
  CardTitle,
  Input,
  Label,
  Select,
  Textarea,
  Toggle,
} from "../components/ui";
import { useToast } from "../hooks/useToast";
import { createAdminBook, fetchGenres, Genre, login } from "../lib/api";
import { clearToken, getToken, setToken } from "../lib/auth";

export default function AdminDashboard() {
  const [authenticated, setAuthenticated] = useState(!!getToken());
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(false);
  const { toasts, addToast, dismiss } = useToast();

  const [title, setTitle] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [description, setDescription] = useState("");
  const [genreId, setGenreId] = useState("");
  const [totalPages, setTotalPages] = useState(100);
  const [freePageLimit, setFreePageLimit] = useState(5);
  const [isPublished, setIsPublished] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [ebookFile, setEbookFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const ensureAuth = (): string | null => {
    const token = getToken();
    if (!token) {
      addToast("error", "Please sign in as an administrator.");
      setAuthenticated(false);
      return null;
    }
    return token;
  };

  const handleAdminLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const token = await login(loginEmail, loginPassword);
      setToken(token);
      setAuthenticated(true);
      addToast("success", "Signed in successfully.");
    } catch {
      addToast("error", "Invalid credentials or insufficient privileges.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    clearToken();
    setAuthenticated(false);
    addToast("info", "Signed out.");
  };

  useEffect(() => {
    if (!authenticated) return;
    fetchGenres()
      .then((g) => {
        setGenres(g);
        if (g.length > 0) setGenreId(g[0].id);
      })
      .catch(() => addToast("error", "Failed to load genres"));
  }, [addToast, authenticated]);

  useEffect(() => {
    if (!coverFile) {
      setCoverPreview(null);
      return;
    }
    const url = URL.createObjectURL(coverFile);
    setCoverPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [coverFile]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!coverFile || !ebookFile) {
      addToast("error", "Both cover image and eBook file are required.");
      return;
    }
    if (!genreId) {
      addToast("error", "Please select a genre.");
      return;
    }

    const token = ensureAuth();
    if (!token) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("genre_id", genreId);
      formData.append("total_pages", String(totalPages));
      formData.append("free_page_limit", String(freePageLimit));
      formData.append("is_published", String(isPublished));
      if (authorName.trim()) formData.append("author_name", authorName.trim());
      formData.append("cover_image", coverFile);
      formData.append("ebook_file", ebookFile);

      const book = await createAdminBook(formData, token);
      addToast("success", `"${book.title}" uploaded successfully.`);
      setTitle("");
      setAuthorName("");
      setDescription("");
      setCoverFile(null);
      setEbookFile(null);
      setIsPublished(false);
    } catch (err) {
      addToast("error", err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell variant="admin">
      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      <AdminHeader
        actions={
          authenticated ? (
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Sign out
            </Button>
          ) : undefined
        }
      />

      <main className="mx-auto max-w-6xl px-6 py-8">
        {!authenticated ? (
          <Card className="mx-auto max-w-md" padding="lg">
            <h2 className="text-display mb-2 text-xl font-semibold text-surface-100">Administrator Sign In</h2>
            <p className="mb-6 text-sm text-surface-400">
              Use your admin credentials to access the content management system.
            </p>
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="admin-email">Email</Label>
                <Input
                  id="admin-email"
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="admin@yourdomain.com"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="admin-password">Password</Label>
                <Input
                  id="admin-password"
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
              </div>
              <Button type="submit" loading={loginLoading} fullWidth>
                {loginLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </Card>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-2">
            <Card>
              <CardTitle>Book Metadata</CardTitle>
              <div className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="title" required>
                    Title
                  </Label>
                  <Input
                    id="title"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="The Art of Digital Publishing"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="author">Author</Label>
                  <Input
                    id="author"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="Author display name"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    placeholder="A compelling synopsis..."
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="genre" required>
                    Genre
                  </Label>
                  <Select id="genre" required value={genreId} onChange={(e) => setGenreId(e.target.value)}>
                    {genres.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="total-pages" required>
                      Total Pages
                    </Label>
                    <Input
                      id="total-pages"
                      type="number"
                      min={1}
                      required
                      value={totalPages}
                      onChange={(e) => setTotalPages(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="free-limit" required>
                      Free Page Limit
                    </Label>
                    <Input
                      id="free-limit"
                      type="number"
                      min={0}
                      required
                      value={freePageLimit}
                      onChange={(e) => setFreePageLimit(Number(e.target.value))}
                    />
                  </div>
                </div>
                <Toggle
                  id="publish-toggle"
                  checked={isPublished}
                  onChange={setIsPublished}
                  label="Publish immediately"
                  description="Make visible to readers on the storefront"
                />
              </div>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardTitle>Assets</CardTitle>
                <div className="space-y-6">
                  <FileDropzone
                    label="Cover Image"
                    hint="PNG or JPG — served publicly"
                    accept="image/png,image/jpeg"
                    file={coverFile}
                    onFileSelect={setCoverFile}
                    previewUrl={coverPreview}
                  />
                  <FileDropzone
                    label="eBook File"
                    hint="EPUB or PDF — stored securely (no direct URL)"
                    accept=".epub,.pdf,application/epub+zip,application/pdf"
                    file={ebookFile}
                    onFileSelect={setEbookFile}
                  />
                </div>
              </Card>

              <Button type="submit" size="lg" loading={loading} fullWidth>
                {loading ? "Uploading..." : "Publish Book"}
              </Button>
            </div>
          </form>
        )}
      </main>
    </AppShell>
  );
}
