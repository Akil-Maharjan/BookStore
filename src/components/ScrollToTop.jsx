import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop({ behavior = "auto" }) {
  const { pathname, search, hash } = useLocation();

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;

    if (window.__skipNextScrollTop) {
      delete window.__skipNextScrollTop;
      return;
    }

    try {
      window.history.scrollRestoration = "manual";
    } catch {
      /* ignore unsupported browsers */
    }

    const scrollOptions =
      behavior === "auto" ? { top: 0, left: 0 } : { top: 0, left: 0, behavior };

    // Use rAF to wait for layout, then force scroll for both html & body
    requestAnimationFrame(() => {
      window.scrollTo(scrollOptions);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });
  }, [pathname, search, hash, behavior]);

  return null;
}
