import { createFileRoute, Outlet, Link, useNavigate, useRouter, useRouterState, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  UserRound,
  FlaskConical,
  Award,
  Mail,
  Settings,
  LogOut,
  Menu,
  ExternalLink,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { isAdmin } from "@/lib/data";
import { ThemeToggle } from "@/components/site/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({ meta: [{ title: "پنل مدیریت | ستایش رحمانی" }, { name: "robots", content: "noindex" }] }),
  component: AdminLayout,
});

const ADMIN_NAV = [
  { to: "/admin", label: "داشبورد", icon: LayoutDashboard, exact: true },
  { to: "/admin/articles", label: "مقالات", icon: FileText },
  { to: "/admin/categories", label: "دسته‌بندی‌ها", icon: FolderOpen },
  { to: "/admin/about", label: "درباره من", icon: UserRound },
  { to: "/admin/activities", label: "فعالیت‌های پژوهشی", icon: FlaskConical },
  { to: "/admin/awards", label: "افتخارات", icon: Award },
  { to: "/admin/messages", label: "پیام‌ها", icon: Mail },
  { to: "/admin/settings", label: "تنظیمات", icon: Settings },
] as const;

function AdminLayout() {
  const navigate = useNavigate();
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [status, setStatus] = useState<"loading" | "ok">("loading");
  const [open, setOpen] = useState(false);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      const allowed = !!user && (await isAdmin(user.id));
      if (cancelled) return;
      // The pathname flips while a navigation away is still settling, so re-read
      // the live location before pushing anyone back to the login screen.
      const path = router.state.location.pathname;
      const stillInAdmin = path.startsWith("/admin") && path !== "/admin/login";
      if (!allowed) {
        if (stillInAdmin) navigate({ to: "/admin/login", replace: true });
        return;
      }
      if (stillInAdmin) setStatus("ok");
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate, router, isLoginPage]);

  if (isLoginPage) {
    return <Outlet />;
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/admin/login", replace: true });
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">در حال بررسی دسترسی…</p>
      </div>
    );
  }

  const nav = (
    <nav className="flex flex-col gap-1" aria-label="ناوبری مدیریت">
      {ADMIN_NAV.map((item) => {
        const active = "exact" in item && item.exact ? pathname === item.to : pathname.startsWith(item.to);
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar (desktop) */}
      <aside className="hidden w-64 shrink-0 flex-col border-l border-border bg-card p-4 md:flex">
        <div className="mb-6 px-2 text-lg font-bold text-foreground">پنل مدیریت</div>
        {nav}
        <div className="mt-auto space-y-1 pt-6">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent"
          >
            <ExternalLink className="size-4" />
            مشاهده سایت
          </Link>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-destructive transition-colors hover:bg-destructive/10"
          >
            <LogOut className="size-4" />
            خروج
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <div className="glass sticky top-0 z-40 flex h-14 items-center justify-between px-4 md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="منو">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle className="sr-only">منوی مدیریت</SheetTitle>
              <div className="mt-6">{nav}</div>
              <button
                onClick={handleSignOut}
                className="mt-6 flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-destructive transition-colors hover:bg-destructive/10"
              >
                <LogOut className="size-4" />
                خروج
              </button>
            </SheetContent>
          </Sheet>
          <span className="font-bold text-foreground">پنل مدیریت</span>
          <ThemeToggle />
        </div>
        <div className="hidden justify-end p-4 md:flex">
          <ThemeToggle />
        </div>

        <main className="flex-1 px-4 pb-10 md:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
