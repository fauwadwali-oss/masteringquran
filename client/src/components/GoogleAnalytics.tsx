import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const GA_MEASUREMENT_ID = (import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined)?.trim();

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function loadGoogleAnalytics(measurementId: string) {
  if (typeof window === "undefined" || window.gtag) {
    return;
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    // gtag.js expects an Arguments object for commands, not a plain array.
    window.dataLayer?.push(arguments);
  };

  window.gtag("js", new Date());
  window.gtag("config", measurementId, { send_page_view: false });

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  document.head.appendChild(script);
}

function trackPageView(measurementId: string, path: string) {
  window.gtag?.("event", "page_view", {
    send_to: measurementId,
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  });
}

export default function GoogleAnalytics() {
  const location = useLocation();

  useEffect(() => {
    if (!GA_MEASUREMENT_ID) {
      return;
    }

    loadGoogleAnalytics(GA_MEASUREMENT_ID);

    window.setTimeout(() => {
      trackPageView(GA_MEASUREMENT_ID, `${location.pathname}${location.search}`);
    }, 0);
  }, [location.pathname, location.search]);

  return null;
}
