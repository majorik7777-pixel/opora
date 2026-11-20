"use client";

import { useEffect } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";

/**
 * Яндекс.Метрика (счётчик 114384853).
 *
 * Инициализация — штатная, с ssr:true; для SPA-переходов Next.js добавляем
 * `hit` на смену pathname. Цели отправляются двумя путями:
 * - JS-события `reachGoal` (кнопки с `data-ym="goal_name"`), их не видит адблок;
 * - отдельные URL-страницы («/welcome»), которые считаются как цель по визиту —
 *   это fallback, если у пользователя есть блокировщик.
 */

export const YM_COUNTER_ID = Number(process.env.NEXT_PUBLIC_YM_ID ?? 0);

type YmFn = ((id: number, action: string, ...args: unknown[]) => void) & {
  a?: unknown[][];
  l?: number;
};

declare global {
  interface Window {
    ym?: YmFn;
    dataLayer?: unknown[];
  }
}

export function yandexMetrikaGoal(goal: string, params?: Record<string, unknown>): void {
  if (!YM_COUNTER_ID || typeof window === "undefined") return;
  const ym = window.ym;
  if (typeof ym !== "function") return;
  ym(YM_COUNTER_ID, "reachGoal", goal, params);
}

export function YandexMetrika() {
  const pathname = usePathname();

  useEffect(() => {
    if (!YM_COUNTER_ID || typeof window === "undefined") return;
    const ym = window.ym;
    if (typeof ym !== "function") return;
    ym(YM_COUNTER_ID, "hit", window.location.href, {
      title: document.title,
      referer: document.referrer,
    });
    // Первый рендер уже отправил hit из init (ssr:true), дальше — только переходы.
  }, [pathname]);

  useEffect(() => {
    if (!YM_COUNTER_ID) return;

    // Делегирование: любой серверный элемент с data-ym="goal" отправляет цель.
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const el = target?.closest<HTMLElement>("[data-ym]");
      const goal = el?.dataset.ym;
      if (goal) yandexMetrikaGoal(goal);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  if (!YM_COUNTER_ID) return null;

  return (
    <>
      <Script id="yandex-metrika" strategy="afterInteractive">
        {`
(function(m,e,t,r,i,k,a){
  m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
  m[i].l=1*new Date();
  for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
  k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
})(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=${YM_COUNTER_ID}', 'ym');

ym(${YM_COUNTER_ID}, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", referrer: document.referrer, url: location.href, accurateTrackBounce:true, trackLinks:true});
        `}
      </Script>
      <noscript>
        <div>
          <img
            src={`https://mc.yandex.ru/watch/${YM_COUNTER_ID}`}
            style={{ position: "absolute", left: "-9999px" }}
            alt=""
          />
        </div>
      </noscript>
    </>
  );
}
