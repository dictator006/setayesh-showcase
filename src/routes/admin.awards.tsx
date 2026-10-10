import { adminHead } from "@/lib/metadata";
import { createFileRoute } from "@tanstack/react-router";
import { SimpleCrud } from "@/components/admin/SimpleCrud";

export const Route = createFileRoute("/admin/awards")({
  head: () => adminHead("افتخارات"),
  component: () => <SimpleCrud table="awards" title="افتخارات و جوایز" queryKey="awards" />,
});
