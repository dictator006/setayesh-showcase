import { Link } from "@tanstack/react-router";
import { CalendarDays, ArrowLeft, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateFa, type Article } from "@/lib/data";

export function ArticleCard({ article }: { article: Article }) {
  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <Link
        to="/research/$slug"
        params={{ slug: article.slug }}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="relative aspect-[16/9] overflow-hidden bg-muted">
          {article.image_url ? (
            <img
              src={article.image_url}
              alt={article.title}
              loading="lazy"
              width={640}
              height={360}
              className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-muted-foreground">
              <BookOpen className="size-10" />
            </div>
          )}
        </div>
        <CardContent className="p-5">
          <div className="flex items-center gap-2">
            {article.categories && (
              <Badge variant="secondary">{article.categories.name}</Badge>
            )}
            {article.published_at && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <CalendarDays className="size-3.5" />
                {formatDateFa(article.published_at)}
              </span>
            )}
          </div>
          <h3 className="mt-3 line-clamp-2 text-lg font-bold leading-8 text-foreground transition-colors group-hover:text-primary">
            {article.title}
          </h3>
          {article.excerpt && (
            <p className="mt-2 line-clamp-3 text-sm leading-7 text-muted-foreground">
              {article.excerpt}
            </p>
          )}
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
            ادامه مطلب
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
          </span>
        </CardContent>
      </Link>
    </Card>
  );
}
