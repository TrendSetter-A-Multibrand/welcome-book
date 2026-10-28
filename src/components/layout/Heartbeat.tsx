"use client";

import { useEffect } from "react";

const EVERY = 30_000;

/**
 * Невидимый «пульс»: пока вкладка открыта и видна, раз в полминуты сообщает
 * серверу, сколько секунд прошло, докуда дочитан документ и какие разделы уже
 * были на экране. Из этого складывается время на сайте в статистике.
 */
export function Heartbeat() {
  useEffect(() => {
    const seen = new Set<string>();
    let progress = 0;
    let since = Date.now();

    const look = () => {
      const line = window.innerHeight * 0.7;
      document.querySelectorAll<HTMLElement>("main section[aria-label]").forEach((section) => {
        if (section.getBoundingClientRect().top <= line) {
          seen.add(section.getAttribute("aria-label") ?? "");
        }
      });
      const page = document.documentElement;
      const total = page.scrollHeight - window.innerHeight;
      progress = Math.max(progress, total > 0 ? (window.scrollY / total) * 100 : 100);
    };

    const send = () => {
      if (document.visibilityState !== "visible") {
        since = Date.now();
        return;
      }
      look();
      const seconds = (Date.now() - since) / 1000;
      since = Date.now();
      fetch("/api/pulse", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ seconds, progress, sections: [...seen] }),
        keepalive: true,
      }).catch(() => {});
    };

    look();
    const timer = setInterval(send, EVERY);
    window.addEventListener("scroll", look, { passive: true });
    document.addEventListener("visibilitychange", send);
    return () => {
      clearInterval(timer);
      window.removeEventListener("scroll", look);
      document.removeEventListener("visibilitychange", send);
    };
  }, []);

  return null;
}
