"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, AlertCircle } from "lucide-react";
import { saveTenantSettings } from "@/lib/admin/actions/settings";
import { ImagePickerButton } from "@/components/admin/image-picker";

export interface TenantSettingsValues {
  name: string;
  logo_url: string;
  email: string;
  phone: string;
  phone_tollfree: string;
  fax: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  postal_code: string;
  license_label: string;
  license_number: string;
  social_links: Record<string, string>;
  theme: Record<string, unknown>;
}

const SOCIAL_PLATFORMS = [
  "facebook",
  "instagram",
  "linkedin",
  "youtube",
  "x",
] as const;

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block text-sm font-medium text-slate-700">
      {children}
    </label>
  );
}

function Card({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      {description && (
        <p className="mt-0.5 text-xs text-slate-400">{description}</p>
      )}
      <div className="mt-5">{children}</div>
    </div>
  );
}

function isHexColor(value: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(value);
}

interface SettingsFormProps {
  initial: TenantSettingsValues;
  /** Editors can't change the visual theme — admins and super_admins can. */
  canEditTheme: boolean;
}

export function SettingsForm({ initial, canEditTheme }: SettingsFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<TenantSettingsValues>(initial);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function update(key: keyof TenantSettingsValues, value: string) {
    setStatus("idle");
    setValues((current) => ({ ...current, [key]: value }));
  }

  function updateSocial(platform: string, url: string) {
    setStatus("idle");
    setValues((current) => {
      const next = { ...current.social_links };
      if (url.trim().length > 0) {
        next[platform] = url.trim();
      } else {
        delete next[platform];
      }
      return { ...current, social_links: next };
    });
  }

  function updateTheme(path: string[], value: string) {
    setStatus("idle");
    setValues((current) => {
      const nextTheme = structuredClone(current.theme);
      let cursor: Record<string, unknown> = nextTheme;
      for (let i = 0; i < path.length - 1; i++) {
        if (
          typeof cursor[path[i]] !== "object" ||
          cursor[path[i]] === null
        ) {
          cursor[path[i]] = {};
        }
        cursor = cursor[path[i]] as Record<string, unknown>;
      }
      cursor[path[path.length - 1]] = value;
      return { ...current, theme: nextTheme };
    });
  }

  function handleSave() {
    // Guardrail: block saves containing invalid hex colors
    if (canEditTheme) {
      const colorEntries = Object.entries(
        (values.theme.colors ?? {}) as Record<string, unknown>
      );
      const invalid = colorEntries
        .filter(([, v]) => typeof v === "string" && !isHexColor(v as string))
        .map(([k]) => k);

      if (invalid.length > 0) {
        setStatus("error");
        setErrorMessage(
          `Invalid color value for: ${invalid.join(", ")}. Use #RRGGBB format (e.g. #F5B301).`
        );
        return;
      }
    }

    const formData = new FormData();
    formData.set("name", values.name);
    formData.set("logo_url", values.logo_url);
    formData.set("email", values.email);
    formData.set("phone", values.phone);
    formData.set("phone_tollfree", values.phone_tollfree);
    formData.set("fax", values.fax);
    formData.set("address_line1", values.address_line1);
    formData.set("address_line2", values.address_line2);
    formData.set("city", values.city);
    formData.set("state", values.state);
    formData.set("postal_code", values.postal_code);
    formData.set("license_label", values.license_label);
    formData.set("license_number", values.license_number);
    formData.set("social_links", JSON.stringify(values.social_links));
    formData.set("theme", JSON.stringify(values.theme));

    startTransition(async () => {
      const result = await saveTenantSettings(formData);
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

  const fonts = (values.theme.font ?? {}) as Record<string, unknown>;
  const colors = (values.theme.colors ?? {}) as Record<string, unknown>;
  const radius = typeof values.theme.radius === "string" ? values.theme.radius : "";
  const container =
    typeof values.theme.container === "string" ? values.theme.container : "";

  return (
    <div className="space-y-6">
      {/* Business info */}
      <Card title="Business information">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <FieldLabel>Business name *</FieldLabel>
            <input
              type="text"
              value={values.name}
              onChange={(e) => update("name", e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <FieldLabel>Email</FieldLabel>
            <input
              type="email"
              value={values.email}
              onChange={(e) => update("email", e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="md:col-span-2">
            <FieldLabel>Logo</FieldLabel>
            <div className="flex items-start gap-2">
              <input
                type="text"
                value={values.logo_url}
                onChange={(e) => update("logo_url", e.target.value)}
                className={`${inputClass} font-mono text-xs`}
                placeholder="https://…"
              />
              <ImagePickerButton
                currentUrl={values.logo_url}
                onSelect={(url) => update("logo_url", url)}
              />
            </div>
            {/^https?:\/\/\S+$/i.test(values.logo_url.trim()) && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={values.logo_url.trim()}
                alt=""
                className="mt-3 h-12 w-auto rounded-lg border border-slate-200 bg-white object-contain p-1"
              />
            )}
          </div>

          <div>
            <FieldLabel>Phone</FieldLabel>
            <input
              type="text"
              value={values.phone}
              onChange={(e) => update("phone", e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <FieldLabel>Toll-free phone</FieldLabel>
            <input
              type="text"
              value={values.phone_tollfree}
              onChange={(e) => update("phone_tollfree", e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <FieldLabel>Fax</FieldLabel>
            <input
              type="text"
              value={values.fax}
              onChange={(e) => update("fax", e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </Card>

      {/* Address */}
      <Card title="Address">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <FieldLabel>Address line 1</FieldLabel>
            <input
              type="text"
              value={values.address_line1}
              onChange={(e) => update("address_line1", e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="md:col-span-2">
            <FieldLabel>Address line 2</FieldLabel>
            <input
              type="text"
              value={values.address_line2}
              onChange={(e) => update("address_line2", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <FieldLabel>City</FieldLabel>
            <input
              type="text"
              value={values.city}
              onChange={(e) => update("city", e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div>
              <FieldLabel>State</FieldLabel>
              <input
                type="text"
                value={values.state}
                onChange={(e) => update("state", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <FieldLabel>ZIP</FieldLabel>
              <input
                type="text"
                value={values.postal_code}
                onChange={(e) => update("postal_code", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Licensing */}
      <Card
        title="Licensing"
        description="Shown in the footer and structured data (e.g. NMLS #4102)."
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <FieldLabel>License label</FieldLabel>
            <input
              type="text"
              value={values.license_label}
              onChange={(e) => update("license_label", e.target.value)}
              className={inputClass}
              placeholder="NMLS"
            />
          </div>
          <div>
            <FieldLabel>License number</FieldLabel>
            <input
              type="text"
              value={values.license_number}
              onChange={(e) => update("license_number", e.target.value)}
              className={inputClass}
              placeholder="4102"
            />
          </div>
        </div>
      </Card>

      {/* Social links */}
      <Card
        title="Social links"
        description="Leave a field blank to hide that platform."
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {SOCIAL_PLATFORMS.map((platform) => (
            <div key={platform}>
              <FieldLabel>
                {platform === "x"
                  ? "X (Twitter)"
                  : platform.charAt(0).toUpperCase() + platform.slice(1)}
              </FieldLabel>
              <input
                type="text"
                value={values.social_links[platform] ?? ""}
                onChange={(e) => updateSocial(platform, e.target.value)}
                className={`${inputClass} font-mono text-xs`}
                placeholder={`https://${platform === "x" ? "x" : platform}.com/…`}
              />
            </div>
          ))}
        </div>
      </Card>

      {/* Theme — admins and super_admins only */}
      {canEditTheme && (
        <Card
          title="Theme"
          description="Colors, fonts, and shape tokens for the whole site. Changes apply everywhere on save."
        >
          <div className="space-y-6">
            {/* Colors */}
            <div>
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Colors
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Object.entries(colors).map(([key, raw]) => {
                  const colorValue = typeof raw === "string" ? raw : "";
                  const invalid =
                    colorValue.length > 0 && !isHexColor(colorValue);
                  return (
                    <div key={key}>
                      <FieldLabel>
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </FieldLabel>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={
                            isHexColor(colorValue) ? colorValue : "#000000"
                          }
                          onChange={(e) =>
                            updateTheme(["colors", key], e.target.value)
                          }
                          className="h-9 w-10 shrink-0 cursor-pointer rounded-lg border border-slate-300 bg-white p-0.5"
                        />
                        <input
                          type="text"
                          value={colorValue}
                          onChange={(e) =>
                            updateTheme(["colors", key], e.target.value)
                          }
                          className={
                            invalid
                              ? `${inputClass} border-red-400 font-mono text-xs focus:border-red-500 focus:ring-red-500`
                              : `${inputClass} font-mono text-xs`
                          }
                        />
                      </div>
                      {invalid && (
                        <p className="mt-1 text-xs text-red-600">
                          Must be #RRGGBB format
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Fonts */}
            <div>
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Fonts
              </p>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <FieldLabel>Heading font</FieldLabel>
                  <input
                    type="text"
                    value={
                      typeof fonts.heading === "string" ? fonts.heading : ""
                    }
                    onChange={(e) =>
                      updateTheme(["font", "heading"], e.target.value)
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <FieldLabel>Body font</FieldLabel>
                  <input
                    type="text"
                    value={typeof fonts.body === "string" ? fonts.body : ""}
                    onChange={(e) =>
                      updateTheme(["font", "body"], e.target.value)
                    }
                    className={inputClass}
                  />
                </div>
              </div>
              <p className="mt-2 text-xs text-slate-400">
                Fonts must be loaded by the site to take effect — changing the
                name here doesn&apos;t add a new font file.
              </p>
            </div>

            {/* Shape */}
            <div>
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Shape & layout
              </p>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <FieldLabel>Border radius</FieldLabel>
                  <input
                    type="text"
                    value={radius}
                    onChange={(e) => updateTheme(["radius"], e.target.value)}
                    className={`${inputClass} max-w-[200px] font-mono text-xs`}
                    placeholder="1rem"
                  />
                </div>
                <div>
                  <FieldLabel>Container width</FieldLabel>
                  <input
                    type="text"
                    value={container}
                    onChange={(e) => updateTheme(["container"], e.target.value)}
                    className={`${inputClass} max-w-[200px] font-mono text-xs`}
                    placeholder="1200px"
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Save bar */}
      <div className="sticky bottom-4 flex items-center justify-end gap-3 rounded-2xl border border-slate-200 bg-white/95 px-5 py-3.5 shadow-lg backdrop-blur">
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
          disabled={isPending || values.name.trim().length === 0}
          className="rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-violet-700 disabled:opacity-60"
        >
          {isPending ? "Saving…" : "Save changes"}
        </button>
      </div>
    </div>
  );
}
