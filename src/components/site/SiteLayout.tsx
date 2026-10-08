import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { getSettings } from "@/lib/data";

export function SiteLayout({ children }: { children: ReactNode }) {
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: getSettings });
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer email={settings?.["contact_email"]} />
    </div>
  );
}
