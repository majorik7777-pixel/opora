import { getEnv } from "@opora/shared/server";

export interface MagicLinkMessage {
  to: string;
  link: string;
  expiresAt: Date;
}

export interface Mailer {
  sendMagicLink(message: MagicLinkMessage): Promise<void>;
}

function maskEmail(email: string): string {
  const atIndex = email.indexOf("@");
  if (atIndex <= 0) return "***";
  const local = email.slice(0, atIndex);
  const domain = email.slice(atIndex + 1);
  return `${local.slice(0, 2)}***@${domain}`;
}

/**
 * Phase 1: письма не отправляются наружу — ссылка печатается в консоль сервера
 * (и показывается в UI при AUTH_DEV_SHOW_LINK=true). Реальный транспорт —
 * задача T-004/T-105 и ADR-0003. Токен в логах production недопустим, поэтому
 * console-транспорт включается только в dev/e2e.
 */
export function createMailer(): Mailer {
  const env = getEnv();

  if (env.EMAIL_TRANSPORT === "console") {
    if (env.NODE_ENV === "production") {
      console.warn(
        "[opora:mail] EMAIL_TRANSPORT=console в production: письма не отправляются, ссылка только в логах. Настроить SMTP до публичного запуска.",
      );
    }
    return {
      async sendMagicLink({ to, link, expiresAt }) {
        console.info(
          `[opora:mail] magic-link для ${maskEmail(to)} (до ${expiresAt.toISOString()}): ${link}`,
        );
      },
    };
  }

  return {
    async sendMagicLink() {
      throw new Error(
        "EMAIL_TRANSPORT=smtp ещё не реализован (Phase 1). Используй EMAIL_TRANSPORT=console.",
      );
    },
  };
}
