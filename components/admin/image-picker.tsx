"use client";

import { useEffect, useRef, useState } from "react";
import {
  ImagePlus,
  UploadCloud,
  X,
  Loader2,
  AlertCircle,
  Check,
} from "lucide-react";
import { createClient } from "@/lib/supabase/admin-client";
import {
  listMedia,
  registerMedia,
  type MediaListItem,
} from "@/lib/admin/actions/media";

/** Read intrinsic dimensions of an image file in the browser. */
function readImageDimensions(
  file: File
): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(objectUrl);
    };
    img.onerror = () => {
      resolve(null);
      URL.revokeObjectURL(objectUrl);
    };
    img.src = objectUrl;
  });
}

function sanitizeFileName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]+/g, "-")
    .replace(/-+/g, "-");
}

interface ImagePickerButtonProps {
  /** Called with the chosen image's public URL. */
  onSelect: (url: string) => void;
  /** Currently selected URL, highlighted in the grid. */
  currentUrl?: string;
}

/**
 * "Choose image" button + modal media library.
 * Pick from the tenant's library, or upload a new image which is
 * registered and selected in one step.
 */
export function ImagePickerButton({
  onSelect,
  currentUrl,
}: ImagePickerButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<MediaListItem[]>([]);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    listMedia().then((result) => {
      if (cancelled) return;
      setLoading(false);
      if (result.ok && result.items && result.tenantId) {
        setItems(result.items);
        setTenantId(result.tenantId);
      } else {
        setError(result.error ?? "Failed to load media.");
      }
    });

    return () => {
      cancelled = true;
    };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0 || !tenantId) return;
    const file = files[0];

    setIsUploading(true);
    setError(null);

    const supabase = createClient();
    const path = `${tenantId}/${Date.now()}-${sanitizeFileName(file.name)}`;

    const { error: uploadErr } = await supabase.storage
      .from("media")
      .upload(path, file, { cacheControl: "3600", upsert: false });

    if (uploadErr) {
      setIsUploading(false);
      setError("Upload failed. Please try again.");
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("media").getPublicUrl(path);

    const dimensions = await readImageDimensions(file);

    const formData = new FormData();
    formData.set("url", publicUrl);
    formData.set(
      "alt",
      file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ")
    );
    if (dimensions) {
      formData.set("width", String(dimensions.width));
      formData.set("height", String(dimensions.height));
    }

    await registerMedia(formData);
    setIsUploading(false);

    // Use the freshly uploaded image immediately
    onSelect(publicUrl);
    setOpen(false);
  }

  function handlePick(url: string) {
    onSelect(url);
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700"
      >
        <ImagePlus className="h-3.5 w-3.5" />
        Choose image
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="flex max-h-[85vh] w-full max-w-3xl flex-col rounded-2xl border border-slate-200 bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h2 className="text-sm font-semibold text-slate-900">
                Choose an image
              </h2>
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml,image/avif"
                  className="hidden"
                  onChange={(e) => handleUpload(e.target.files)}
                />
                <button
                  type="button"
                  disabled={isUploading || !tenantId}
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-violet-700 disabled:opacity-60"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Uploading…
                    </>
                  ) : (
                    <>
                      <UploadCloud className="h-3.5 w-3.5" />
                      Upload new
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5">
              {loading && (
                <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading library…
                </div>
              )}

              {error && (
                <p className="flex items-center gap-1.5 py-4 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </p>
              )}

              {!loading && !error && items.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-300 px-6 py-12 text-center text-sm text-slate-400">
                  No images in the library yet — use{" "}
                  <span className="font-medium text-slate-600">
                    Upload new
                  </span>{" "}
                  above.
                </div>
              )}

              {!loading && !error && items.length > 0 && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {items.map((item) => {
                    const isCurrent =
                      !!currentUrl && item.url === currentUrl.trim();
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handlePick(item.url)}
                        className={
                          isCurrent
                            ? "group relative overflow-hidden rounded-xl border-2 border-violet-500 text-left"
                            : "group relative overflow-hidden rounded-xl border border-slate-200 text-left transition-colors hover:border-violet-300"
                        }
                      >
                        <div className="aspect-[4/3] bg-slate-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.url}
                            alt={item.alt ?? ""}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        {isCurrent && (
                          <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 text-white">
                            <Check className="h-3 w-3" />
                          </span>
                        )}
                        <div className="px-2 py-1.5">
                          <p className="truncate text-[11px] font-medium text-slate-600">
                            {item.alt || "Untitled"}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
