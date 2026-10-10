import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search, ArrowDownWideNarrow } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ArticleCard } from "@/components/site/ArticleCard";
import { ArticleCardSkeleton, EmptyState, ErrorState } from "@/components/site/States";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getPublishedArticles, getCategories } from "@/lib/data";

export const Route = createFileRoute("/research/")({
  validateSearch: (search: Record<string, unknown>): { category?: string } => typeof search["category"] === "string" ? { category: search["category"] } : {},
  head: () => ({
    meta: [
      { title: "پژوهش‌ها و مقالات | ستایش رحمانی" },
      { name: "description", content: "مقالات علمی و پژوهش‌های ستایش رحمانی با امکان جستجو، فیلتر و دسته‌بندی." },
      { property: "og:title", content: "پژوهش‌ها و مقالات | ستایش رحمانی" },
      { property: "og:description", content: "مقالات علمی و پژوهش‌های ستایش رحمانی با امکان جستجو، فیلتر و دسته‌بندی." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResearchPage,
});

const PAGE_SIZE = 9;

function ResearchPage() {
  const articles = useQuery({ queryKey: ["articles", "published"], queryFn: getPublishedArticles });
  const categories = useQuery({ queryKey: ["categories"], queryFn: getCategories });

  const [search, setSearch] = useState("");
  const initialSearch = Route.useSearch();
  const [category, setCategory] = useState<string>(initialSearch.category ?? "all");
  const [sort, setSort] = useState<"newest" | "oldest" | "title">("newest");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    let list = articles.data ?? [];
    if (category !== "all") list = list.filter((a) => a.categories?.slug === category);
    const q = search.trim();
    if (q) {
      list = list.filter(
        (a) =>
          a.title.includes(q) ||
          (a.excerpt ?? "").includes(q) ||
          (a.content ?? "").includes(q),
      );
    }
    const sorted = [...list];
    if (sort === "newest") {
      sorted.sort((a, b) => (b.published_at ?? "").localeCompare(a.published_at ?? ""));
    } else if (sort === "oldest") {
      sorted.sort((a, b) => (a.published_at ?? "").localeCompare(b.published_at ?? ""));
    } else {
      sorted.sort((a, b) => a.title.localeCompare(b.title, "fa"));
    }
    return sorted;
  }, [articles.data, category, search, sort]);

  const shown = filtered.slice(0, visible);

  return (
    <SiteLayout>
      <div className="mx-auto max-w-6xl px-4 py-14">
        <h1 className="text-3xl font-extrabold text-foreground">پژوهش‌ها و مقالات</h1>
        <p className="mt-2 text-muted-foreground">
          مجموعه مقالات علمی و پژوهش‌های منتشرشده
        </p>

        {/* Filters */}
        <div className="mt-8 flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setVisible(PAGE_SIZE);
              }}
              placeholder="جستجو در مقالات…"
              className="pr-10"
              aria-label="جستجو در مقالات"
            />
          </div>
          <Select
            value={category}
            onValueChange={(v) => {
              setCategory(v);
              setVisible(PAGE_SIZE);
            }}
          >
            <SelectTrigger className="md:w-52" aria-label="دسته‌بندی">
              <SelectValue placeholder="دسته‌بندی" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه دسته‌ها</SelectItem>
              {(categories.data ?? []).map((c) => (
                <SelectItem key={c.id} value={c.slug}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
            <SelectTrigger className="md:w-44" aria-label="مرتب‌سازی">
              <ArrowDownWideNarrow className="size-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">جدیدترین</SelectItem>
              <SelectItem value="oldest">قدیمی‌ترین</SelectItem>
              <SelectItem value="title">بر اساس عنوان</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* List */}
        <div className="mt-8">
          {articles.isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <ArticleCardSkeleton key={i} />
              ))}
            </div>
          ) : articles.isError ? (
            <ErrorState onRetry={() => articles.refetch()} />
          ) : shown.length === 0 ? (
            <EmptyState
              title="مقاله‌ای یافت نشد"
              description="عبارت جستجو یا فیلتر را تغییر دهید."
            />
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {shown.map((a) => (
                  <ArticleCard key={a.id} article={a} />
                ))}
              </div>
              {filtered.length > visible && (
                <div className="mt-10 text-center">
                  <Button variant="outline" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
                    نمایش موارد بیشتر
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </SiteLayout>
  );
}
