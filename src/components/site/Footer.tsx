import { Link } from "@tanstack/react-router";
import { GraduationCap, Mail } from "lucide-react";

export function Footer({ email }: { email?: string | undefined }) {
  return (
    <footer className="mt-20 border-t border-border bg-card">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2 font-bold text-foreground">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <GraduationCap className="size-5" />
            </span>
            ستایش رحمانی
          </div>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            وب‌سایت شخصی، آموزشی و پژوهشی — معرفی فعالیت‌های علمی، مقالات و افتخارات.
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-foreground">دسترسی سریع</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/" className="transition-colors hover:text-foreground">خانه</Link></li>
            <li><Link to="/about" className="transition-colors hover:text-foreground">درباره من</Link></li>
            <li><Link to="/research" className="transition-colors hover:text-foreground">پژوهش‌ها</Link></li>
            <li><Link to="/contact" className="transition-colors hover:text-foreground">تماس</Link></li>
            <li><Link to="/admin/login" className="transition-colors hover:text-foreground">ورود مدیریت</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-foreground">ارتباط</h3>
          {email && (
            <a
              href={`mailto:${email}`}
              className="mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <Mail className="size-4" />
              <span dir="ltr">{email}</span>
            </a>
          )}
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} ستایش رحمانی — تمامی حقوق محفوظ است.
      </div>
    </footer>
  );
}
