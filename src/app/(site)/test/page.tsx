import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { PlacementTest } from "@/components/PlacementTest";
import { getDictionary } from "@/lib/locale";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return { title: t.test.metaTitle };
}

export default async function TestPage() {
  const { t } = await getDictionary();

  return (
    <>
      <Link
        href="/home"
        className="inline-flex min-h-11 items-center gap-1 rounded-xl font-bold text-primary-deep hover:underline"
      >
        <Icon name="chevron-right" size={20} />
        {t.common.home}
      </Link>
      <h1 className="mt-4 mb-8 text-3xl font-bold sm:text-4xl">{t.test.title}</h1>
      <PlacementTest />
    </>
  );
}
