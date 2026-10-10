import { adminHead } from "@/lib/metadata";
import { createFileRoute } from "@tanstack/react-router";
import { SimpleCrud } from "@/components/admin/SimpleCrud";

export const Route = createFileRoute("/admin/activities")({
  head: () => adminHead("فعالیت‌های پژوهشی"),
  component: () => (
    <SimpleCrud table="research_activities" title="فعالیت‌های پژوهشی" queryKey="activities" />
  ),
});
