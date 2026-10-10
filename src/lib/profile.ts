import { z } from "zod";

export const profileNetworks = [
  { key: "scholar", label: "Google Scholar" },
  { key: "researchgate", label: "ResearchGate" },
  { key: "orcid", label: "ORCID" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "github", label: "GitHub" },
  { key: "email", label: "Email" },
] as const;

export function safeProfileLink(key: string, value: string): string | null {
  if (key === "email") return z.string().email().max(255).safeParse(value).success ? `mailto:${encodeURIComponent(value)}` : null;
  const parsed = z.string().url().max(500).safeParse(value);
  if (!parsed.success) return null;
  const url = new URL(parsed.data);
  return url.protocol === "https:" ? url.href : null;
}

export function readingMinutes(content: string | null): number {
  return Math.max(1, Math.ceil((content?.trim().split(/\s+/).filter(Boolean).length ?? 0) / 200));
}

export function validateProfileImage(file: Pick<File, "type" | "size">): string | null {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return "تصویر باید JPG، PNG یا WebP باشد.";
  if (file.size > 5 * 1024 * 1024) return "حجم تصویر نباید بیشتر از ۵ مگابایت باشد.";
  return null;
}