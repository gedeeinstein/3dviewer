import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { getLocale, isLocale, localeCodes, locales } from "../i18n/config";
import { fontClassName } from "../i18n/fonts";
import "../globals.css";

export function generateStaticParams() {
  return localeCodes.map((locale) => ({ locale }));
}

/**
 * Absolute URLs for og:image and friends, resolved per host so a preview
 * deployment never advertises another origin's assets.
 */
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://formspace.openai.site");

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const config = getLocale(locale);
  const title = "Formspace — 3D design file viewer";
  const description = "Open and inspect 3DM, STL, OBJ, GLB, and GLTF design files directly in your browser.";
  const image = { url: "/og.jpg", width: 1200, height: 675, alt: "Formspace 3D design viewer" };

  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    applicationName: "Formspace 3D Viewer",
    alternates: {
      canonical: `/${locale}`,
      // Lets search engines serve the right language and offer the rest.
      languages: {
        ...Object.fromEntries(locales.map((entry) => [entry.code, `/${entry.code}`])),
        "x-default": "/en",
      },
    },
    icons: {
      icon: [
        { url: "/favicon.svg", type: "image/svg+xml" },
        { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
        { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
      ],
      shortcut: "/favicon.svg",
      apple: { url: "/apple-touch-icon.png", sizes: "180x180" },
    },
    openGraph: {
      type: "website",
      siteName: "Formspace",
      locale: config.intl,
      alternateLocale: locales.filter((entry) => entry.code !== locale).map((entry) => entry.intl),
      title,
      description,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export const viewport: Viewport = { themeColor: "#f7f0e7" };

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode; params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const config = getLocale(locale);

  return (
    <html lang={config.code} dir={config.dir}>
      <body className={fontClassName(config.script)}>{children}</body>
    </html>
  );
}
