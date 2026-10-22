"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Block } from "@/lib/storyblok/fetchStory";
import { OnboardingPage } from "@/components/layout/OnboardingPage";

/**
 * Страница внутри Visual Editor. Подключает Storyblok Bridge и слушает редактор:
 *  - input   - редактор печатает: подставляем его черновик сразу, без сохранения;
 *  - change / published - сохранено или опубликовано: просим сервер перечитать.
 * Клик по блоку в редакторе работает через атрибуты data-blok-*, которые
 * реестр блоков ставит только на черновике.
 *
 * Показывается только в draft mode, то есть после входа через /api/preview;
 * посетителям эта обвязка и скрипт Storyblok не отдаются.
 */
const BRIDGE = "https://app.storyblok.com/f/storyblok-v2-latest.js";

type BridgeEvent = { action?: string; story?: { id: number; content: Block } };
type Bridge = { on(events: string[], callback: (event: BridgeEvent) => void): void };

declare global {
  interface Window {
    StoryblokBridge?: new (options?: Record<string, unknown>) => Bridge;
  }
}

export function LiveStory({ storyId, content }: { storyId: number; content: Block }) {
  const router = useRouter();
  // То, что редактор печатает сейчас; пока он не печатает - то, что прислал сервер
  const [typed, setTyped] = useState<Block | null>(null);
  const connected = useRef(false);

  useEffect(() => {
    if (connected.current) return;

    const connect = () => {
      if (connected.current || !window.StoryblokBridge) return;
      connected.current = true;

      const bridge = new window.StoryblokBridge();
      bridge.on(["input"], (event) => {
        if (event.story?.id === storyId) setTyped(event.story.content);
      });
      bridge.on(["change", "published"], () => {
        setTyped(null);
        router.refresh();
      });
    };

    if (window.StoryblokBridge) {
      connect();
      return;
    }

    const script = document.createElement("script");
    script.src = BRIDGE;
    script.async = true;
    script.onload = connect;
    document.head.appendChild(script);
  }, [storyId, router]);

  return <OnboardingPage content={typed ?? content} />;
}
