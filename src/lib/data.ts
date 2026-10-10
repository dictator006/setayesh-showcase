import { contactSchema } from "@/lib/contact-schema";
import { supabase } from "@/integrations/supabase/client";
import brainImage from "@/assets/neuroscience.jpg";
import learningImage from "@/assets/deep-learning.jpg";
import computationalImage from "@/assets/computational.jpg";

export function articleImage(value: string | null): string | null {
  const assets: Record<string, string> = { "asset:neuroscience": brainImage, "asset:deep-learning": learningImage, "asset:computational": computationalImage };
  return value ? assets[value] ?? value : null;
}

export type Category = {
  featured: boolean;
  sort_order: number;
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
};

export type Article = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  image_url: string | null;
  category_id: string | null;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  categories?: Pick<Category, "id" | "name" | "slug"> | null;
};

export type Award = {
  id: string;
  title: string;
  description: string | null;
  date: string | null;
  image_url: string | null;
  created_at: string;
};

export type ResearchActivity = {
  id: string;
  title: string;
  description: string | null;
  date: string | null;
  image_url: string | null;
  created_at: string;
};

export type ContactMessage = {
  kind: string;
  rating: number | null;
  id: string;
  full_name: string;
  email: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

export type About = {
  short_bio: string | null;
  social_links: Record<string, string>;
  skill_levels: Record<string, string>;
  image_path?: string | null;
  id: string;
  full_name: string;
  tagline: string | null;
  bio: string | null;
  image_url: string | null;
  education: { title: string; place: string; years: string }[];
  skills: string[];
  experience: { title: string; place: string; years: string }[];
  created_at: string;
  updated_at: string;
};

export async function getAbout(): Promise<About | null> {
  const { data, error } = await supabase.from("about").select("*").limit(1).maybeSingle();
  if (error) throw error;
  const about = data as About | null;
  if (about?.image_url?.startsWith("storage:")) {
    const path = about.image_url.slice(8);
    const { data: signed, error: imageError } = await supabase.storage.from("profile-images").createSignedUrl(path, 3600);
    if (imageError) throw imageError;
    return { ...about, image_path: about.image_url, image_url: signed.signedUrl };
  }
  return about;
}

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from("categories").select("*").order("name");
  if (error) throw error;
  return data as Category[];
}

export async function getPublishedArticles(): Promise<Article[]> {
  const { data, error } = await supabase
    .from("articles")
    .select("*, categories(id, name, slug)")
    .eq("published", true)
    .order("published_at", { ascending: false });
  if (error) throw error;
  return data as Article[];
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const { data, error } = await supabase
    .from("articles")
    .select("*, categories(id, name, slug)")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (error) throw error;
  return data as Article | null;
}

export async function getRelatedArticles(categoryId: string | null, excludeId: string): Promise<Article[]> {
  let query = supabase
    .from("articles")
    .select("*, categories(id, name, slug)")
    .eq("published", true)
    .neq("id", excludeId)
    .order("published_at", { ascending: false })
    .limit(3);
  if (categoryId) query = query.eq("category_id", categoryId);
  const { data, error } = await query;
  if (error) throw error;
  return data as Article[];
}

export async function getAwards(): Promise<Award[]> {
  const { data, error } = await supabase.from("awards").select("*").order("date", { ascending: false });
  if (error) throw error;
  return data as Award[];
}

export async function getResearchActivities(): Promise<ResearchActivity[]> {
  const { data, error } = await supabase
    .from("research_activities")
    .select("*")
    .order("date", { ascending: false });
  if (error) throw error;
  return data as ResearchActivity[];
}

export async function getSettings(): Promise<Record<string, string>> {
  const { data, error } = await supabase.from("site_settings").select("key, value");
  if (error) throw error;
  const map: Record<string, string> = {};
  for (const row of data ?? []) {
    if (row.value != null) map[row.key] = row.value;
  }
  return map;
}

export async function submitContactMessage(input: {
  full_name: string;
  email: string;
  message: string;
  kind?: "contact" | "feedback";
  rating?: number | null;
}): Promise<void> {
  const { error } = await supabase.from("contact_messages").insert(contactSchema.parse(input));
  if (error) throw error;
}

export async function isAdmin(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("user_roles")
    .select("id")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) return false;
  return data != null;
}

const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

export function toFaDigits(value: string | number): string {
  return String(value).replace(/[0-9]/g, (d) => FA_DIGITS[Number(d)] ?? d);
}

export function formatDateFa(iso: string | null | undefined): string {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat("fa-IR", { dateStyle: "long" }).format(new Date(iso));
  } catch {
    return iso;
  }
}
