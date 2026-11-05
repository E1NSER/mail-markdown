import { Download } from "lucide-react";
import { LATEST_DOWNLOAD_URL } from "@/lib/release-model";

export function DownloadButton({
  available,
  className,
  compact = false,
}: {
  available: boolean;
  className: string;
  compact?: boolean;
}) {
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
    <a className={className} href={LATEST_DOWNLOAD_URL}>
      <Download size={17} aria-hidden="true" />
      <span>{compact ? "Download" : "Für macOS laden"}</span>
    </a>
  );
}
