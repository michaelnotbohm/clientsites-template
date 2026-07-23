"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, AlertCircle } from "lucide-react";
import { saveTeamMember } from "@/lib/admin/actions/team";
import { ImagePickerButton } from "@/components/admin/image-picker";

export interface TeamMemberValues {
  id: string | null; // null → creating a new member
  name: string;
  title: string;
  license_no: string;
  phone: string;
  email: string;
  photo_url: string;
  photo_position: string;
  bio: string;
}

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block text-sm font-medium text-slate-700">
      {children}
    </label>
  );
}

export function TeamMemberForm({ initial }: { initial: TeamMemberValues }) {
  const router = useRouter();
  const [values, setValues] = useState<TeamMemberValues>(initial);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [photoFailed, setPhotoFailed] = useState(false);

  const isNew = initial.id === null;

  function update(key: keyof TeamMemberValues, value: string) {
    setStatus("idle");
    if (key === "photo_url") setPhotoFailed(false);
    setValues((current) => ({ ...current, [key]: value }));
  }

  function handleSave() {
    const formData = new FormData();
    if (values.id) formData.set("memberId", values.id);
    formData.set("name", values.name);
    formData.set("title", values.title);
    formData.set("license_no", values.license_no);
    formData.set("phone", values.phone);
    formData.set("email", values.email);
    formData.set("photo_url", values.photo_url);
    formData.set("photo_position", values.photo_position);
    formData.set("bio", values.bio);

    startTransition(async () => {
      const result = await saveTeamMember(formData);
      if (result.ok) {
        setStatus("saved");
        setErrorMessage(null);
        if (isNew) {
          router.push("/admin/team");
        } else {
          router.refresh();
        }
      } else {
        setStatus("error");
        setErrorMessage(result.error ?? "Save failed.");
      }
    });
  }

  const showPhoto =
    /^https?:\/\/\S+$/i.test(values.photo_url.trim()) && !photoFailed;

  return (
    <div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <FieldLabel>Name *</FieldLabel>
            <input
              type="text"
              value={values.name}
              onChange={(e) => update("name", e.target.value)}
              className={inputClass}
              placeholder="Jane Smith"
            />
          </div>

          <div>
            <FieldLabel>Title</FieldLabel>
            <input
              type="text"
              value={values.title}
              onChange={(e) => update("title", e.target.value)}
              className={inputClass}
              placeholder="Senior Loan Originator"
            />
          </div>

          <div>
            <FieldLabel>NMLS / License #</FieldLabel>
            <input
              type="text"
              value={values.license_no}
              onChange={(e) => update("license_no", e.target.value)}
              className={inputClass}
              placeholder="123456"
            />
          </div>

          <div>
            <FieldLabel>Phone</FieldLabel>
            <input
              type="text"
              value={values.phone}
              onChange={(e) => update("phone", e.target.value)}
              className={inputClass}
              placeholder="(813) 555-0100"
            />
          </div>

          <div className="md:col-span-2">
            <FieldLabel>Email</FieldLabel>
            <input
              type="email"
              value={values.email}
              onChange={(e) => update("email", e.target.value)}
              className={inputClass}
              placeholder="jane@baytobaylending.com"
            />
          </div>

          <div className="md:col-span-2">
            <FieldLabel>Photo</FieldLabel>
            <div className="flex items-start gap-2">
              <input
                type="text"
                value={values.photo_url}
                onChange={(e) => update("photo_url", e.target.value)}
                className={`${inputClass} font-mono text-xs`}
                placeholder="https://…"
              />
              <ImagePickerButton
                currentUrl={values.photo_url}
                onSelect={(url) => update("photo_url", url)}
              />
            </div>
            {showPhoto && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={values.photo_url.trim()}
                alt=""
                onError={() => setPhotoFailed(true)}
                className="mt-3 h-28 w-28 rounded-xl border border-slate-200 object-cover"
                style={{
                  objectPosition: values.photo_position.trim() || undefined,
                }}
              />
            )}
          </div>

          <div className="md:col-span-2">
            <FieldLabel>Photo Position</FieldLabel>
            <input
              type="text"
              value={values.photo_position}
              onChange={(e) => update("photo_position", e.target.value)}
              className={`${inputClass} max-w-[260px]`}
              placeholder="e.g. center top"
            />
            <p className="mt-1.5 text-xs text-slate-400">
              Adjusts how the headshot crops in the grid (CSS object-position).
              Common values: <span className="font-mono">center top</span>,{" "}
              <span className="font-mono">center</span>,{" "}
              <span className="font-mono">50% 20%</span>. The preview above
              reflects it.
            </p>
          </div>

          <div className="md:col-span-2">
            <FieldLabel>Bio</FieldLabel>
            <textarea
              value={values.bio}
              rows={5}
              onChange={(e) => update("bio", e.target.value)}
              className={inputClass}
              placeholder="A short professional bio…"
            />
          </div>
        </div>
      </div>

      {/* Save bar */}
      <div className="sticky bottom-4 mt-6 flex items-center justify-end gap-3 rounded-2xl border border-slate-200 bg-white/95 px-5 py-3.5 shadow-lg backdrop-blur">
        {status === "saved" && !isNew && (
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
          disabled={isPending || values.name.trim().length === 0}
          className="rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-violet-700 disabled:opacity-60"
        >
          {isPending
            ? "Saving…"
            : isNew
              ? "Add team member"
              : "Save changes"}
        </button>
      </div>
    </div>
  );
}
