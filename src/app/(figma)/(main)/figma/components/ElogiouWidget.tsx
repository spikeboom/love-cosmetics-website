"use client";

import { useEffect, useRef } from "react";

export function ElogiouWidget() {
  const containerRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const loadScript = (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve();
          return;
        }
        const script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject();
        document.head.appendChild(script);
      });
    };

    loadScript("https://app.elogiou.com.br/js/iframeResizer.min.js").then(() => {
      const iframe = document.getElementById(
        "elogiou-432ecd3b-5218-4314-a770-32bed43030e9"
      ) as HTMLIFrameElement | null;
      if (iframe && typeof (window as any).iFrameResize === "function") {
        (window as any).iFrameResize(
          { log: false, checkOrigin: false },
          "#elogiou-432ecd3b-5218-4314-a770-32bed43030e9"
        );
      }
    });
  }, []);

  return (
    <div ref={containerRef} className="w-full max-w-[1440px] mx-auto">
      <iframe
        id="elogiou-432ecd3b-5218-4314-a770-32bed43030e9"
        src="https://app.elogiou.com.br/embed/432ecd3b-5218-4314-a770-32bed43030e9"
        frameBorder="0"
        scrolling="no"
        width="100%"
      />
    </div>
  );
}
