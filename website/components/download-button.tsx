import { ArrowDown, ArrowUpRight, Download } from "lucide-react";
import { LATEST_DOWNLOAD_URL, SOURCE_BUILD_URL } from "@/lib/release-model";

export function DownloadButton({
  available,
  className,
  sourceFallback = false,
}: {
  available: boolean;
  className: string;
  sourceFallback?: boolean;
}) {
  const href = available
    ? LATEST_DOWNLOAD_URL
    : sourceFallback
      ? SOURCE_BUILD_URL
      : "#starten";
  const label = available
    ? "Für macOS laden"
    : sourceFallback
      ? "App selbst bauen"
      : "Download-Status";
  const Icon = available ? Download : sourceFallback ? ArrowUpRight : ArrowDown;
  return (
    <a
      className={className}
      href={href}
      target={!available && sourceFallback ? "_blank" : undefined}
      rel={!available && sourceFallback ? "noreferrer" : undefined}
    >
      {label} <Icon size={18} />
    </a>
  );
}
