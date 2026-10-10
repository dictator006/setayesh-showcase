import { adminHead } from "@/lib/metadata";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getCategories, type Category } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { EmptyState } from "@/components/site/States";

export const Route = createFileRoute("/admin/categories")({
  head: () => adminHead("دسته‌بندی‌ها"),
  component: AdminCategories,
});

type Form = { name: string; slug: string; description: string };
const empty: Form = { name: "", slug: "", description: "" };

function AdminCategories() {
  const queryClient = useQueryClient();
  const categories = useQuery({ queryKey: ["categories"], queryFn: getCategories });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState<Form>(empty);
  const [deleting, setDeleting] = useState<Category | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["categories"] });

  const save = useMutation({
    mutationFn: async (input: Form) => {
      const payload = {
        name: input.name.trim(),
        slug: input.slug.trim(),
        description: input.description.trim() || null,
      };
      if (editing) {
        const { error } = await supabase.from("categories").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("categories").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("ذخیره شد.");
      setDialogOpen(false);
      invalidate();
    },
    onError: (e) => toast.error(`خطا: ${e.message}`),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("حذف شد.");
      setDeleting(null);
      invalidate();
    },
    onError: (e) => toast.error(`خطا: ${e.message}`),
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">دسته‌بندی‌ها</h1>
        <Button
          onClick={() => {
            setEditing(null);
            setForm(empty);
            setDialogOpen(true);
          }}
          className="gap-2"
        >
          <Plus className="size-4" />
          دسته‌بندی جدید
        </Button>
      </div>

      <div className="mt-6 space-y-3">
        {categories.isLoading ? (
          <Skeleton className="h-20 w-full rounded-xl" />
        ) : (categories.data ?? []).length === 0 ? (
          <EmptyState title="دسته‌بندی‌ای وجود ندارد" />
        ) : (
          (categories.data ?? []).map((c) => (
            <Card key={c.id}>
              <CardContent className="flex flex-wrap items-center gap-4 p-4">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-foreground">{c.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground" dir="ltr">
                    {c.slug}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="ویرایش"
                    onClick={() => {
                      setEditing(c);
                      setForm({ name: c.name, slug: c.slug, description: c.description ?? "" });
                      setDialogOpen(true);
                    }}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="حذف"
                    className="text-destructive"
                    onClick={() => setDeleting(c)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "ویرایش دسته‌بندی" : "دسته‌بندی جدید"}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!form.name.trim() || !form.slug.trim()) {
                toast.error("نام و Slug الزامی است.");
                return;
              }
              save.mutate(form);
            }}
            className="space-y-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">نام *</Label>
                <Input id="name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input id="slug" dir="ltr" className="text-left" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">توضیحات</Label>
              <Textarea id="desc" rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={save.isPending}>
                {save.isPending ? "در حال ذخیره…" : "ذخیره"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف دسته‌بندی</AlertDialogTitle>
            <AlertDialogDescription>
              آیا از حذف «{deleting?.name}» مطمئن هستید؟ مقالات این دسته بدون دسته‌بندی می‌شوند.
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
