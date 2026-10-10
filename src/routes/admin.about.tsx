import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, UserRound, GraduationCap, Briefcase, Sparkles, Award, FlaskConical, Upload, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getAbout } from "@/lib/data";
import { profileNetworks, safeProfileLink, validateProfileImage } from "@/lib/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SimpleCrud } from "@/components/admin/SimpleCrud";
import { ErrorState } from "@/components/site/States";

export const Route = createFileRoute("/admin/about")({
  head: () => ({ meta: [{ title: "مدیریت درباره من | ستایش رحمانی" }, { name: "description", content: "مدیریت معرفی، تحصیلات و سوابق ستایش رحمانی." }, { property: "og:title", content: "مدیریت درباره من | ستایش رحمانی" }, { property: "og:description", content: "مدیریت اطلاعات و سوابق علمی." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" }] }),
  component: AdminAbout,
});

type TimelineItem = { title: string; place: string; years: string };
const tabItems = [ ["main", "اطلاعات اصلی", UserRound], ["education", "تحصیلات", GraduationCap], ["experience", "سوابق کاری", Briefcase], ["skills", "مهارت‌ها", Sparkles], ["awards", "افتخارات", Award], ["activities", "فعالیت‌های پژوهشی", FlaskConical] ] as const;

function AdminAbout() {
  const queryClient = useQueryClient();
  const about = useQuery({ queryKey: ["about"], queryFn: getAbout });
  const [fullName, setFullName] = useState("");
  const [tagline, setTagline] = useState("");
  const [bio, setBio] = useState("");
  const [shortBio, setShortBio] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [preview, setPreview] = useState("");
  const [links, setLinks] = useState<Record<string, string>>({});
  const [levels, setLevels] = useState<Record<string, string>>({});
  const [education, setEducation] = useState<TimelineItem[]>([]);
  const [experience, setExperience] = useState<TimelineItem[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!about.data) return;
    const a = about.data;
    setFullName(a.full_name); setTagline(a.tagline ?? ""); setBio(a.bio ?? ""); setShortBio(a.short_bio ?? "");
    setImageUrl(a.image_path ?? a.image_url ?? ""); setPreview(a.image_url ?? "");
    setEducation(a.education); setExperience(a.experience); setSkills(a.skills); setLinks(a.social_links); setLevels(a.skill_levels);
  }, [about.data]);
  const save = useMutation({
    mutationFn: async () => {
      if (!about.data) throw new Error("اطلاعات یافت نشد");
      if (!fullName.trim()) throw new Error("نام الزامی است");
      for (const { key } of profileNetworks) if (links[key]?.trim() && !safeProfileLink(key, links[key].trim())) throw new Error("ایمیل یا لینک معتبر HTTPS وارد کنید.");
      const { error } = await supabase.from("about").update({ full_name: fullName.trim(), tagline: tagline.trim() || null, bio: bio.trim() || null, short_bio: shortBio.trim() || null, image_url: imageUrl || null, education, experience, skills: skills.filter(s => s.trim()), social_links: links, skill_levels: levels, updated_at: new Date().toISOString() }).eq("id", about.data.id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("اطلاعات ذخیره شد."); queryClient.invalidateQueries({ queryKey: ["about"] }); },
    onError: e => toast.error(e.message),
  });
  const upload = async (file: File | undefined) => {
    if (!file) return;
    const invalid = validateProfileImage(file);
    if (invalid) { toast.error(invalid); return; }
    setUploading(true);
    try {
      const ext = file.type === "image/jpeg" ? "jpg" : file.type === "image/png" ? "png" : "webp";
      const path = `profile/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("profile-images").upload(path, file, { contentType: file.type });
      if (error) throw error;
      const { data, error: signError } = await supabase.storage.from("profile-images").createSignedUrl(path, 3600);
      if (signError) throw signError;
      setImageUrl(`storage:${path}`); setPreview(data.signedUrl); toast.success("تصویر آماده است؛ تغییرات را ذخیره کنید.");
    } catch { toast.error("آپلود تصویر ناموفق بود."); } finally { setUploading(false); if (fileRef.current) fileRef.current.value = ""; }
  };
  if (about.isLoading) return <Skeleton className="h-96 w-full" />;
  if (about.isError) return <ErrorState onRetry={() => about.refetch()} />;
  const timelineEditor = (label: string, items: TimelineItem[], setItems: (items: TimelineItem[]) => void) => <div className="profile-editor-panel space-y-4">
    <div className="flex items-center justify-between"><h2 className="text-xl font-bold">{label}</h2><Button type="button" variant="outline" onClick={() => setItems([...items, { title: "", place: "", years: "" }])}><Plus className="size-4" />افزودن</Button></div>
    {items.map((item, i) => <div key={i} className="grid gap-3 border-b border-border py-4 sm:grid-cols-[1fr_1fr_160px_40px]">{(["title", "place", "years"] as const).map((key, j) => <div key={key} className="space-y-2"><Label htmlFor={`${label}-${key}-${i}`}>{["عنوان", "محل", "بازه زمانی"][j]}</Label><Input id={`${label}-${key}-${i}`} maxLength={200} value={item[key]} onChange={e => setItems(items.map((x, n) => n === i ? { ...x, [key]: e.target.value } : x))} /></div>)}<Button type="button" variant="ghost" size="icon" aria-label="حذف سابقه" className="self-end text-destructive" onClick={() => setItems(items.filter((_, n) => n !== i))}><Trash2 className="size-4" /></Button></div>)}
  </div>;
  return <div className="space-y-7">
    <header className="flex items-center gap-4 border-t border-border pt-5"><span className="flex size-14 items-center justify-center rounded-lg bg-accent text-primary"><UserRound className="size-7" /></span><div><h1 className="text-3xl font-bold">درباره من</h1><p className="mt-1 text-muted-foreground">مدیریت اطلاعات شخصی، تحصیلات و سوابق</p></div></header>
    <Tabs defaultValue="main" dir="rtl">
      <div className="profile-editor-tabs overflow-x-auto"><TabsList className="h-auto min-w-full justify-start gap-1 p-2">{tabItems.map(([value,label,Icon]) => <TabsTrigger key={value} value={value} className="gap-2 px-5 py-3 text-base"><Icon className="size-5" />{label}</TabsTrigger>)}</TabsList></div>
      <TabsContent value="main" className="mt-6"><div className="profile-editor-panel space-y-7">
        <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center"><div className="flex size-32 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-border bg-muted">{preview ? <img src={preview} alt="عکس پروفایل" width={128} height={128} className="size-full object-cover" /> : <UserRound className="size-12 text-muted-foreground" />}</div><div><h2 className="mb-3 text-xl font-bold">عکس پروفایل</h2><input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e => void upload(e.target.files?.[0])} aria-label="فایل عکس پروفایل" /><Button type="button" variant="outline" disabled={uploading} onClick={() => fileRef.current?.click()}><Upload className="size-4" />{uploading ? "در حال آپلود…" : "انتخاب تصویر"}</Button></div></div>
        <div className="grid gap-5 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="fn">نام و نام خانوادگی</Label><Input id="fn" maxLength={100} value={fullName} onChange={e => setFullName(e.target.value)} /></div><div className="space-y-2"><Label htmlFor="tg">عنوان تخصصی</Label><Input id="tg" maxLength={200} value={tagline} onChange={e => setTagline(e.target.value)} /></div></div>
        <div className="space-y-2"><Label htmlFor="short">معرفی کوتاه</Label><Textarea id="short" maxLength={500} rows={2} value={shortBio} onChange={e => setShortBio(e.target.value)} /></div>
        <div className="space-y-2"><Label htmlFor="bio">بیوگرافی و معرفی کامل</Label><Textarea id="bio" maxLength={10000} rows={6} value={bio} onChange={e => setBio(e.target.value)} /></div>
        <h2 className="text-lg font-bold">پروفایل‌های علمی و شبکه‌های اجتماعی</h2><div className="grid gap-4 sm:grid-cols-2">{profileNetworks.map(({key,label}) => <div key={key} className="space-y-2"><Label htmlFor={`link-${key}`}>{label}</Label><Input id={`link-${key}`} dir="ltr" maxLength={500} value={links[key] ?? ""} onChange={e => setLinks({...links, [key]: e.target.value})} /></div>)}</div>
      </div></TabsContent>
      <TabsContent value="education" className="mt-6">{timelineEditor("سوابق تحصیلی", education, setEducation)}</TabsContent>
      <TabsContent value="experience" className="mt-6">{timelineEditor("سوابق کاری", experience, setExperience)}</TabsContent>
      <TabsContent value="skills" className="mt-6"><div className="profile-editor-panel space-y-4"><div className="flex justify-between"><h2 className="text-xl font-bold">مهارت‌ها</h2><Button variant="outline" onClick={() => setSkills([...skills, ""])}><Plus className="size-4" />افزودن</Button></div>{skills.map((skill,i) => <div key={i} className="grid gap-3 border-b border-border py-3 sm:grid-cols-[1fr_1fr_40px]"><div className="space-y-2"><Label htmlFor={`skill-${i}`}>مهارت</Label><Input id={`skill-${i}`} value={skill} maxLength={100} onChange={e => { const name = e.target.value; setSkills(skills.map((s,j) => j === i ? name : s)); const next = {...levels}; if (next[skill]) { next[name] = next[skill]; delete next[skill]; } setLevels(next); }} /></div><div className="space-y-2"><Label htmlFor={`level-${i}`}>سطح مهارت</Label><Input id={`level-${i}`} value={levels[skill] ?? ""} maxLength={50} placeholder="مثلاً پیشرفته" onChange={e => setLevels({...levels, [skill]: e.target.value})} /></div><Button variant="ghost" size="icon" aria-label="حذف مهارت" className="self-end text-destructive" onClick={() => setSkills(skills.filter((_,j) => i !== j))}><Trash2 className="size-4" /></Button></div>)}</div></TabsContent>
      <TabsContent value="awards" className="mt-6"><SimpleCrud table="awards" title="افتخارات" queryKey="awards" /></TabsContent>
      <TabsContent value="activities" className="mt-6"><SimpleCrud table="research_activities" title="فعالیت‌های پژوهشی" queryKey="activities" /></TabsContent>
      <div className="mt-6"><Button disabled={save.isPending || uploading} onClick={() => save.mutate()}><Save className="size-4" />{save.isPending ? "در حال ذخیره…" : "ذخیره تغییرات"}</Button></div>
    </Tabs>
  </div>;
}
