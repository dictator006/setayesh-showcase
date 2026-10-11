import { useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Award, BookOpen, BriefcaseBusiness, FlaskConical, GraduationCap, Route } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "./ScrollReveal";
import { useCardEffects } from "./useCardEffects";
import { formatDateFa } from "@/lib/data";
import { journeyProgress, type JourneyMilestone } from "@/lib/journey";

const kinds = {
  education: { label: "تحصیلات", icon: GraduationCap },
  experience: { label: "سوابق حرفه‌ای", icon: BriefcaseBusiness },
  activity: { label: "فعالیت پژوهشی", icon: FlaskConical },
  award: { label: "افتخارات و جوایز", icon: Award },
  article: { label: "انتشار مقاله در سایت", icon: BookOpen },
};

function MilestoneCard({ item }: { item: JourneyMilestone }) {
  const effects = useCardEffects<HTMLDivElement>();
  const { icon: Icon, label } = kinds[item.kind];
  return <Card {...effects} className="luminous-card journey-card">
    <CardContent className="p-5 md:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-xs font-medium text-primary"><Icon className="size-4" />{label}</span>
        {(item.date || item.period) && <span className="text-xs text-muted-foreground">{item.period || formatDateFa(item.date)}</span>}
      </div>
      <h3 className="text-base font-bold leading-8 text-foreground">{item.title}</h3>
      {item.description && <p className="mt-2 line-clamp-4 text-sm leading-7 text-muted-foreground">{item.description}</p>}
      {item.slug && <Button asChild variant="link" className="mt-3 h-auto gap-2 p-0"><Link to="/research/$slug" params={{ slug: item.slug }}>مطالعه مقاله<ArrowLeft className="size-4" /></Link></Button>}
    </CardContent>
  </Card>;
}

export function AcademicJourney({ milestones, loading, failed }: { milestones: JourneyMilestone[]; loading: boolean; failed: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let visible = false;
    const nodes = Array.from(element.querySelectorAll<HTMLElement>(".journey-node"));
    const update = () => {
      frame = 0;
      const rect = element.getBoundingClientRect();
      const progress = motion.matches ? 1 : journeyProgress(rect.top, rect.height, window.innerHeight);
      element.style.setProperty("--journey-progress", String(progress));
      nodes.forEach(node => { node.dataset["lit"] = String(motion.matches || node.offsetTop <= rect.height * progress); });
    };
    const schedule = () => { if (visible && !frame && !document.hidden) frame = requestAnimationFrame(update); };
    const observer = new IntersectionObserver(([entry]) => { visible = entry?.isIntersecting ?? false; if (visible) schedule(); });
    const sizing = new ResizeObserver(schedule);
    observer.observe(element); sizing.observe(element); update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    document.addEventListener("visibilitychange", schedule);
    motion.addEventListener("change", update);
    return () => {
      cancelAnimationFrame(frame); observer.disconnect(); sizing.disconnect();
      window.removeEventListener("scroll", schedule); window.removeEventListener("resize", schedule);
      document.removeEventListener("visibilitychange", schedule); motion.removeEventListener("change", update);
    };
  }, [milestones.length, loading, failed]);

  return <section aria-labelledby="journey-heading" className="journey-section py-14 md:py-20">
    <div className="mx-auto max-w-6xl px-4">
      <ScrollReveal><div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div><span className="mb-3 flex items-center gap-2 text-sm font-medium text-primary"><Route className="size-4" />مسیر علمی</span><h2 id="journey-heading" className="text-2xl font-bold leading-relaxed md:text-3xl">مسیر علمی و نقاط عطف پژوهشی</h2></div>
        <Button asChild variant="ghost" className="gap-2 text-primary"><Link to="/about">درباره من<ArrowLeft className="size-4" /></Link></Button>
      </div></ScrollReveal>
      {loading ? <div className="space-y-6" aria-busy="true" aria-label="در حال دریافت مسیر علمی">{[0, 1, 2].map(i => <div key={i} className="h-32 animate-pulse rounded-lg bg-muted motion-reduce:animate-none" />)}</div>
        : failed ? <p className="py-8 text-center text-muted-foreground" role="status">دریافت بخشی از اطلاعات مسیر علمی ممکن نشد.</p>
        : milestones.length === 0 ? <p className="py-8 text-center text-muted-foreground">هنوز نقطه عطفی ثبت نشده است.</p>
        : <div ref={ref} className="journey-timeline">
          <div className="journey-track" aria-hidden="true"><div className="journey-beam" /></div>
          <ol className="m-0 list-none p-0">
          {milestones.map(item => <li key={item.id} className="journey-item">
            <span className="journey-node" aria-hidden="true" />
            <ScrollReveal className="journey-reveal"><MilestoneCard item={item} /></ScrollReveal>
          </li>)}
          </ol>
        </div>}
    </div>
  </section>;
}