import { z } from "zod";

export const signupRequestSchema = z
  .object({
    name: z.string().min(1, "表示名は必須です"),
    email: z.string().email("メールアドレスの形式が正しくありません"),
    password: z.string().min(6, "パスワードは6文字以上必要です"),
    passwordConfirm: z.string().min(6, "確認用パスワードは6文字以上必要です"),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "パスワードが一致しません",
    path: ["passwordConfirm"],
  });

export type SignupRequest = z.infer<typeof signupRequestSchema>;