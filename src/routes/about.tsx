import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { GraduationCap, Briefcase, Sparkles, UserRound, Award, FlaskConical } from "lucide-react";
import { ProfileLinks } from "@/components/site/ProfileLinks";
import { SiteLayout } from "@/components/site/SiteLayout";
import { EmptyState, ErrorState } from "@/components/site/States";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getAbout, getAwards, getResearchActivities, formatDateFa, getPublishedArticles, toFaDigits } from "@/lib/data";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "درباره من | ستایش رحمانی" },
      { name: "description", content: "معرفی کامل، سوابق تحصیلی، مهارت‌ها و فعالیت‌های پژوهشی ستایش رحمانی." },
      { property: "og:title", content: "درباره من | ستایش رحمانی" },
      { property: "og:description", content: "معرفی کامل، سوابق تحصیلی، مهارت‌ها و فعالیت‌های پژوهشی ستایش رحمانی." },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const about = useQuery({ queryKey: ["about"], queryFn: getAbout });
  const awards = useQuery({ queryKey: ["awards"], queryFn: getAwards });
  const activities = useQuery({ queryKey: ["activities"], queryFn: getResearchActivities });

  const articles = useQuery({ queryKey: ["articles", "published"], queryFn: getPublishedArticles });

  return (
    <SiteLayout>
      <div className="mx-auto max-w-4xl px-4 py-14">
        <h1 className="text-3xl font-extrabold text-foreground">درباره من</h1>

        {about.isLoading ? (
          <div className="mt-8 space-y-4">
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
          </div>
        ) : about.isError ? (
          <div className="mt-8">
            <ErrorState onRetry={() => about.refetch()} />
          </div>
        ) : about.data ? (
          <>
            <section className="mt-8 overflow-hidden border-b border-border">
              <CardContent className="flex flex-col items-center gap-6 p-8 md:flex-row md:items-start">
                <div className="flex size-36 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
                  {about.data.image_url ? (
                    <img
                      src={about.data.image_url}
                      alt={about.data.full_name}
                      width={144}
                      height={144}
                      className="size-full object-cover"
                    />
                  ) : (
                    <UserRound className="size-16 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{about.data.full_name}</h2>
                  {about.data.tagline && (
                    <p className="mt-1 font-medium text-primary">{about.data.tagline}</p>
                  )}
                  {about.data.bio && (
                    <p className="mt-4 text-sm leading-8 text-muted-foreground">{about.data.bio}</p>
                  )}
                </div>
              </CardContent>
            </section>
            <div className="mt-6"><ProfileLinks links={about.data.social_links} /></div>
            <dl className="mt-8 grid grid-cols-3 gap-4 border-y border-border py-6">{[["مقاله", articles.data?.length ?? 0], ["فعالیت پژوهشی", activities.data?.length ?? 0], ["افتخار", awards.data?.length ?? 0]].map(([label,value]) => <div key={label} className="text-center"><dd className="text-3xl font-bold text-primary">{toFaDigits(value ?? 0)}</dd><dt className="mt-2 text-sm text-muted-foreground">{label}</dt></div>)}</dl>

            {/* Education */}
            {about.data.education.length > 0 && (
              <section className="mt-10">
                <h2 className="mb-5 flex items-center gap-2 text-xl font-bold text-foreground">
                  <GraduationCap className="size-5 text-primary" />
                  سوابق تحصیلی
                </h2>
                <div className="profile-timeline space-y-3">
                  {about.data.education.map((edu, i) => (
                    <Card key={i}>
                      <CardContent className="flex flex-wrap items-center justify-between gap-2 p-5">
                        <div>
                          <h3 className="font-semibold text-foreground">{edu.title}</h3>
                          <p className="text-sm text-muted-foreground">{edu.place}</p>
                        </div>
                        <Badge variant="secondary">{edu.years}</Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Experience */}
            {about.data.experience.length > 0 && (
              <section className="mt-10">
                <h2 className="mb-5 flex items-center gap-2 text-xl font-bold text-foreground">
                  <Briefcase className="size-5 text-primary" />
                  سوابق فعالیت
                </h2>
                <div className="profile-timeline space-y-3">
                  {about.data.experience.map((exp, i) => (
                    <Card key={i}>
                      <CardContent className="flex flex-wrap items-center justify-between gap-2 p-5">
                        <div>
                          <h3 className="font-semibold text-foreground">{exp.title}</h3>
                          <p className="text-sm text-muted-foreground">{exp.place}</p>
                        </div>
                        <Badge variant="secondary">{exp.years}</Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Skills */}
            {about.data.skills.length > 0 && (
              <section className="mt-10">
                <h2 className="mb-5 flex items-center gap-2 text-xl font-bold text-foreground">
                  <Sparkles className="size-5 text-primary" />
                  مهارت‌ها
                </h2>
                <div className="flex flex-wrap gap-2">
                  {about.data.skills.map((skill) => (
                    <Badge key={skill} variant="outline" className="px-4 py-1.5 text-sm">
                      {skill}{about.data?.skill_levels[skill] && <span className="mr-2 text-primary">· {about.data.skill_levels[skill]}</span>}
                    </Badge>
                  ))}
                </div>
              </section>
            )}
          </>
        ) : (
          <div className="mt-8">
            <EmptyState title="اطلاعاتی ثبت نشده است" />
          </div>
        )}

        {/* Research activities */}
        <section className="mt-10">
          <h2 className="mb-5 flex items-center gap-2 text-xl font-bold text-foreground">
            <FlaskConical className="size-5 text-primary" />
            فعالیت‌های پژوهشی
          </h2>
          {activities.isLoading ? (
            <Skeleton className="h-32 w-full rounded-2xl" />
          ) : (activities.data ?? []).length === 0 ? (
            <EmptyState title="فعالیتی ثبت نشده است" />
          ) : (
            <div className="space-y-3">
              {(activities.data ?? []).map((act) => (
                <Card key={act.id}>
                  <CardContent className="p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-semibold text-foreground">{act.title}</h3>
                      {act.date && (
                        <span className="text-xs text-muted-foreground">{formatDateFa(act.date)}</span>
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
        </section>

        {/* Awards */}
        <section className="mt-10">
          <h2 className="mb-5 flex items-center gap-2 text-xl font-bold text-foreground">
            <Award className="size-5 text-primary" />
            افتخارات
          </h2>
          {awards.isLoading ? (
            <Skeleton className="h-32 w-full rounded-2xl" />
          ) : (awards.data ?? []).length === 0 ? (
            <EmptyState title="افتخاری ثبت نشده است" />
          ) : (
            <div className="space-y-3">
              {(awards.data ?? []).map((award) => (
                <Card key={award.id}>
                  <CardContent className="p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-semibold text-foreground">{award.title}</h3>
                      {award.date && (
                        <span className="text-xs text-muted-foreground">{formatDateFa(award.date)}</span>
                      )}
                    </div>
                    {award.description && (
                      <p className="mt-2 text-sm leading-7 text-muted-foreground">{award.description}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </SiteLayout>
  );
}
