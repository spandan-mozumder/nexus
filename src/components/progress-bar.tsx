"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

NProgress.configure({ showSpinner: false, speed: 500, trickleSpeed: 100 });

export function ProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    NProgress.done();
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleAnchorClick = (event: MouseEvent) => {
      const target = event.currentTarget as HTMLAnchorElement;
      const targetUrl = new URL(target.href);
      const currentUrl = new URL(window.location.href);

      if (targetUrl.pathname !== currentUrl.pathname) {
        NProgress.start();
      }
    };

    const handleMutation: MutationCallback = () => {
      const anchorElements = document.querySelectorAll("a[href]");
      anchorElements.forEach((anchor) => {
        anchor.addEventListener("click", handleAnchorClick as EventListener);
      });
    };

    const mutationObserver = new MutationObserver(handleMutation);
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    handleMutation([], mutationObserver);

    return () => {
      mutationObserver.disconnect();
    };
  }, []);

  return null;
}
