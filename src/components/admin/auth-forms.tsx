"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { requestPasswordReset, signIn, updatePassword } from "@/lib/actions/auth";
import { newPasswordSchema, resetRequestSchema, signInSchema, type NewPasswordInput, type SignInInput } from "@/lib/validations/auth";

export function LoginForm({ next, linkError }: { next?: string; linkError?: boolean }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(linkError ? "O link expirou ou já foi usado. Peça um novo." : null);
  const form = useForm<SignInInput>({ resolver: zodResolver(signInSchema), defaultValues: { email: "", password: "" } });
  const { errors } = form.formState;

  const onSubmit = form.handleSubmit((values) =>
    start(async () => {
      setError(null);
      const res = await signIn(values, next);
      if (res && !res.ok) setError(res.error);
    }),
  );

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5">
      {error && (
        <p role="alert" className="rounded-xl border border-red-700/20 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </p>
      )}
      <Field label="E-mail" htmlFor="email" error={errors.email?.message}>
        <Input id="email" type="email" autoComplete="email" aria-invalid={!!errors.email} {...form.register("email")} />
      </Field>
      <Field label="Senha" htmlFor="password" error={errors.password?.message}>
        <Input id="password" type="password" autoComplete="current-password" aria-invalid={!!errors.password} {...form.register("password")} />
      </Field>
      <Button type="submit" size="lg" disabled={pending}>
        {pending && <Loader2 className="animate-spin" />} Entrar
      </Button>
      <Link href="/admin/recuperar-senha" className="text-center text-sm text-gold-ink underline-offset-4 hover:underline">
        Esqueci minha senha
      </Link>
    </form>
  );
}

export function ResetRequestForm() {
  const [pending, start] = useTransition();
  const [done, setDone] = useState<string | null>(null);
  const form = useForm<{ email: string }>({ resolver: zodResolver(resetRequestSchema), defaultValues: { email: "" } });

  const onSubmit = form.handleSubmit((values) =>
    start(async () => {
      const res = await requestPasswordReset(values);
      if (!res.ok) return void toast.error(res.error);
      setDone(res.message ?? "Verifique seu e-mail.");
    }),
  );

  if (done) {
    return (
      <div className="grid gap-4 text-center">
        <p className="text-sm">{done}</p>
        <Link href="/admin/login" className="text-sm text-gold-ink hover:underline">
          Voltar para o login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5">
      <Field label="E-mail" htmlFor="email" error={form.formState.errors.email?.message}>
        <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
      </Field>
      <Button type="submit" size="lg" disabled={pending}>
        {pending && <Loader2 className="animate-spin" />} Enviar link
      </Button>
      <Link href="/admin/login" className="text-center text-sm text-gold-ink hover:underline">
        Voltar para o login
      </Link>
    </form>
  );
}

export function PasswordForm() {
  const [pending, start] = useTransition();
  const form = useForm<NewPasswordInput>({ resolver: zodResolver(newPasswordSchema), defaultValues: { password: "", confirm: "" } });
  const { errors } = form.formState;

  const onSubmit = form.handleSubmit((values) =>
    start(async () => {
      const res = await updatePassword(values);
      if (!res.ok) return void toast.error(res.error);
      toast.success(res.message);
      form.reset();
    }),
  );

  return (
    <form onSubmit={onSubmit} noValidate className="grid max-w-md gap-5">
      <Field label="Nova senha" htmlFor="password" error={errors.password?.message} hint="Pelo menos 10 caracteres, com letras e números.">
        <Input id="password" type="password" autoComplete="new-password" aria-invalid={!!errors.password} {...form.register("password")} />
      </Field>
      <Field label="Confirme a nova senha" htmlFor="confirm" error={errors.confirm?.message}>
        <Input id="confirm" type="password" autoComplete="new-password" aria-invalid={!!errors.confirm} {...form.register("confirm")} />
      </Field>
      <Button type="submit" disabled={pending} className="w-fit">
        {pending && <Loader2 className="animate-spin" />} Alterar senha
      </Button>
    </form>
  );
}
