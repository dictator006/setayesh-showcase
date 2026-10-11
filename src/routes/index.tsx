import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Mail, Award, FlaskConical, UserRound, Brain, Network, Cpu, Activity, Scan, Layers } from "lucide-react";
import { ScrollReveal } from "@/components/site/ScrollReveal";
import { NeuralCanvas } from "@/components/site/NeuralCanvas";
import { FeaturedCategory } from "@/components/site/FeaturedCategory";
import { AcademicJourney } from "@/components/site/AcademicJourney";
import { buildJourney } from "@/lib/journey";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ArticleCard } from "@/components/site/ArticleCard";
import { ArticleCardSkeleton, EmptyState } from "@/components/site/States";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  getAbout,
  getCategories,
  getPublishedArticles,
  getAwards,
  getResearchActivities,
  formatDateFa,
} from "@/lib/data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ستایش رحمانی | پژوهشگر و مدرس دانشگاه" },
      {
        name: "description",
        content: "وب‌سایت شخصی، آموزشی و پژوهشی ستایش رحمانی — مقالات علمی، فعالیت‌های پژوهشی و افتخارات.",
      },
      { property: "og:title", content: "ستایش رحمانی | پژوهشگر و مدرس دانشگاه" },
      {
        property: "og:description",
        content: "وب‌سایت شخصی، آموزشی و پژوهشی ستایش رحمانی — مقالات علمی، فعالیت‌های پژوهشی و افتخارات.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const about = useQuery({ queryKey: ["about"], queryFn: getAbout });
  const articles = useQuery({ queryKey: ["articles", "published"], queryFn: getPublishedArticles });
  const awards = useQuery({ queryKey: ["awards"], queryFn: getAwards });
  const activities = useQuery({ queryKey: ["activities"], queryFn: getResearchActivities });

  const categories = useQuery({ queryKey: ["categories"], queryFn: getCategories });
  const categoryIcons = [Brain, Cpu, Network, Layers, Scan, Activity];
  const latestArticles = (articles.data ?? []).slice(0, 3);
  const milestones = buildJourney(about.data, articles.data ?? [], activities.data ?? [], awards.data ?? []);

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <NeuralCanvas />
        <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center gap-10 px-4 py-16 md:flex-row md:py-24">
          <div className="animate-fade-up flex-1 text-center md:text-right">
            <span className="inline-block rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-accent-foreground">
              {about.data?.tagline ?? "پژوهشگر و مدرس دانشگاه"}
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight text-foreground md:text-5xl">
              ستایش رحمانی
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base leading-8 text-muted-foreground md:mx-0">
              {about.data?.short_bio ? about.data.short_bio : about.data?.bio
                ? about.data.bio.slice(0, 180) + (about.data.bio.length > 180 ? "…" : "")
                : "معرفی فعالیت‌های علمی، مقالات پژوهشی و دستاوردهای آکادمیک."}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3 md:justify-start">
              <Button asChild size="lg" className="gap-2">
                <Link to="/research">
                  مشاهده پژوهش‌ها
                  <ArrowLeft className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="gap-2">
                <Link to="/contact">
                  <Mail className="size-4" />
                  تماس با من
                </Link>
              </Button>
            </div>
          </div>
          <div className="animate-fade-up shrink-0" style={{ animationDelay: "0.15s" }}>
            <div className="glass flex size-52 items-center justify-center overflow-hidden rounded-3xl shadow-xl md:size-64">
              {about.data?.image_url ? (
                <img
                  src={about.data.image_url}
                  alt="ستایش رحمانی"
                  width={256}
                  height={256}
                  className="size-full object-cover"
                />
              ) : (
                <UserRound className="size-24 text-muted-foreground" />
              )}
            </div>
          </div>
        </div>
      </section>

      <ScrollReveal><section className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="mb-6 text-2xl font-bold">حوزه‌های پژوهشی</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{(categories.data ?? []).filter(c => c.featured).sort((a,b) => a.sort_order - b.sort_order).slice(0,6).map((c,i) => <ScrollReveal key={c.id}><FeaturedCategory category={c} icon={categoryIcons[i] ?? Brain} /></ScrollReveal>)}</div>
      </section></ScrollReveal>
      {/* Latest articles */}
      <ScrollReveal><section className="mx-auto max-w-6xl px-4 py-14">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">آخرین مقالات پژوهشی</h2>
          <Button asChild variant="ghost" className="gap-1 text-primary">
            <Link to="/research">
              همه مقالات
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
        </div>
        {articles.isLoading ? (
          <div className="grid gap-6 md:grid-cols-3">
            <ArticleCardSkeleton />
            <ArticleCardSkeleton />
            <ArticleCardSkeleton />
          </div>
        ) : latestArticles.length === 0 ? (
          <EmptyState title="هنوز مقاله‌ای منتشر نشده است" />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {latestArticles.map((a) => (
              <ScrollReveal key={a.id}><ArticleCard article={a} /></ScrollReveal>
            ))}
          </div>
        )}
      </section></ScrollReveal>

      <AcademicJourney milestones={milestones} loading={about.isLoading || articles.isLoading || activities.isLoading || awards.isLoading} failed={about.isError || articles.isError || activities.isError || awards.isError} />

      {/* Research activities */}
      <ScrollReveal><section className="bg-secondary/50 py-14">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-8 flex items-center gap-2 text-2xl font-bold text-foreground">
            <FlaskConical className="size-6 text-primary" />
            فعالیت‌های پژوهشی
          </h2>
          {activities.isLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              <ArticleCardSkeleton />
              <ArticleCardSkeleton />
            </div>
          ) : (activities.data ?? []).length === 0 ? (
            <EmptyState title="فعالیتی ثبت نشده است" />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {(activities.data ?? []).slice(0, 4).map((act) => (
                <Card key={act.id} className="transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-bold text-foreground">{act.title}</h3>
                      {act.date && (
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {formatDateFa(act.date)}
                        </span>
                      )}
                    </div>
                    {act.description && (
                      <p className="mt-2 text-sm leading-7 text-muted-foreground">{act.description}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section></ScrollReveal>

      {/* Awards */}
      <ScrollReveal><section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="mb-8 flex items-center gap-2 text-2xl font-bold text-foreground">
          <Award className="size-6 text-primary" />
          افتخارات و جوایز
        </h2>
        {awards.isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            <ArticleCardSkeleton />
            <ArticleCardSkeleton />
          </div>
        ) : (awards.data ?? []).length === 0 ? (
          <EmptyState title="افتخاری ثبت نشده است" />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {(awards.data ?? []).map((award) => (
              <Card key={award.id} className="transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
                <CardContent className="flex gap-4 p-5">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                    <Award className="size-5" />
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-foreground">{award.title}</h3>
                      {award.date && (
                        <span className="text-xs text-muted-foreground">{formatDateFa(award.date)}</span>
                      )}
                    </div>
                    {award.description && (
                      <p className="mt-1 text-sm leading-7 text-muted-foreground">{award.description}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section></ScrollReveal>
    </SiteLayout>
  );
}
