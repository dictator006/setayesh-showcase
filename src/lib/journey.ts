import type { About, Article, Award, ResearchActivity } from "./data";

export type JourneyMilestone = {
  id: string;
  kind: "education" | "experience" | "activity" | "award" | "article";
  title: string;
  description: string | null;
  date: string | null;
  period?: string;
  slug?: string;
};

function chronologicalKey(item: JourneyMilestone) {
  if (item.date) {
    const value = Date.parse(item.date);
    if (Number.isFinite(value)) return value;
  }
  const normalized = (item.period ?? "").replace(/[۰-۹]/g, d => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)));
  const match = normalized.match(/\d{4}/);
  if (!match) return Number.POSITIVE_INFINITY;
  const year = Number(match[0]);
  return Date.UTC(year < 1700 ? year + 621 : year, 0, 1);
}

/** Publications are site publications, never implied to be the owner's authored papers. */
export function buildJourney(about: About | null | undefined, articles: Article[], activities: ResearchActivity[], awards: Award[]): JourneyMilestone[] {
  const entries: JourneyMilestone[] = [
    ...(about?.education ?? []).map((e, i) => ({ id: `education-${i}`, kind: "education" as const, title: e.title, description: e.place, date: null, period: e.years })),
    ...(about?.experience ?? []).map((e, i) => ({ id: `experience-${i}`, kind: "experience" as const, title: e.title, description: e.place, date: null, period: e.years })),
    ...activities.map(e => ({ id: `activity-${e.id}`, kind: "activity" as const, title: e.title, description: e.description, date: e.date })),
    ...awards.map(e => ({ id: `award-${e.id}`, kind: "award" as const, title: e.title, description: e.description, date: e.date })),
    ...articles.filter(e => e.published).slice(0, 3).map(e => ({ id: `article-${e.id}`, kind: "article" as const, title: e.title, description: e.excerpt, date: e.published_at, slug: e.slug })),
  ];
  return entries.filter(e => e.title.trim()).sort((a, b) => chronologicalKey(a) - chronologicalKey(b));
}

export function journeyProgress(top: number, height: number, viewportHeight: number) {
  if (height <= 0) return 0;
  return Math.max(0, Math.min(1, (viewportHeight * .65 - top) / height));
}