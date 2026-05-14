import { useCallback, useRef, useState } from "react";
import { createRoot, Root } from "react-dom/client";
import React from "react";

export function usePiP() {
  const [isPiP, setIsPiP] = useState(false);
  const pipWinRef = useRef<Window | null>(null);
  const rootRef = useRef<Root | null>(null);

  const openPiP = useCallback(
    async (
      initialContent: React.ReactNode,
      options: { width?: number; height?: number } = {}
    ) => {
      if (!("documentPictureInPicture" in window)) {
        alert("Picture-in-Picture は Chrome 116以降のみ対応しています");
        return;
      }

      // 既存のPiPウィンドウがあれば閉じる
      pipWinRef.current?.close();

      const pipWin = await (
        window as unknown as {
          documentPictureInPicture: {
            requestWindow: (opts: {
              width: number;
              height: number;
            }) => Promise<Window>;
          };
        }
      ).documentPictureInPicture.requestWindow({
        width: options.width ?? 260,
        height: options.height ?? 200,
      });

      // スタイルシートをPiPウィンドウにコピー
      [...document.styleSheets].forEach((sheet) => {
        try {
          const css = [...sheet.cssRules].map((r) => r.cssText).join("");
          const style = document.createElement("style");
          style.textContent = css;
          pipWin.document.head.appendChild(style);
        } catch {
          if (sheet.href) {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = sheet.href;
            pipWin.document.head.appendChild(link);
          }
        }
      });

      // ダークモードクラスを引き継ぐ
      if (document.documentElement.classList.contains("dark")) {
        pipWin.document.documentElement.classList.add("dark");
      }

      const container = document.createElement("div");
      container.style.height = "100%";
      pipWin.document.body.style.margin = "0";
      pipWin.document.body.style.height = "100%";
      pipWin.document.body.appendChild(container);

      const root = createRoot(container);
      root.render(initialContent);

      rootRef.current = root;
      pipWinRef.current = pipWin;
      setIsPiP(true);

      pipWin.addEventListener("pagehide", () => {
        root.unmount();
        rootRef.current = null;
        pipWinRef.current = null;
        setIsPiP(false);
      });
    },
    []
  );

  const updatePiP = useCallback((content: React.ReactNode) => {
    rootRef.current?.render(content);
  }, []);

  const resizePiP = useCallback((width: number, height: number) => {
    pipWinRef.current?.resizeTo(width, height);
  }, []);

  const closePiP = useCallback(() => {
    pipWinRef.current?.close();
  }, []);

  return { isPiP, openPiP, updatePiP, resizePiP, closePiP };
}
