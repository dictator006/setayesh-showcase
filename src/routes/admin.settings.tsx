import { adminHead } from "@/lib/metadata";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getSettings } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/admin/settings")({
  head: () => adminHead("تنظیمات"),
  component: AdminSettings,
});

const FIELDS = [
  { key: "site_title", label: "عنوان سایت", multiline: false },
  { key: "site_description", label: "توضیحات سایت", multiline: true },
  { key: "contact_email", label: "ایمیل تماس", multiline: false, ltr: true },
  { key: "hero_subtitle", label: "زیرعنوان صفحه اصلی", multiline: false },
] as const;

function AdminSettings() {
  const queryClient = useQueryClient();
  const settings = useQuery({ queryKey: ["settings"], queryFn: getSettings });
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (settings.data) setValues(settings.data);
  }, [settings.data]);

  const save = useMutation({
    mutationFn: async () => {
      for (const field of FIELDS) {
        const value = (values[field.key] ?? "").trim();
        const { error } = await supabase
          .from("site_settings")
          .upsert({ key: field.key, value }, { onConflict: "key" });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("تنظیمات ذخیره شد.");
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
    onError: (e) => toast.error(`خطا: ${e.message}`),
  });

  if (settings.isLoading) {
    return <Skeleton className="h-80 w-full rounded-2xl" />;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">تنظیمات سایت</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
        className="mt-6"
      >
        <Card>
          <CardContent className="space-y-4 p-5">
            {FIELDS.map((field) => (
              <div key={field.key} className="space-y-2">
                <Label htmlFor={field.key}>{field.label}</Label>
                {field.multiline ? (
                  <Textarea
                    id={field.key}
                    rows={3}
                    value={values[field.key] ?? ""}
                    onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
                  />
                ) : (
                  <Input
                    id={field.key}
                    dir={"ltr" in field && field.ltr ? "ltr" : undefined}
                    className={"ltr" in field && field.ltr ? "text-left" : undefined}
                    value={values[field.key] ?? ""}
                    onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
                  />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
        <Button type="submit" className="mt-4" disabled={save.isPending}>
          {save.isPending ? "در حال ذخیره…" : "ذخیره تنظیمات"}
        </Button>
      </form>
    </div>
  );
}
