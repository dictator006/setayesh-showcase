import { describe, expect, it } from "vitest";
import { buildJourney, journeyProgress } from "@/lib/journey";
import type { Article } from "@/lib/data";

describe("Academic journey", () => {
  it("does not invent milestones when records are absent", () => {
    expect(buildJourney(null, [], [], [])).toEqual([]);
  });
  it("excludes unpublished articles", () => {
    const draft: Article = { id: "draft", title: "Draft", slug: "draft", published: false, excerpt: null, content: null, image_url: null, category_id: null, published_at: null, created_at: "", updated_at: "" };
    expect(buildJourney(null, [draft], [], [])).toEqual([]);
    expect(buildJourney(null, [{ ...draft, published: true }], [], [])[0]?.kind).toBe("article");
  });
  it("orders dated milestones chronologically", () => {
    const awards = [{ id: "later", title: "Later", date: "2025-01-01", description: null, image_url: null, created_at: "" }, { id: "earlier", title: "Earlier", date: "2020-01-01", description: null, image_url: null, created_at: "" }];
    expect(buildJourney(null, [], [], awards).map(e => e.id)).toEqual(["award-earlier", "award-later"]);
  });
  it("bounds beam progression and increases as the page scrolls", () => {
    expect(journeyProgress(900, 1000, 800)).toBe(0);
    expect(journeyProgress(20, 1000, 800)).toBe(.5);
    expect(journeyProgress(-500, 1000, 800)).toBe(1);
    expect(journeyProgress(0, 0, 800)).toBe(0);
  });
});