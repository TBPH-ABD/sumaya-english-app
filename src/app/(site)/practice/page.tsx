import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { VoiceTutor } from "@/components/VoiceTutor";
import { getDictionary } from "@/lib/locale";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return { title: t.practice.title };
}

// Voice practice: name first, then a spoken conversation with the AI tutor.
export default async function PracticePage() {
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
      <h1 className="mt-4 mb-8 text-3xl font-bold sm:text-4xl">{t.practice.title}</h1>
      <VoiceTutor />
    </>
  );
}
