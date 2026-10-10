import { adminHead } from "@/lib/metadata";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2, MailOpen, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDateFa, type ContactMessage } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
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
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/messages")({
  head: () => adminHead("پیام‌ها"),
  component: AdminMessages,
});

function AdminMessages() {
  const queryClient = useQueryClient();
  const [deleting, setDeleting] = useState<ContactMessage | null>(null);

  const messages = useQuery({
    queryKey: ["admin", "messages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ContactMessage[];
    },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "messages"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "counts"] });
  };

  const toggleRead = useMutation({
    mutationFn: async (m: ContactMessage) => {
      const { error } = await supabase
        .from("contact_messages")
        .update({ is_read: !m.is_read })
        .eq("id", m.id);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: (e) => toast.error(`خطا: ${e.message}`),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("contact_messages").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("پیام حذف شد.");
      setDeleting(null);
      invalidate();
    },
    onError: (e) => toast.error(`خطا: ${e.message}`),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">پیام‌ها</h1>
      <p className="mt-1 text-sm text-muted-foreground">پیام‌های ارسال‌شده از فرم تماس</p>

      <div className="mt-6 space-y-3">
        {messages.isLoading ? (
          <>
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </>
        ) : (messages.data ?? []).length === 0 ? (
          <EmptyState title="پیامی وجود ندارد" />
        ) : (
          (messages.data ?? []).map((m) => (
            <Card key={m.id} className={cn(!m.is_read && "border-primary/40")}>
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-foreground">{m.full_name}</h3>
                  <span className="text-xs text-muted-foreground" dir="ltr">
                    {m.email}
                  </span>
                  {!m.is_read && <Badge>جدید</Badge>}<Badge variant="outline">{m.kind === "feedback" ? "بازخورد" : "تماس"}</Badge>{m.rating && <span className="text-sm text-primary">{m.rating.toLocaleString("fa-IR")} / ۵</span>}
                  <span className="mr-auto text-xs text-muted-foreground">
                    {formatDateFa(m.created_at)}
                  </span>
                </div>
                <p className="mt-2 whitespace-pre-line text-sm leading-7 text-muted-foreground">
                  {m.message}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={() => toggleRead.mutate(m)}
                  >
                    {m.is_read ? <Mail className="size-4" /> : <MailOpen className="size-4" />}
                    {m.is_read ? "علامت به‌عنوان خوانده‌نشده" : "علامت به‌عنوان خوانده‌شده"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1 text-destructive"
                    onClick={() => setDeleting(m)}
                  >
                    <Trash2 className="size-4" />
                    حذف
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف پیام</AlertDialogTitle>
            <AlertDialogDescription>
              آیا از حذف پیام «{deleting?.full_name}» مطمئن هستید؟ این عمل قابل بازگشت نیست.
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
