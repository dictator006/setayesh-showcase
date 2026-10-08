import { createFileRoute } from "@tanstack/react-router";
import { SimpleCrud } from "@/components/admin/SimpleCrud";

export const Route = createFileRoute("/admin/awards")({
  component: () => <SimpleCrud table="awards" title="افتخارات و جوایز" queryKey="awards" />,
});
