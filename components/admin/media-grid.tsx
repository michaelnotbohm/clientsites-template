"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  UploadCloud,
  Copy,
  Check,
  Trash2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/admin-client";
import { registerMedia, deleteMedia } from "@/lib/admin/actions/media";

export interface MediaRow {
  id: string;
  url: string;
  alt: string | null;
  width: number | null;
  height: number | null;
  created_at: string;
}

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

export function MediaGrid({
  tenantId,
  media,
}: {
  tenantId: string;
  media: MediaRow[];
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadError(null);

    const supabase = createClient();
    let failures = 0;

    for (const file of Array.from(files)) {
      const path = `${tenantId}/${Date.now()}-${sanitizeFileName(file.name)}`;

      const { error: uploadErr } = await supabase.storage
        .from("media")
        .upload(path, file, { cacheControl: "3600", upsert: false });

      if (uploadErr) {
        failures++;
        continue;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("media").getPublicUrl(path);

      const dimensions = await readImageDimensions(file);

      const formData = new FormData();
      formData.set("url", publicUrl);
      formData.set("alt", file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "));
      if (dimensions) {
        formData.set("width", String(dimensions.width));
        formData.set("height", String(dimensions.height));
      }

      const result = await registerMedia(formData);
      if (!result.ok) failures++;
    }

    setIsUploading(false);
    if (failures > 0) {
      setUploadError(
        `${failures} file${failures > 1 ? "s" : ""} failed to upload.`
      );
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
    router.refresh();
  }

  function handleCopy(item: MediaRow) {
    navigator.clipboard.writeText(item.url).then(() => {
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 1500);
    });
  }

  function handleDelete(item: MediaRow) {
    if (
      !window.confirm(
        "Delete this file? Anywhere it's used on the site will show a broken image."
      )
    ) {
      return;
    }
    const formData = new FormData();
    formData.set("mediaId", item.id);
    startTransition(async () => {
      await deleteMedia(formData);
      router.refresh();
    });
  }

  return (
    <div>
      {/* Upload area */}
      <div className="mb-6">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml,image/avif"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <button
          type="button"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
          className="flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-300 bg-white/60 px-6 py-8 text-sm font-medium text-slate-500 transition-colors hover:border-violet-300 hover:bg-violet-50/40 hover:text-violet-700 disabled:opacity-60"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Uploading…
            </>
          ) : (
            <>
              <UploadCloud className="h-5 w-5" />
              Click to upload images (PNG, JPG, WebP, GIF, SVG — max 10 MB)
            </>
          )}
        </button>
        {uploadError && (
          <p className="mt-2 flex items-center gap-1.5 text-sm text-red-600">
            <AlertCircle className="h-4 w-4" />
            {uploadError}
          </p>
        )}
      </div>

      {/* Grid */}
      {media.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-10 text-center text-sm text-slate-400">
          No media yet — upload the first image above.
        </div>
      ) : (
        <div
          className={
            isPending
              ? "pointer-events-none grid grid-cols-2 gap-4 opacity-60 sm:grid-cols-3 lg:grid-cols-4"
              : "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
          }
        >
          {media.map((item) => (
            <div
              key={item.id}
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="relative aspect-[4/3] bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.url}
                  alt={item.alt ?? ""}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                {/* Hover actions */}
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-slate-900/0 opacity-0 transition-all group-hover:bg-slate-900/40 group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => handleCopy(item)}
                    className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow hover:bg-slate-50"
                    title="Copy URL"
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Copy URL
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item)}
                    className="flex items-center justify-center rounded-lg bg-white p-1.5 text-red-600 shadow hover:bg-red-50"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="px-3 py-2.5">
                <p className="truncate text-xs font-medium text-slate-700">
                  {item.alt || "Untitled"}
                </p>
                {item.width && item.height && (
                  <p className="text-[10px] text-slate-400">
                    {item.width} × {item.height}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
