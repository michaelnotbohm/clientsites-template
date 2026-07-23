"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Check, AlertCircle } from "lucide-react";
import { updateSectionContent } from "@/lib/admin/actions/sections";
import { ImagePickerButton } from "@/components/admin/image-picker";

type Json =
  | string
  | number
  | boolean
  | null
  | Json[]
  | { [key: string]: Json };

type Path = (string | number)[];

/** "quick_facts" / "quickFacts" → "Quick Facts" */
function prettyLabel(key: string | number): string {
  if (typeof key === "number") return `Item ${key + 1}`;
  return key
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function isLongText(value: string): boolean {
  return value.length > 80 || value.includes("\n");
}

function isUrlKey(key: string | number): boolean {
  if (typeof key !== "string") return false;
  const k = key.toLowerCase();
  return (
    k.endsWith("url") || k.endsWith("href") || k.endsWith("link") ||
    k.includes("image") || k.includes("photo") || k.includes("icon") ||
    k.includes("logo") || k.includes("avatar")
  );
}

/** Keys that should be treated as image fields (thumbnail + picker). */
function isImageKey(key: string | number): boolean {
  if (typeof key !== "string") return false;
  const k = key.toLowerCase();
  return (
    k.includes("image") || k.includes("photo") || k.includes("icon") ||
    k.includes("logo") || k.includes("avatar") || k.includes("thumbnail") ||
    k.includes("og_image") || k.includes("background")
  );
}

/**
 * Sort weight for field ordering so forms read naturally:
 * eyebrow/headline first, then subheads, body, CTAs, then the rest.
 */
function fieldWeight(key: string): number {
  const k = key.toLowerCase();
  if (k.includes("eyebrow")) return 0;
  if (k === "headline" || k === "heading" || k === "title" || k === "h1")
    return 1;
  if (k.includes("subhead") || k.includes("subheading") || k.includes("subtitle"))
    return 2;
  if (k === "text" || k === "body" || k.includes("description")) return 3;
  if (k.includes("cta") || k.includes("button")) return 4;
  return 5;
}

/** Immutable set at a nested path. */
function setAtPath(root: Json, path: Path, value: Json): Json {
  if (path.length === 0) return value;
  const next: Json = structuredClone(root);
  let cursor: Json = next;
  for (let i = 0; i < path.length - 1; i++) {
    cursor = (cursor as Record<string, Json>)[path[i] as string];
  }
  (cursor as Record<string, Json>)[path[path.length - 1] as string] = value;
  return next;
}

/** Immutable remove of an array index at a nested path. */
function removeAtPath(root: Json, arrayPath: Path, index: number): Json {
  const next: Json = structuredClone(root);
  let cursor: Json = next;
  for (const key of arrayPath) {
    cursor = (cursor as Record<string, Json>)[key as string];
  }
  (cursor as Json[]).splice(index, 1);
  return next;
}

/** Build an empty copy of a value to use as a new array item. */
function cloneEmpty(template: Json): Json {
  if (typeof template === "string") return "";
  if (typeof template === "number") return 0;
  if (typeof template === "boolean") return false;
  if (template === null) return "";
  if (Array.isArray(template)) return [];
  const result: { [key: string]: Json } = {};
  for (const [key, value] of Object.entries(template)) {
    result[key] = cloneEmpty(value);
  }
  return result;
}

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500";

/** Image URL field thumbnail that hides itself if the URL isn't an image. */
function ImageThumb({ src }: { src: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      onError={() => setFailed(true)}
      className="mt-2 h-16 w-auto rounded-lg border border-slate-200 object-cover"
    />
  );
}

interface FieldProps {
  label: string;
  value: Json;
  path: Path;
  onChange: (path: Path, value: Json) => void;
  onRemoveItem: (arrayPath: Path, index: number) => void;
  depth: number;
}

function Field({ label, value, path, onChange, onRemoveItem, depth }: FieldProps) {
  // ----- string -----
  if (typeof value === "string" || value === null) {
    const stringValue = value ?? "";
    const lastKey = path[path.length - 1];
    const imageField = isImageKey(lastKey);
    const showThumb =
      imageField &&
      typeof value === "string" &&
      /^https?:\/\/\S+$/i.test(value.trim());

    if (typeof value === "string" && isLongText(value) && !imageField) {
      return (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            {label}
          </label>
          <textarea
            value={stringValue}
            rows={Math.min(8, Math.max(3, Math.ceil(stringValue.length / 80)))}
            onChange={(e) => onChange(path, e.target.value)}
            className={inputClass}
          />
        </div>
      );
    }

    return (
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
        </label>
        <div className="flex items-start gap-2">
          <input
            type="text"
            value={stringValue}
            onChange={(e) => onChange(path, e.target.value)}
            className={
              isUrlKey(lastKey)
                ? `${inputClass} font-mono text-xs`
                : inputClass
            }
          />
          {imageField && (
            <ImagePickerButton
              currentUrl={stringValue}
              onSelect={(url) => onChange(path, url)}
            />
          )}
        </div>
        {showThumb && <ImageThumb src={(value as string).trim()} />}
      </div>
    );
  }

  // ----- number -----
  if (typeof value === "number") {
    return (
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
        </label>
        <input
          type="number"
          step="any"
          value={Number.isFinite(value) ? value : 0}
          onChange={(e) => {
            const parsed = parseFloat(e.target.value);
            onChange(path, Number.isNaN(parsed) ? 0 : parsed);
          }}
          className={`${inputClass} max-w-[200px]`}
        />
      </div>
    );
  }

  // ----- boolean -----
  if (typeof value === "boolean") {
    return (
      <label className="flex w-fit cursor-pointer items-center gap-2.5">
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => onChange(path, e.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
        />
        <span className="text-sm font-medium text-slate-700">{label}</span>
      </label>
    );
  }

  // ----- array -----
  if (Array.isArray(value)) {
    const template = value.length > 0 ? value[value.length - 1] : "";

    return (
      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-800">{label}</p>
          <button
            type="button"
            onClick={() => onChange(path, [...value, cloneEmpty(template)])}
            className="flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
          >
            <Plus className="h-3 w-3" />
            Add
          </button>
        </div>
        <div className="space-y-3">
          {value.map((item, index) => (
            <div
              key={index}
              className="rounded-xl border border-slate-200 bg-slate-50/60 p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  {prettyLabel(index)}
                </p>
                <button
                  type="button"
                  onClick={() => onRemoveItem(path, index)}
                  className="flex items-center gap-1 rounded-md px-1.5 py-1 text-xs text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                  title="Remove item"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <Field
                label=""
                value={item}
                path={[...path, index]}
                onChange={onChange}
                onRemoveItem={onRemoveItem}
                depth={depth + 1}
              />
            </div>
          ))}
          {value.length === 0 && (
            <p className="text-xs text-slate-400">No items yet.</p>
          )}
        </div>
      </div>
    );
  }

  // ----- object -----
  const entries = Object.entries(value).sort(
    (a, b) => fieldWeight(a[0]) - fieldWeight(b[0])
  );
  return (
    <div className={depth > 0 ? "space-y-4" : "space-y-5"}>
      {label && depth > 0 && (
        <p className="text-sm font-semibold text-slate-800">{label}</p>
      )}
      {entries.map(([key, childValue]) => (
        <Field
          key={key}
          label={prettyLabel(key)}
          value={childValue}
          path={[...path, key]}
          onChange={onChange}
          onRemoveItem={onRemoveItem}
          depth={depth + 1}
        />
      ))}
    </div>
  );
}

interface SectionContentFormProps {
  sectionId: string;
  initialContent: Record<string, Json>;
}

export function SectionContentForm({
  sectionId,
  initialContent,
}: SectionContentFormProps) {
  const router = useRouter();
  const [content, setContent] = useState<Json>(initialContent);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleChange(path: Path, value: Json) {
    setStatus("idle");
    setContent((current) => setAtPath(current, path, value));
  }

  function handleRemoveItem(arrayPath: Path, index: number) {
    setStatus("idle");
    setContent((current) => removeAtPath(current, arrayPath, index));
  }

  function handleSave() {
    const formData = new FormData();
    formData.set("sectionId", sectionId);
    formData.set("content", JSON.stringify(content));

    startTransition(async () => {
      const result = await updateSectionContent(formData);
      if (result.ok) {
        setStatus("saved");
        setErrorMessage(null);
        router.refresh();
      } else {
        setStatus("error");
        setErrorMessage(result.error ?? "Save failed.");
      }
    });
  }

  const isEmpty =
    typeof content === "object" &&
    content !== null &&
    !Array.isArray(content) &&
    Object.keys(content).length === 0;

  return (
    <div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {isEmpty ? (
          <p className="text-sm text-slate-400">
            This section has no editable content fields.
          </p>
        ) : (
          <Field
            label=""
            value={content}
            path={[]}
            onChange={handleChange}
            onRemoveItem={handleRemoveItem}
            depth={0}
          />
        )}
      </div>

      {/* Save bar */}
      <div className="sticky bottom-4 mt-6 flex items-center justify-end gap-3 rounded-2xl border border-slate-200 bg-white/95 px-5 py-3.5 shadow-lg backdrop-blur">
        {status === "saved" && (
          <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
            <Check className="h-4 w-4" />
            Saved — live site updated
          </span>
        )}
        {status === "error" && (
          <span className="flex items-center gap-1.5 text-sm font-medium text-red-600">
            <AlertCircle className="h-4 w-4" />
            {errorMessage}
          </span>
        )}
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending || isEmpty}
          className="rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-violet-700 disabled:opacity-60"
        >
          {isPending ? "Saving…" : "Save changes"}
        </button>
      </div>
    </div>
  );
}
