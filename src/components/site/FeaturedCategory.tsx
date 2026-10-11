import { Link } from "@tanstack/react-router";
import { ArrowLeft, type LucideIcon } from "lucide-react";
import { useCardEffects } from "./useCardEffects";
import type { Category } from "@/lib/data";

export function FeaturedCategory({ category, icon: Icon }: { category: Category; icon: LucideIcon }) {
  const effects = useCardEffects<HTMLAnchorElement>();
  return (
    <Link {...effects} to="/research" search={{ category: category.slug }} className="luminous-card group flex h-full items-start gap-4 rounded-lg border border-border p-5 focus-visible:ring-2 focus-visible:ring-ring">
      <Icon className="mt-1 size-7 shrink-0 text-primary" />
      <div><h3 className="font-bold group-hover:text-primary">{category.name}</h3><p className="mt-2 text-sm leading-7 text-muted-foreground">{category.description}</p></div>
      <ArrowLeft className="mr-auto mt-1 size-4 shrink-0 text-muted-foreground" />
    </Link>
  );
}