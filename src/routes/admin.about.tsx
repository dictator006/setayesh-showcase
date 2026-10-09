import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getAbout } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/admin/about")({
  component: AdminAbout,
});

type TimelineItem = { title: string; place: string; years: string };

function AdminAbout() {
  const queryClient = useQueryClient();
  const about = useQuery({ queryKey: ["about"], queryFn: getAbout });

  const [fullName, setFullName] = useState("");
  const [tagline, setTagline] = useState("");
  const [bio, setBio] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [education, setEducation] = useState<TimelineItem[]>([]);
  const [experience, setExperience] = useState<TimelineItem[]>([]);
  const [skills, setSkills] = useState<string[]>([]);

  useEffect(() => {
    if (about.data) {
      setFullName(about.data.full_name);
      setTagline(about.data.tagline ?? "");
      setBio(about.data.bio ?? "");
      setImageUrl(about.data.image_url ?? "");
      setEducation(about.data.education);
      setExperience(about.data.experience);
      setSkills(about.data.skills);
    }
  }, [about.data]);

  const save = useMutation({
    mutationFn: async () => {
      if (!about.data) throw new Error("رکورد درباره یافت نشد");
      const { error } = await supabase
        .from("about")
        .update({
          full_name: fullName.trim(),
          tagline: tagline.trim() || null,
          bio: bio.trim() || null,
          image_url: imageUrl.trim() || null,
          education,
          experience,
          skills,
          updated_at: new Date().toISOString(),
        })
        .eq("id", about.data.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("اطلاعات ذخیره شد.");
      queryClient.invalidateQueries({ queryKey: ["about"] });
    },
    onError: (e) => toast.error(`خطا: ${e.message}`),
  });

  if (about.isLoading) {
    return <Skeleton className="h-96 w-full rounded-2xl" />;
  }

  const timelineEditor = (
    label: string,
    items: TimelineItem[],
    setItems: (v: TimelineItem[]) => void,
  ) => (
    <Card>
      <CardContent className="space-y-3 p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">{label}</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => setItems([...items, { title: "", place: "", years: "" }])}
          >
            <Plus className="size-4" />
            افزودن
          </Button>
        </div>
        {items.map((item, i) => (
          <div key={i} className="flex flex-wrap items-center gap-2 rounded-xl border border-border p-3">
            <Input
              placeholder="عنوان"
              value={item.title}
              onChange={(e) =>
                setItems(items.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))
              }
              className="min-w-32 flex-1"
            />
            <Input
              placeholder="محل"
              value={item.place}
              onChange={(e) =>
                setItems(items.map((x, j) => (j === i ? { ...x, place: e.target.value } : x)))
              }
              className="min-w-32 flex-1"
            />
            <Input
              placeholder="بازه زمانی"
              value={item.years}
              onChange={(e) =>
                setItems(items.map((x, j) => (j === i ? { ...x, years: e.target.value } : x)))
              }
              className="w-32"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="حذف"
              className="text-destructive"
              onClick={() => setItems(items.filter((_, j) => j !== i))}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">صفحه درباره من</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!fullName.trim()) {
            toast.error("نام الزامی است.");
            return;
          }
          save.mutate();
        }}
        className="mt-6 space-y-6"
      >
        <Card>
          <CardContent className="space-y-4 p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fn">نام و نام خانوادگی *</Label>
                <Input id="fn" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tg">عنوان شغلی / تخصص</Label>
                <Input id="tg" value={tagline} onChange={(e) => setTagline(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">معرفی کامل</Label>
              <Textarea id="bio" rows={5} value={bio} onChange={(e) => setBio(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="img">نشانی تصویر پروفایل</Label>
              <Input id="img" dir="ltr" className="text-left" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://…" />
            </div>
          </CardContent>
        </Card>

        {timelineEditor("سوابق تحصیلی", education, setEducation)}
        {timelineEditor("سوابق فعالیت", experience, setExperience)}

        <Card>
          <CardContent className="space-y-3 p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">مهارت‌ها</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() => setSkills([...skills, ""])}
              >
                <Plus className="size-4" />
                افزودن
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, i) => (
                <div key={i} className="flex items-center gap-1">
                  <Input
                    value={skill}
                    onChange={(e) =>
                      setSkills(skills.map((s, j) => (j === i ? e.target.value : s)))
                    }
                    className="w-36"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="حذف مهارت"
                    className="text-destructive"
                    onClick={() => setSkills(skills.filter((_, j) => j !== i))}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={save.isPending}>
          {save.isPending ? "در حال ذخیره…" : "ذخیره تغییرات"}
        </Button>
      </form>
    </div>
  );
}
