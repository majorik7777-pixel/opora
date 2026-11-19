"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Badge, Button, Card, Input } from "@opora/ui";
import {
  requestMagicLinkAction,
  type RequestMagicLinkActionResult,
} from "@/server/actions/auth";

export function AuthForm() {
  const [state, formAction, pending] = useActionState<
    RequestMagicLinkActionResult | null,
    FormData
  >(requestMagicLinkAction, null);

  if (state?.ok) {
    const devLink = state.data.devLink;

    return (
      <div className="space-y-4">
        <Card className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge tone="sage">Письмо отправлено</Badge>
          </div>
          <h2 className="text-xl font-medium text-ink">Проверь почту</h2>
          <p className="text-base leading-7 text-muted">
            Мы отправили ссылку для входа. Она действует 20 минут и открывается
            один раз. Если письма нет — проверь «Спам».
          </p>
          {devLink ? (
            <div className="space-y-2 rounded-field border border-dashed border-line bg-bg p-4">
              <p className="text-sm font-medium text-ink">
                Dev-режим: письмо печатается в консоль сервера
              </p>
              <a
                href={devLink}
                className="inline-flex min-h-11 items-center break-all text-sm text-accent-deep underline underline-offset-2 hover:text-accent-strong"
              >
                Открыть ссылку для входа
              </a>
            </div>
          ) : null}
        </Card>

        <p className="text-sm text-muted">
          Не тот адрес?{" "}
          <Link
            href="/auth"
            className="text-accent-deep underline underline-offset-2 hover:text-accent-strong"
          >
            Отправить на другой
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <Input
        id="auth-email"
        name="email"
        type="email"
        label="Почта"
        placeholder="you@example.com"
        autoComplete="email"
        inputMode="email"
        required
        hint="Можно использовать почту без имени и фамилии."
        error={state && !state.ok ? state.message : undefined}
      />

      <Button
        type="submit"
        size="lg"
        fullWidth
        disabled={pending}
        aria-busy={pending}
      >
        {pending ? "Отправляем…" : "Получить ссылку для входа"}
      </Button>

      <p className="text-sm leading-6 text-muted">
        Нажимая кнопку, ты соглашаешься с{" "}
        <Link href="/legal/privacy" className="text-accent-deep underline underline-offset-2">
          политикой конфиденциальности
        </Link>{" "}
        и{" "}
        <Link href="/legal/terms" className="text-accent-deep underline underline-offset-2">
          условиями использования
        </Link>
        .
      </p>
    </form>
  );
}
