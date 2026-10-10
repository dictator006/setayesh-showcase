export function adminHead(section: string) {
  const title = `${section} | مدیریت ستایش رحمانی`;
  const description = `مدیریت ${section} در وب‌سایت علمی ستایش رحمانی.`;
  return { meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" }] };
}
