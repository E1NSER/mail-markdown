"use client";

import { Download } from "lucide-react";
import { LATEST_DOWNLOAD_URL } from "@/lib/release-model";
import { useConsent } from "./consent-provider";

export function DownloadButton({
  available,
  className,
  compact = false,
  location,
}: {
  available: boolean;
  className: string;
  compact?: boolean;
  location: "header" | "hero" | "source" | "final";
}) {
  const { trackDownload } = useConsent();
  if (!available) {
    return (
      <button
        type="button"
        className={`${className} download-pending`}
        disabled
        aria-describedby="download-availability"
        title="Der Mac-Download ist hier derzeit nicht verfügbar."
      >
        <Download size={17} aria-hidden="true" />
        <span>{compact ? "Download" : "Download folgt"}</span>
        {compact && <span className="download-soon">bald</span>}
      </button>
    );
  }
  return (
    <a
      className={className}
      href={LATEST_DOWNLOAD_URL}
      onClick={() => trackDownload(location)}
      onAuxClick={(event) => {
        if (event.button === 1) trackDownload(location);
      }}
    >
      <Download size={17} aria-hidden="true" />
      <span>{compact ? "Download" : "Für macOS laden"}</span>
    </a>
  );
}
