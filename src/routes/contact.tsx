import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Mail, Send, CheckCircle2 } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { getSettings, submitContactMessage } from "@/lib/data";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "تماس | ستایش رحمانی" },
      { name: "description", content: "راه‌های ارتباط با ستایش رحمانی و فرم تماس." },
      { property: "og:title", content: "تماس | ستایش رحمانی" },
      { property: "og:description", content: "راه‌های ارتباط با ستایش رحمانی و فرم تماس." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ContactPage,
});

const contactSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(3, "نام و نام خانوادگی باید حداقل ۳ حرف باشد")
    .max(100, "نام نمی‌تواند بیش از ۱۰۰ حرف باشد"),
  email: z.string().trim().email("ایمیل معتبر نیست").max(255, "ایمیل بیش از حد طولانی است"),
  message: z
    .string()
    .trim()
    .min(10, "پیام باید حداقل ۱۰ حرف باشد")
    .max(2000, "پیام نمی‌تواند بیش از ۲۰۰۰ حرف باشد"),
});

type ContactForm = z.infer<typeof contactSchema>;

function ContactPage() {
  const settings = useQuery({ queryKey: ["settings"], queryFn: getSettings });
  const [form, setForm] = useState<ContactForm>({ full_name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof ContactForm, string>>>({});
  const [sent, setSent] = useState(false);

  const mutation = useMutation({
    mutationFn: submitContactMessage,
    onSuccess: () => {
      setSent(true);
      setForm({ full_name: "", email: "", message: "" });
      toast.success("پیام شما با موفقیت ارسال شد.");
    },
    onError: () => {
      toast.error("ارسال پیام ناموفق بود. لطفاً دوباره تلاش کنید.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = contactSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ContactForm, string>> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof ContactForm;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    mutation.mutate(result.data);
  };

  const set = (key: keyof ContactForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <SiteLayout>
      <div className="mx-auto max-w-4xl px-4 py-14">
        <h1 className="text-3xl font-extrabold text-foreground">تماس با من</h1>
        <p className="mt-2 text-muted-foreground">
          برای همکاری‌های پژوهشی، آموزشی یا پرسش‌های علمی می‌توانید از طریق فرم زیر پیام بفرستید.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-5">
          <Card className="md:col-span-2">
            <CardContent className="p-6">
              <h2 className="font-bold text-foreground">اطلاعات تماس</h2>
              {settings.data?.["contact_email"] && (
                <a
                  href={`mailto:${settings.data["contact_email"]}`}
                  className="mt-4 flex items-center gap-3 rounded-xl border border-border p-4 transition-colors hover:bg-accent"
                >
                  <span className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Mail className="size-5" />
                  </span>
                  <span>
                    <span className="block text-xs text-muted-foreground">ایمیل</span>
                    <span className="text-sm font-medium text-foreground" dir="ltr">
                      {settings.data["contact_email"]}
                    </span>
                  </span>
                </a>
              )}
              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                معمولاً ظرف چند روز کاری به پیام‌ها پاسخ داده می‌شود.
              </p>
            </CardContent>
          </Card>

          <Card className="md:col-span-3">
            <CardContent className="p-6">
              {sent ? (
                <div className="flex flex-col items-center py-10 text-center">
                  <CheckCircle2 className="size-12 text-primary" />
                  <h2 className="mt-4 text-lg font-bold text-foreground">پیام شما ارسال شد</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    از تماس شما سپاسگزارم. در اولین فرصت پاسخ داده می‌شود.
                  </p>
                  <Button variant="outline" className="mt-6" onClick={() => setSent(false)}>
                    ارسال پیام جدید
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">نام و نام خانوادگی</Label>
                    <Input
                      id="full_name"
                      value={form.full_name}
                      onChange={set("full_name")}
                      aria-invalid={!!errors.full_name}
                      disabled={mutation.isPending}
                    />
                    {errors.full_name && (
                      <p className="text-xs text-destructive">{errors.full_name}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">ایمیل</Label>
                    <Input
                      id="email"
                      type="email"
                      dir="ltr"
                      className="text-left"
                      value={form.email}
                      onChange={set("email")}
                      aria-invalid={!!errors.email}
                      disabled={mutation.isPending}
                    />
                    {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">متن پیام</Label>
                    <Textarea
                      id="message"
                      rows={6}
                      value={form.message}
                      onChange={set("message")}
                      aria-invalid={!!errors.message}
                      disabled={mutation.isPending}
                    />
                    {errors.message && (
                      <p className="text-xs text-destructive">{errors.message}</p>
                    )}
                  </div>
                  <Button type="submit" className="w-full gap-2" disabled={mutation.isPending}>
                    <Send className="size-4" />
                    {mutation.isPending ? "در حال ارسال…" : "ارسال پیام"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </SiteLayout>
  );
}
