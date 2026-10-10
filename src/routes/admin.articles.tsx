import { adminHead } from "@/lib/metadata";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getCategories, formatDateFa, type Article } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/site/States";

export const Route = createFileRoute("/admin/articles")({
  head: () => adminHead("مقالات"),
  component: AdminArticles,
});

type ArticleForm = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image_url: string;
  category_id: string;
  published: boolean;
};

const emptyForm: ArticleForm = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  image_url: "",
  category_id: "",
  published: false,
};

function AdminArticles() {
  const queryClient = useQueryClient();
  const articles = useQuery({
    queryKey: ["admin", "articles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*, categories(id, name, slug)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Article[];
    },
  });
  const categories = useQuery({ queryKey: ["categories"], queryFn: getCategories });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Article | null>(null);
  const [form, setForm] = useState<ArticleForm>(emptyForm);
  const [deleting, setDeleting] = useState<Article | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin", "articles"] });

  const save = useMutation({
    mutationFn: async (input: ArticleForm) => {
      const payload = {
        title: input.title.trim(),
        slug: input.slug.trim(),
        excerpt: input.excerpt.trim() || null,
        content: input.content.trim() || null,
        image_url: input.image_url.trim() || null,
        category_id: input.category_id || null,
        published: input.published,
        published_at: input.published ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      };
      if (editing) {
        const { error } = await supabase.from("articles").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("articles").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editing ? "مقاله ویرایش شد." : "مقاله ایجاد شد.");
      setDialogOpen(false);
      invalidate();
    },
    onError: (e) => toast.error(`خطا: ${e.message}`),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("articles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("مقاله حذف شد.");
      setDeleting(null);
      invalidate();
    },
    onError: (e) => toast.error(`خطا: ${e.message}`),
  });

  const togglePublish = useMutation({
    mutationFn: async (article: Article) => {
      const { error } = await supabase
        .from("articles")
        .update({
          published: !article.published,
          published_at: !article.published ? new Date().toISOString() : null,
        })
        .eq("id", article.id);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: (e) => toast.error(`خطا: ${e.message}`),
  });

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (a: Article) => {
    setEditing(a);
    setForm({
      title: a.title,
      slug: a.slug,
      excerpt: a.excerpt ?? "",
      content: a.content ?? "",
      image_url: a.image_url ?? "",
      category_id: a.category_id ?? "",
      published: a.published,
    });
    setDialogOpen(true);
  };

  const set = (key: keyof ArticleForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.slug.trim()) {
      toast.error("عنوان و Slug الزامی است.");
      return;
    }
    save.mutate(form);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">مقالات</h1>
          <p className="mt-1 text-sm text-muted-foreground">مدیریت مقالات پژوهشی سایت</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="size-4" />
          مقاله جدید
        </Button>
      </div>

      <div className="mt-6 space-y-3">
        {articles.isLoading ? (
          <>
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </>
        ) : (articles.data ?? []).length === 0 ? (
          <EmptyState title="مقاله‌ای وجود ندارد" description="اولین مقاله را ایجاد کنید." />
        ) : (
          (articles.data ?? []).map((a) => (
            <Card key={a.id}>
              <CardContent className="flex flex-wrap items-center gap-4 p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-foreground">{a.title}</h3>
                    <Badge variant={a.published ? "default" : "secondary"}>
                      {a.published ? "منتشرشده" : "پیش‌نویس"}
                    </Badge>
                    {a.categories && <Badge variant="outline">{a.categories.name}</Badge>}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground" dir="ltr">
                    /research/{a.slug}
                    {a.published_at ? ` — ${formatDateFa(a.published_at)}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`pub-${a.id}`} className="text-xs text-muted-foreground">
                      انتشار
                    </Label>
                    <Switch
                      id={`pub-${a.id}`}
                      checked={a.published}
                      onCheckedChange={() => togglePublish.mutate(a)}
                    />
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(a)} aria-label="ویرایش">
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleting(a)}
                    aria-label="حذف"
                    className="text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create/Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "ویرایش مقاله" : "مقاله جدید"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">عنوان *</Label>
                <Input id="title" value={form.title} onChange={set("title")} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input id="slug" dir="ltr" className="text-left" value={form.slug} onChange={set("slug")} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="excerpt">خلاصه</Label>
              <Textarea id="excerpt" rows={2} value={form.excerpt} onChange={set("excerpt")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">محتوای کامل</Label>
              <Textarea id="content" rows={8} value={form.content} onChange={set("content")} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="image_url">نشانی تصویر</Label>
                <Input id="image_url" dir="ltr" className="text-left" value={form.image_url} onChange={set("image_url")} placeholder="https://…" />
              </div>
              <div className="space-y-2">
                <Label>دسته‌بندی</Label>
                <Select value={form.category_id} onValueChange={(v) => setForm((f) => ({ ...f, category_id: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="انتخاب دسته‌بندی" />
                  </SelectTrigger>
                  <SelectContent>
                    {(categories.data ?? []).map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="published"
                checked={form.published}
                onCheckedChange={(v) => setForm((f) => ({ ...f, published: v }))}
              />
              <Label htmlFor="published">انتشار مقاله</Label>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={save.isPending}>
                {save.isPending ? "در حال ذخیره…" : "ذخیره"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف مقاله</AlertDialogTitle>
            <AlertDialogDescription>
              آیا از حذف «{deleting?.title}» مطمئن هستید؟ این عمل قابل بازگشت نیست.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleting && remove.mutate(deleting.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {remove.isPending ? "در حال حذف…" : "حذف"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
