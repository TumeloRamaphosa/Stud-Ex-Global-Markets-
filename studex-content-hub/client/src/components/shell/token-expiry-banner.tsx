import { AlertTriangle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";

export function TokenExpiryBanner() {
  const [expiry, setExpiry] = useState<string | null>("2026-08-04");

  useEffect(() => {
    let active = true;
    api
      .getAnalytics()
      .then((data) => {
        if (active) setExpiry(data.metaTokenExpiresAt);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const daysLeft = useMemo(() => {
    if (!expiry) return null;
    const then = new Date(`${expiry}T00:00:00Z`);
    const now = new Date();
    return Math.ceil((then.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }, [expiry]);

  if (daysLeft === null || daysLeft >= 14 || daysLeft < 0) {
    return null;
  }

  return (
    <div className="token-banner" role="status">
      <div className="token-banner-copy">
        <AlertTriangle size={18} />
        <span>
          Meta token expires in <strong>{daysLeft} days</strong>. Rotate credentials before posting fails.
        </span>
      </div>
    </div>
  );
}
