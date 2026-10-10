import { ExternalLink, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { profileNetworks, safeProfileLink } from "@/lib/profile";

export function ProfileLinks({ links }: { links: Record<string, string> }) {
  return <div className="flex flex-wrap gap-2">{profileNetworks.map(({ key, label }) => {
    const href = safeProfileLink(key, links[key] ?? "");
    if (!href) return null;
    return <Button key={key} asChild variant="outline" size="sm"><a href={href} dir="ltr" target={key === "email" ? undefined : "_blank"} rel="noopener noreferrer">{key === "email" ? <Mail className="size-4" /> : <ExternalLink className="size-4" />}{label}</a></Button>;
  })}</div>;
}