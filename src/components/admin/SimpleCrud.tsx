import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDateFa } from "@/lib/data";
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

type Row = {
  id: string;
  title: string;
  description: string | null;
  date: string | null;
  image_url: string | null;
};

type Form = { title: string; description: string; date: string; image_url: string };

const empty: Form = { title: "", description: "", date: "", image_url: "" };

export function SimpleCrud({
  table,
  title,
  queryKey,
}: {
  table: "awards" | "research_activities";
  title: string;
  queryKey: string;
}) {
  const queryClient = useQueryClient();
  const rows = useQuery({
    queryKey: ["admin", queryKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .order("date", { ascending: false });
      if (error) throw error;
      return data as Row[];
    },
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [form, setForm] = useState<Form>(empty);
  const [deleting, setDeleting] = useState<Row | null>(null);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", queryKey] });
    queryClient.invalidateQueries({ queryKey: [queryKey] });
  };

  const save = useMutation({
    mutationFn: async (input: Form) => {
      const payload = {
        title: input.title.trim(),
        description: input.description.trim() || null,
        date: input.date || null,
        image_url: input.image_url.trim() || null,
      };
      if (editing) {
        const { error } = await supabase.from(table).update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from(table).insert(payload);
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
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("حذف شد.");
      setDeleting(null);
      invalidate();
    },
    onError: (e) => toast.error(`خطا: ${e.message}`),
  });

  const openCreate = () => {
    setEditing(null);
    setForm(empty);
    setDialogOpen(true);
  };

  const openEdit = (r: Row) => {
    setEditing(r);
    setForm({
      title: r.title,
      description: r.description ?? "",
      date: r.date ?? "",
      image_url: r.image_url ?? "",
    });
    setDialogOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="size-4" />
          مورد جدید
        </Button>
      </div>

      <div className="mt-6 space-y-3">
        {rows.isLoading ? (
          <Skeleton className="h-20 w-full rounded-xl" />
        ) : (rows.data ?? []).length === 0 ? (
          <EmptyState title="موردی ثبت نشده است" />
        ) : (
          (rows.data ?? []).map((r) => (
            <Card key={r.id}>
              <CardContent className="flex flex-wrap items-center gap-4 p-4">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-foreground">{r.title}</h3>
                  {r.date && (
                    <p className="mt-1 text-xs text-muted-foreground">{formatDateFa(r.date)}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(r)} aria-label="ویرایش">
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleting(r)}
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "ویرایش" : "مورد جدید"}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!form.title.trim()) {
                toast.error("عنوان الزامی است.");
                return;
              }
              save.mutate(form);
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="t">عنوان *</Label>
              <Input id="t" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="d">توضیحات</Label>
              <Textarea id="d" rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="dt">تاریخ</Label>
                <Input id="dt" type="date" dir="ltr" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="img">نشانی تصویر</Label>
                <Input id="img" dir="ltr" className="text-left" value={form.image_url} onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))} placeholder="https://…" />
              </div>
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
            <AlertDialogTitle>حذف</AlertDialogTitle>
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
