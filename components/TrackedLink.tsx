"use client";

import Link, { type LinkProps } from "next/link";
import { type AnchorHTMLAttributes, type MouseEvent } from "react";

type AnalyticsValue = string | number | boolean;

type TrackedLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> &
  LinkProps & {
    eventName: string;
    eventParams?: Record<string, AnalyticsValue>;
  };

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (...args: unknown[]) => void;
  }
}

function sendAnalyticsEvent(eventName: string, eventParams?: Record<string, AnalyticsValue>) {
  if (typeof window === "undefined") {
    return;
  }

  const payload = {
    event_category: "cta",
    ...eventParams,
  };

  window.dataLayer?.push({
    event: eventName,
    ...payload,
  });

  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, payload);
  }
}

export default function TrackedLink({
  eventName,
  eventParams,
  onClick,
  children,
  ...props
}: TrackedLinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);

    if (event.defaultPrevented) {
      return;
    }

    sendAnalyticsEvent(eventName, eventParams);
  };

  return (
    <Link {...props} onClick={handleClick}>
      {children}
    </Link>
  );
}
