"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ROUTES } from "@opora/shared";
import { buttonStyles } from "@opora/ui";

/** Мобильный липкий CTA: появляется после первого экрана. */
export function StickyCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 720);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 px-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-3 backdrop-blur md:hidden">
      <Link
        href={ROUTES.onboarding}
        className={buttonStyles({ variant: "signal", size: "md", fullWidth: true })}
        data-ym="cta_sticky"
      >
        Пройти первый день бесплатно
      </Link>
      <p className="mt-1 text-center text-xs text-muted">Без карты · анонимно · 18+</p>
    </div>
  );
}
