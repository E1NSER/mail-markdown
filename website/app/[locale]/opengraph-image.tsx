import { socialImage, size } from "@/components/social-image";
import { isLocale, siteTitles } from "@/lib/i18n";

export async function generateImageMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const language = isLocale(locale) ? locale : "en";
  return [{ id: language, alt: siteTitles[language], size, contentType: "image/png" }];
}

export default async function OpenGraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return socialImage(isLocale(locale) ? locale : "en");
}
