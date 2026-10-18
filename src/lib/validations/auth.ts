import { z } from "zod";

export const signInSchema = z.object({
  email: z.email("Informe um e-mail válido"),
  password: z.string().min(6, "Informe a senha"),
});
export type SignInInput = z.infer<typeof signInSchema>;

export const resetRequestSchema = z.object({ email: z.email("Informe um e-mail válido") });

export const newPasswordSchema = z
  .object({
    password: z
      .string()
      .min(10, "Use pelo menos 10 caracteres")
      .max(72)
      .refine((v) => /[A-Za-z]/.test(v) && /\d/.test(v), "Combine letras e números"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { path: ["confirm"], message: "As senhas não conferem" });
export type NewPasswordInput = z.infer<typeof newPasswordSchema>;
