import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowRight, LogIn } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { isAdmin } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "ورود مدیر | ستایش رحمانی" },
      { name: "description", content: "ورود امن مدیر وب‌سایت ستایش رحمانی." },
      { property: "og:title", content: "ورود مدیر | ستایش رحمانی" },
      { property: "og:description", content: "ورود امن برای مدیریت محتوا." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const email = `${username.trim().toLowerCase()}@rahmani.app`;
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error("نام کاربری یا رمز عبور اشتباه است.");
        return;
      }
      if (!data.user || !(await isAdmin(data.user.id))) {
        await supabase.auth.signOut();
        toast.error("این حساب دسترسی مدیریت ندارد.");
        return;
      }
      toast.success("خوش آمدید.");
      navigate({ to: "/admin" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardContent className="p-8">
          <h1 className="text-center text-xl font-bold text-foreground">ورود به پنل مدیریت</h1>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">نام کاربری</Label>
              <Input
                id="username"
                type="text"
                dir="ltr"
                className="text-left"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">رمز عبور</Label>
              <Input
                id="password"
                type="password"
                dir="ltr"
                className="text-left"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full gap-2" disabled={loading}>
              <LogIn className="size-4" />
              {loading ? "در حال ورود…" : "ورود"}
            </Button>
          </form>

          <div className="mt-6 border-t border-border pt-4 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <ArrowRight className="size-4" />
              بازگشت به صفحه اصلی
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
