"use client";

import { Download } from "lucide-react";
import { LATEST_DOWNLOAD_URL } from "@/lib/release-model";
import { useConsent } from "./consent-provider";
import { useLocale } from "./locale-provider";

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
  const de = useLocale() === "de";
  if (!available) {
    return (
      <button
        type="button"
        className={`${className} download-pending`}
        disabled
        aria-describedby="download-availability"
        title={de ? "Der Mac-Download ist hier derzeit nicht verfügbar." : "The Mac download is currently unavailable."}
      >
        <Download size={17} aria-hidden="true" />
        <span>{compact ? "Download" : de ? "Download folgt" : "Coming soon"}</span>
        {compact && <span className="download-soon">{de ? "bald" : "soon"}</span>}
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
      <span>{compact ? "Download" : de ? "Für macOS laden" : "Download for macOS"}</span>
    </a>
  );
}
