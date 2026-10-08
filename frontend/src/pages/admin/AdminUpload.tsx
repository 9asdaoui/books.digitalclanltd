import { FormEvent, useEffect, useState } from "react";
import { FileDropzone } from "../../components/FileDropzone";
import { ToastContainer } from "../../components/Toast";
import {
  Button,
  Card,
  CardTitle,
  Input,
  Label,
  Select,
  Textarea,
  Toggle,
} from "../../components/ui";
import { useToast } from "../../hooks/useToast";
import { createAdminBook, fetchGenres, Genre } from "../../lib/api";
import { getToken } from "../../lib/auth";

export default function AdminUpload() {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(false);
  const { toasts, addToast, dismiss } = useToast();

  const [title, setTitle] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [description, setDescription] = useState("");
  const [genreId, setGenreId] = useState("");
  const [freePageLimit, setFreePageLimit] = useState(5);
  const [isPublished, setIsPublished] = useState(false);
  const [originalPublication, setOriginalPublication] = useState("");
  const [seriesTitle, setSeriesTitle] = useState("");
  const [credits, setCredits] = useState("");
  const [language, setLanguage] = useState("English");
  const [locClass, setLocClass] = useState("");
  const [subjects, setSubjects] = useState("");
  const [category, setCategory] = useState("Text");
  const [ebookNo, setEbookNo] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [copyrightNotice, setCopyrightNotice] = useState("");
  const [publisher, setPublisher] = useState("Digital Clan Ltd");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [ebookFile, setEbookFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  useEffect(() => {
    fetchGenres()
      .then((g) => {
        setGenres(g);
        if (g.length > 0) setGenreId(g[0].id);
      })
      .catch(() => addToast("error", "Failed to load genres"));
  }, [addToast]);

  useEffect(() => {
    if (!coverFile) {
      setCoverPreview(null);
      return;
    }
    const url = URL.createObjectURL(coverFile);
    setCoverPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [coverFile]);

  const appendIf = (formData: FormData, key: string, value: string) => {
    if (value.trim()) formData.append(key, value.trim());
  };

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

    const token = getToken();
    if (!token) {
      addToast("error", "Session expired. Please sign in again.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("genre_id", genreId);
      formData.append("free_page_limit", String(freePageLimit));
      formData.append("is_published", String(isPublished));
      formData.append("cover_image", coverFile);
      formData.append("ebook_file", ebookFile);
      appendIf(formData, "description", description);
      appendIf(formData, "author_name", authorName);
      appendIf(formData, "original_publication", originalPublication);
      appendIf(formData, "series_title", seriesTitle);
      appendIf(formData, "credits", credits);
      appendIf(formData, "language", language);
      appendIf(formData, "loc_class", locClass);
      appendIf(formData, "subjects", subjects);
      appendIf(formData, "category", category);
      appendIf(formData, "ebook_no", ebookNo);
      appendIf(formData, "release_date", releaseDate);
      appendIf(formData, "copyright_notice", copyrightNotice);
      appendIf(formData, "publisher", publisher);

      const book = await createAdminBook(formData, token);
      addToast("success", `"${book.title}" uploaded — ${book.total_pages} pages parsed automatically.`);
      setTitle("");
      setAuthorName("");
      setDescription("");
      setOriginalPublication("");
      setSeriesTitle("");
      setCredits("");
      setSubjects("");
      setLocClass("");
      setEbookNo("");
      setReleaseDate("");
      setCopyrightNotice("");
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
    <>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
      <div className="space-y-8">
        <div>
          <p className="label-brand">Content</p>
          <h1 className="text-display text-3xl font-bold text-surface-100">Upload Book</h1>
          <p className="mt-2 text-surface-400">
            Page count is calculated automatically from the EPUB or PDF content.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-8 xl:grid-cols-2">
          <div className="space-y-6">
            <Card>
              <CardTitle>About this eBook</CardTitle>
              <div className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="title" required>Title</Label>
                  <Input id="title" required value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="author">Author</Label>
                  <Input
                    id="author"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="Tuttle, W. C. (Wilbur C.), 1883-1969"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="genre" required>Genre</Label>
                  <Select id="genre" required value={genreId} onChange={(e) => setGenreId(e.target.value)}>
                    {genres.map((g) => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </Select>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label htmlFor="language">Language</Label>
                    <Input id="language" value={language} onChange={(e) => setLanguage(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="category">Category</Label>
                    <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} />
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <CardTitle>Publication details</CardTitle>
              <div className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="original-publication">Original Publication</Label>
                  <Input
                    id="original-publication"
                    value={originalPublication}
                    onChange={(e) => setOriginalPublication(e.target.value)}
                    placeholder="New York, NY: The Ridgway Company, 1925."
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="series-title">Series Title</Label>
                  <Input
                    id="series-title"
                    value={seriesTitle}
                    onChange={(e) => setSeriesTitle(e.target.value)}
                    placeholder="Produced from Adventure Magazine, November 30, 1925."
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="publisher">Publisher</Label>
                  <Input id="publisher" value={publisher} onChange={(e) => setPublisher(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="credits">Credits</Label>
                  <Input
                    id="credits"
                    value={credits}
                    onChange={(e) => setCredits(e.target.value)}
                    placeholder="Prepared by volunteers at BookCove"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label htmlFor="ebook-no">eBook-No.</Label>
                    <Input id="ebook-no" value={ebookNo} onChange={(e) => setEbookNo(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="release-date">Release Date</Label>
                    <Input id="release-date" value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="copyright">Copyright</Label>
                  <Input
                    id="copyright"
                    value={copyrightNotice}
                    onChange={(e) => setCopyrightNotice(e.target.value)}
                    placeholder="Public domain in the USA."
                  />
                </div>
              </div>
            </Card>

            <Card>
              <CardTitle>Classification</CardTitle>
              <div className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="loc-class">LoC Class</Label>
                  <Input
                    id="loc-class"
                    value={locClass}
                    onChange={(e) => setLocClass(e.target.value)}
                    placeholder="PS: Language and Literatures: American and Canadian literature"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="subjects">Subjects</Label>
                  <Textarea
                    id="subjects"
                    value={subjects}
                    onChange={(e) => setSubjects(e.target.value)}
                    rows={3}
                    placeholder="Western stories, Detective and mystery stories, Murder -- Investigation -- Fiction"
                  />
                  <p className="text-xs text-surface-500">Separate multiple subjects with commas.</p>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="free-limit">Free preview pages</Label>
                  <Input
                    id="free-limit"
                    type="number"
                    min={0}
                    value={freePageLimit}
                    onChange={(e) => setFreePageLimit(Number(e.target.value))}
                  />
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
          </div>

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
                  hint="EPUB or PDF — text is extracted and split into pages automatically"
                  accept=".epub,.pdf,application/epub+zip,application/pdf"
                  file={ebookFile}
                  onFileSelect={setEbookFile}
                />
              </div>
            </Card>

            <Button type="submit" size="lg" loading={loading} fullWidth>
              {loading ? "Parsing & uploading..." : "Publish Book"}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
