import { adminHead } from "@/lib/metadata";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { FileText, FolderOpen, Mail, FlaskConical, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toFaDigits } from "@/lib/data";

export const Route = createFileRoute("/admin/")({
  head: () => adminHead("داشبورد"),
  component: AdminDashboard,
});

async function getCounts() {
  const [articles, categories, messages, activities, awards, unread] = await Promise.all([
    supabase.from("articles").select("id", { count: "exact", head: true }),
    supabase.from("categories").select("id", { count: "exact", head: true }),
    supabase.from("contact_messages").select("id", { count: "exact", head: true }),
    supabase.from("research_activities").select("id", { count: "exact", head: true }),
    supabase.from("awards").select("id", { count: "exact", head: true }),
    supabase.from("contact_messages").select("id", { count: "exact", head: true }).eq("is_read", false),
  ]);
  return {
    articles: articles.count ?? 0,
    categories: categories.count ?? 0,
    messages: messages.count ?? 0,
    activities: activities.count ?? 0,
    awards: awards.count ?? 0,
    unread: unread.count ?? 0,
  };
}

function AdminDashboard() {
  const counts = useQuery({ queryKey: ["admin", "counts"], queryFn: getCounts });

  const items = [
    { label: "مقالات", value: counts.data?.articles, icon: FileText },
    { label: "دسته‌بندی‌ها", value: counts.data?.categories, icon: FolderOpen },
    { label: "پیام‌ها", value: counts.data?.messages, icon: Mail },
    { label: "پیام‌های خوانده‌نشده", value: counts.data?.unread, icon: Mail },
    { label: "فعالیت‌های پژوهشی", value: counts.data?.activities, icon: FlaskConical },
    { label: "افتخارات", value: counts.data?.awards, icon: Award },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">داشبورد</h1>
      <p className="mt-1 text-sm text-muted-foreground">نمای کلی آمار سایت</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Card key={item.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <span className="flex size-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <item.icon className="size-5" />
              </span>
              <div>
                <p className="text-sm text-muted-foreground">{item.label}</p>
                {counts.isLoading ? (
                  <Skeleton className="mt-1 h-7 w-12" />
                ) : (
                  <p className="text-2xl font-bold text-foreground">{toFaDigits(item.value ?? 0)}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
