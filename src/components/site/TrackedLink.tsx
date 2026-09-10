"use client";

import type { AnchorHTMLAttributes, MouseEventHandler } from "react";

type TrackedLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  trackId: string;
};

export function TrackedLink({ trackId, onClick, ...rest }: TrackedLinkProps) {
  const handleClick: MouseEventHandler<HTMLAnchorElement> = (event) => {
    try {
      fetch("/api/click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: trackId }),
        keepalive: true,
      }).catch(() => {});
    } catch {
      // ignore — navigation must never be blocked by tracking failures
    }
    onClick?.(event);
  };

  return <a {...rest} onClick={handleClick} />;
}
