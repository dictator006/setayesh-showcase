<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Application architecture
- Resolve database article image identifiers through the shared data module; keeps generated media bundled while content remains database-owned.
- Store profile uploads as storage object paths and resolve short-lived signed URLs on reads; supports workspace restrictions on public buckets without persisting expired links.
- Share contact validation between form and data writes, with a database validation trigger; direct client writes cannot bypass input rules.
- Reuse the existing awards and activities CRUD inside profile tabs; avoids duplicate management logic and keeps public caches synchronized.
- Use a shared IntersectionObserver reveal wrapper that respects reduced motion and leaves SSR content visible; animations must not block access to content.
- Keep decorative neural rendering client-side, density/DPR bounded and paused offscreen or in hidden tabs; preserves SSR safety and battery life.
- Apply card lighting through the shared pointer-effects hook and semantic CSS tokens without wrapper cards; keeps article and featured-category styling consistent across themes.
- Derive academic journey milestones from existing profile, activities, awards and published site articles, labeling site publications without claiming authorship; avoids fabricated credentials or laboratories.
- Update journey scroll geometry through passive events and visibility-gated animation frames, with full static illumination for reduced motion; avoids per-scroll React renders and preserves accessibility.
