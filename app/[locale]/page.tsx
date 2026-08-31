import { notFound } from "next/navigation";
import { DesignStudio } from "../components/DesignStudio";
import { isLocale } from "../i18n/config";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <DesignStudio />;
}
