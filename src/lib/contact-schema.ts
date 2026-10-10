import { z } from "zod";
export const contactSchema = z.object({
  full_name: z.string().trim().min(3, "نام باید حداقل ۳ حرف باشد").max(100, "نام بیش از حد طولانی است"),
  email: z.string().trim().email("ایمیل معتبر نیست").max(255),
  message: z.string().trim().min(10, "پیام باید حداقل ۱۰ حرف باشد").max(2000, "پیام نمی‌تواند بیش از ۲۰۰۰ حرف باشد"),
  kind: z.enum(["contact", "feedback"]).default("contact"),
  rating: z.number().int().min(1).max(5).nullable().default(null),
});
