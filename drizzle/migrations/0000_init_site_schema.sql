-- Roles
create type public.app_role as enum ('admin', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

create policy "Users can read own roles" on public.user_roles
  for select to authenticated using (auth.uid() = user_id);

-- Categories
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  created_at timestamptz not null default now()
);
grant select on public.categories to anon;
grant select, insert, update, delete on public.categories to authenticated;
grant all on public.categories to service_role;
alter table public.categories enable row level security;
create policy "Public read categories" on public.categories for select to anon, authenticated using (true);
create policy "Admins manage categories" on public.categories for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- Articles
create table public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text,
  image_url text,
  category_id uuid references public.categories(id) on delete set null,
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.articles to anon;
grant select, insert, update, delete on public.articles to authenticated;
grant all on public.articles to service_role;
alter table public.articles enable row level security;
create policy "Public read published articles" on public.articles for select to anon using (published = true);
create policy "Authenticated read articles" on public.articles for select to authenticated using (true);
create policy "Admins manage articles" on public.articles for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- Awards
create table public.awards (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  date date,
  image_url text,
  created_at timestamptz not null default now()
);
grant select on public.awards to anon;
grant select, insert, update, delete on public.awards to authenticated;
grant all on public.awards to service_role;
alter table public.awards enable row level security;
create policy "Public read awards" on public.awards for select to anon, authenticated using (true);
create policy "Admins manage awards" on public.awards for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- Research activities
create table public.research_activities (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  date date,
  image_url text,
  created_at timestamptz not null default now()
);
grant select on public.research_activities to anon;
grant select, insert, update, delete on public.research_activities to authenticated;
grant all on public.research_activities to service_role;
alter table public.research_activities enable row level security;
create policy "Public read activities" on public.research_activities for select to anon, authenticated using (true);
create policy "Admins manage activities" on public.research_activities for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- Contact messages
create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
grant insert on public.contact_messages to anon;
grant select, insert, update, delete on public.contact_messages to authenticated;
grant all on public.contact_messages to service_role;
alter table public.contact_messages enable row level security;
create policy "Anyone can send message" on public.contact_messages for insert to anon, authenticated with check (true);
create policy "Admins read messages" on public.contact_messages for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins update messages" on public.contact_messages for update to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins delete messages" on public.contact_messages for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Site settings (single row key-value)
create table public.site_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value text,
  created_at timestamptz not null default now()
);
grant select on public.site_settings to anon;
grant select, insert, update, delete on public.site_settings to authenticated;
grant all on public.site_settings to service_role;
alter table public.site_settings enable row level security;
create policy "Public read settings" on public.site_settings for select to anon, authenticated using (true);
create policy "Admins manage settings" on public.site_settings for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- About (single row)
create table public.about (
  id uuid primary key default gen_random_uuid(),
  full_name text not null default 'ستایش رحمانی',
  tagline text,
  bio text,
  image_url text,
  education jsonb not null default '[]'::jsonb,
  skills jsonb not null default '[]'::jsonb,
  experience jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.about to anon;
grant select, insert, update, delete on public.about to authenticated;
grant all on public.about to service_role;
alter table public.about enable row level security;
create policy "Public read about" on public.about for select to anon, authenticated using (true);
create policy "Admins manage about" on public.about for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- Seed data
insert into public.categories (name, slug, description) values
  ('مقالات علمی', 'scientific-articles', 'مقالات پژوهشی و علمی منتشرشده'),
  ('پژوهش‌های کاربردی', 'applied-research', 'پژوهش‌های کاربردی و پروژه‌های تحقیقاتی'),
  ('نقد و بررسی', 'reviews', 'نقد و بررسی آثار و مقالات');

insert into public.about (full_name, tagline, bio, education, skills, experience) values (
  'ستایش رحمانی',
  'پژوهشگر و مدرس دانشگاه',
  'ستایش رحمانی پژوهشگر و فعال علمی است که فعالیت‌های پژوهشی خود را در قالب مقالات علمی، پروژه‌های تحقیقاتی و همکاری‌های آکادمیک دنبال می‌کند. تمرکز اصلی او بر تولید دانش، انتشار یافته‌های پژوهشی و مشارکت در فعالیت‌های علمی است.',
  '[{"title": "دکتری تخصصی", "place": "دانشگاه تهران", "years": "۱۴۰۰ تا کنون"}, {"title": "کارشناسی ارشد", "place": "دانشگاه تهران", "years": "۱۳۹۶ تا ۱۳۹۸"}, {"title": "کارشناسی", "place": "دانشگاه تهران", "years": "۱۳۹۲ تا ۱۳۹۶"}]'::jsonb,
  '["روش تحقیق", "تحلیل داده", "نگارش علمی", "ارائه و تدریس", "مدیریت پروژه پژوهشی"]'::jsonb,
  '[{"title": "پژوهشگر", "place": "مرکز تحقیقات", "years": "۱۳۹۸ تا کنون"}, {"title": "مدرس", "place": "دانشگاه", "years": "۱۴۰۰ تا کنون"}]'::jsonb
);

insert into public.articles (title, slug, excerpt, content, category_id, published, published_at)
select 'مقاله نمونه: مبانی روش تحقیق در علوم انسانی', 'research-methodology-basics',
  'در این مقاله به مبانی نظری و کاربردی روش تحقیق در علوم انسانی پرداخته می‌شود و چارچوبی عملی برای طراحی پژوهش ارائه می‌گردد.',
  'روش تحقیق یکی از ارکان اصلی تولید دانش در علوم انسانی است. در این مقاله ابتدا به تعریف و جایگاه روش تحقیق می‌پردازیم، سپس انواع رویکردهای کمی و کیفی را بررسی می‌کنیم و در نهایت چارچوبی گام‌به‌گام برای طراحی یک پژوهش علمی ارائه می‌دهیم. انتخاب روش مناسب، تعیین جامعه آماری، ابزار گردآوری داده و روش‌های تحلیل از مباحث اصلی این مقاله هستند.',
  c.id, true, now()
from public.categories c where c.slug = 'scientific-articles';

insert into public.articles (title, slug, excerpt, content, category_id, published, published_at)
select 'تحلیل داده‌های کیفی: رویکردها و کاربردها', 'qualitative-data-analysis',
  'مروري بر رویکردهای اصلی تحلیل داده‌های کیفی و کاربرد آن‌ها در پژوهش‌های علوم انسانی.',
  'تحلیل داده‌های کیفی فرایندی نظام‌مند برای استخراج معنا از داده‌های متنی، مصاحبه‌ها و مشاهدات است. در این مقاله رویکردهایی مانند تحلیل مضمون، نظریه زمینه‌ای و تحلیل گفتمان معرفی و مقایسه می‌شوند و نکات کاربردی برای اجرای هر رویکرد ارائه می‌گردد.',
  c.id, true, now()
from public.categories c where c.slug = 'applied-research';

insert into public.awards (title, description, date) values
  ('برگزیده جشنواره پژوهشی', 'دریافت عنوان پژوهشگر برگزیده در جشنواره پژوهشی سالانه.', '1403-06-01'),
  ('مقاله برتر کنفرانس', 'انتخاب مقاله به‌عنوان مقاله برتر در کنفرانس ملی.', '1402-11-15');

insert into public.research_activities (title, description, date) values
  ('عضویت در کمیته علمی کنفرانس', 'داوری مقالات و عضویت در کمیته علمی کنفرانس ملی.', '1403-03-10'),
  ('اجرای پروژه پژوهشی', 'مسئولیت اجرای پروژه پژوهشی کاربردی در حوزه علوم انسانی.', '1402-07-01');

insert into public.site_settings (key, value) values
  ('site_title', 'ستایش رحمانی'),
  ('site_description', 'وب‌سایت شخصی، آموزشی و پژوهشی ستایش رحمانی'),
  ('contact_email', 'contact@example.com'),
  ('hero_subtitle', 'پژوهشگر و مدرس دانشگاه');