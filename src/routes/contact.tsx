import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Mail, Send, CheckCircle2, MessageSquare, Star } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ProfileLinks } from "@/components/site/ProfileLinks";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { getSettings, getAbout, submitContactMessage } from "@/lib/data";
import { safeProfileLink } from "@/lib/profile";
import { contactSchema } from "@/lib/contact-schema";
export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "تماس و بازخورد | ستایش رحمانی" }, { name: "description", content: "ارتباط علمی با ستایش رحمانی، ارسال پیام و بازخورد." }, { property: "og:title", content: "تماس و بازخورد | ستایش رحمانی" }, { property: "og:description", content: "راه‌های ارتباط علمی، فرم تماس و بازخورد." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }), component: ContactPage,
});
type ContactForm = z.infer<typeof contactSchema>;
function MessageForm({ kind }: { kind: "contact" | "feedback" }) {
  const [form, setForm] = useState<ContactForm>({ full_name: "", email: "", message: "", kind, rating: null });
  const [errors, setErrors] = useState<Record<string,string>>({});
  const [sent, setSent] = useState(false);
  const mutation = useMutation({ mutationFn: submitContactMessage, onSuccess: () => { setSent(true); setForm({ full_name: "", email: "", message: "", kind, rating: null }); toast.success("پیام شما ارسال شد."); }, onError: () => toast.error("ارسال ناموفق بود؛ دوباره تلاش کنید.") });
  if (sent) return <div className="py-12 text-center" role="status"><CheckCircle2 className="mx-auto size-12 text-primary" /><h2 className="mt-4 text-xl font-bold">{kind === "feedback" ? "بازخورد شما ثبت شد" : "پیام شما ارسال شد"}</h2><Button className="mt-6" variant="outline" onClick={() => setSent(false)}>ارسال پیام جدید</Button></div>;
  return <form noValidate className="space-y-5" onSubmit={e => { e.preventDefault(); if (mutation.isPending) return; const parsed = contactSchema.safeParse(form); if (!parsed.success) { const next: Record<string,string> = {}; parsed.error.issues.forEach(issue => { const key = String(issue.path[0]); next[key] ??= issue.message; }); setErrors(next); return; } setErrors({}); mutation.mutate(parsed.data); }}>
    {(["full_name", "email"] as const).map(key => <div key={key} className="space-y-2"><Label htmlFor={`${kind}-${key}`}>{key === "email" ? "ایمیل" : "نام و نام خانوادگی"}</Label><Input id={`${kind}-${key}`} type={key === "email" ? "email" : "text"} dir={key === "email" ? "ltr" : "rtl"} maxLength={key === "email" ? 255 : 100} autoComplete={key === "email" ? "email" : "name"} value={form[key]} onChange={e => setForm({...form, [key]: e.target.value})} disabled={mutation.isPending} aria-invalid={Boolean(errors[key])} aria-describedby={errors[key] ? `${kind}-${key}-error` : undefined} />{errors[key] && <p id={`${kind}-${key}-error`} className="text-sm text-destructive">{errors[key]}</p>}</div>)}
    {kind === "feedback" && <fieldset><legend className="mb-2 text-sm font-medium">امتیاز شما (اختیاری)</legend><div className="flex gap-2" dir="ltr">{[1,2,3,4,5].map(rating => <Button key={rating} type="button" variant={form.rating === rating ? "default" : "outline"} size="icon" aria-label={`${rating} ستاره`} aria-pressed={form.rating === rating} onClick={() => setForm({...form, rating})}><Star className="size-5" /></Button>)}</div></fieldset>}
    <div className="space-y-2"><Label htmlFor={`${kind}-message`}>{kind === "feedback" ? "متن بازخورد" : "متن پیام"}</Label><Textarea id={`${kind}-message`} rows={6} maxLength={2000} value={form.message} disabled={mutation.isPending} onChange={e => setForm({...form, message: e.target.value})} aria-invalid={Boolean(errors["message"])} />{errors["message"] && <p className="text-sm text-destructive">{errors["message"]}</p>}</div>
    <Button type="submit" disabled={mutation.isPending} className="w-full"><Send className="size-4" />{mutation.isPending ? "در حال ارسال…" : kind === "feedback" ? "ثبت بازخورد" : "ارسال پیام"}</Button>
  </form>;
}
function ContactPage() {
  const about = useQuery({ queryKey: ["about"], queryFn: getAbout });
  const settings = useQuery({ queryKey: ["settings"], queryFn: getSettings });
  const links = { ...about.data?.social_links };
  const email = links["email"] || settings.data?.["contact_email"];
  if (email && !email.endsWith("@example.com")) links["email"] = email;
  const emailHref = safeProfileLink("email", links["email"] ?? "");
  return <SiteLayout><div className="mx-auto max-w-5xl px-4 py-14"><h1 className="text-3xl font-extrabold">تماس با من</h1><p className="mt-3 text-muted-foreground">همکاری علمی، گفت‌وگو و پیشنهادهای شما</p><div className="mt-10 grid gap-10 md:grid-cols-5"><aside className="space-y-6 md:col-span-2"><h2 className="text-xl font-bold">راه‌های ارتباطی</h2>{emailHref && <a href={emailHref} className="flex items-start gap-3 text-primary"><Mail className="mt-1 size-5 shrink-0" /><span dir="ltr" className="break-all">{links["email"]}</span></a>}<ProfileLinks links={links} /></aside><div className="md:col-span-3"><Tabs defaultValue="contact" dir="rtl"><TabsList className="mb-6 h-12 w-full"><TabsTrigger value="contact" className="flex-1 gap-2 py-2"><Mail className="size-4" />تماس</TabsTrigger><TabsTrigger value="feedback" className="flex-1 gap-2 py-2"><MessageSquare className="size-4" />بازخورد</TabsTrigger></TabsList><TabsContent value="contact"><MessageForm kind="contact" /></TabsContent><TabsContent value="feedback"><MessageForm kind="feedback" /></TabsContent></Tabs></div></div></div></SiteLayout>;
}
