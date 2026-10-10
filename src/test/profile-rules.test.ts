import { describe, it, expect } from "vitest";
import { readingMinutes, safeProfileLink, validateProfileImage } from "@/lib/profile";
import { contactSchema } from "@/lib/contact-schema";
describe("Profile and contact safety", () => {
  it("rejects executable social URLs", () => { expect(safeProfileLink("github", "javascript:alert(1)")).toBeNull(); expect(safeProfileLink("github", "https://github.com/example")).toBe("https://github.com/example"); });
  it("limits profile uploads to five MB", () => { expect(validateProfileImage({ type: "image/png", size: 5 * 1024 * 1024 })).toBeNull(); expect(validateProfileImage({ type: "image/png", size: 5 * 1024 * 1024 + 1 })).not.toBeNull(); });
  it("rejects SVG profile uploads", () => { expect(validateProfileImage({ type: "image/svg+xml", size: 100 })).not.toBeNull(); });
  it("calculates reading minutes without empty words", () => { expect(readingMinutes("word ".repeat(201))).toBe(2); expect(readingMinutes(null)).toBe(1); });
  it("allows only contact and feedback messages", () => { const base = {full_name:"Test user",email:"test@example.org",message:"A valid test message"}; expect(contactSchema.safeParse({...base, kind:"feedback",rating:5}).success).toBe(true); expect(contactSchema.safeParse({...base,kind:"admin"}).success).toBe(false); });
  it("limits feedback rating to one through five", () => { const base = {full_name:"Test user",email:"test@example.org",message:"A valid test message",kind:"feedback"}; expect(contactSchema.safeParse({...base,rating:0}).success).toBe(false); expect(contactSchema.safeParse({...base,rating:6}).success).toBe(false); });
});
