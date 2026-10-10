import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, ArrowRight, BookOpen, Clock } from "lucide-react";
import { readingMinutes } from "@/lib/profile";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ArticleCard } from "@/components/site/ArticleCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getArticleBySlug, getRelatedArticles, formatDateFa, articleImage } from "@/lib/data";

export const Route = createFileRoute("/research/$slug")({
  loader: async ({ params }) => {
    const article = await getArticleBySlug(params.slug);
    if (!article) throw notFound();
    return article;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.title} | ستایش رحمانی` },
          { name: "description", content: loaderData.excerpt ?? loaderData.title },
          { property: "og:title", content: loaderData.title },
          { property: "og:description", content: loaderData.excerpt ?? loaderData.title },
          { property: "og:type", content: "article" },
          ...(loaderData.image_url?.startsWith("https://")
            ? [
                { property: "og:image", content: loaderData.image_url },
                { name: "twitter:image", content: loaderData.image_url },
              ]
            : []),
          { name: "twitter:card", content: "summary_large_image" },
        ]
      : [
          { title: "مقاله یافت نشد | ستایش رحمانی" },
          { name: "robots", content: "noindex" },
        ],
  }),
  component: ArticlePage,
  notFoundComponent: ArticleNotFound,
});

function ArticleNotFound() {
  return (
    <SiteLayout>
      <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
        <BookOpen className="size-12 text-muted-foreground" />
        <h1 className="mt-6 text-2xl font-bold text-foreground">مقاله یافت نشد</h1>
        <p className="mt-2 text-muted-foreground">
          مقاله‌ای با این نشانی وجود ندارد یا حذف شده است.
        </p>
        <Button asChild className="mt-6 gap-2">
          <Link to="/research">
            <ArrowRight className="size-4" />
            بازگشت به پژوهش‌ها
          </Link>
        </Button>
      </div>
    </SiteLayout>
  );
}

function ArticlePage() {
  const article = Route.useLoaderData();
  const related = useQuery({
    queryKey: ["related", article.id],
    queryFn: () => getRelatedArticles(article.category_id, article.id),
  });

  return (
    <SiteLayout>
      <article className="mx-auto max-w-3xl px-4 py-14">
        <Button asChild variant="ghost" className="gap-2 text-muted-foreground">
          <Link to="/research">
            <ArrowRight className="size-4" />
            بازگشت به پژوهش‌ها
          </Link>
        </Button>

        <header className="mt-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1 text-sm text-muted-foreground"><Clock className="size-4" />{readingMinutes(article.content).toLocaleString("fa-IR")} دقیقه مطالعه</span>
            {article.categories && <Badge>{article.categories.name}</Badge>}
            {article.published_at && (
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <CalendarDays className="size-4" />
                {formatDateFa(article.published_at)}
              </span>
            )}
          </div>
          <h1 className="mt-4 text-3xl font-extrabold leading-snug text-foreground">
            {article.title}
          </h1>
          {article.excerpt && (
            <p className="mt-4 border-r-4 border-primary pr-4 text-base leading-8 text-muted-foreground">
              {article.excerpt}
            </p>
          )}
        </header>

        {article.image_url && (
          <img
            src={articleImage(article.image_url) ?? undefined}
            alt={article.title}
            width={768}
            height={432}
            className="mt-8 aspect-video w-full rounded-2xl object-cover"
          />
        )}

        {article.content ? (
          <div className="mt-8 whitespace-pre-line text-base leading-9 text-foreground">
            {article.content}
          </div>
        ) : (
          <p className="mt-8 text-muted-foreground">متن کامل این مقاله به‌زودی منتشر می‌شود.</p>
        )}
      </article>

      {/* Related */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <h2 className="mb-6 text-xl font-bold text-foreground">مقالات مرتبط</h2>
        {related.isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        ) : (related.data ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">مقاله مرتبط دیگری وجود ندارد.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(related.data ?? []).map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
