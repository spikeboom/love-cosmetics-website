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
        "elogiou-45fbea4a-c290-4aa6-abca-92e2625c2abe"
      ) as HTMLIFrameElement | null;
      if (iframe && typeof (window as any).iFrameResize === "function") {
        (window as any).iFrameResize(
          { log: false, checkOrigin: false },
          "#elogiou-45fbea4a-c290-4aa6-abca-92e2625c2abe"
        );
      }
    });
  }, []);

  return (
    <div ref={containerRef} className="w-full">
      <iframe
        id="elogiou-45fbea4a-c290-4aa6-abca-92e2625c2abe"
        src="https://app.elogiou.com.br/embed/45fbea4a-c290-4aa6-abca-92e2625c2abe"
        frameBorder="0"
        scrolling="no"
        width="100%"
      />
    </div>
  );
}
