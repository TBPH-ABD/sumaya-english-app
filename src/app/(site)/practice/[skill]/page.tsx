import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/Icon";
import { SentenceBuilder } from "@/components/SentenceBuilder";
import { SkillPractice } from "@/components/SkillPractice";
import { getDictionary } from "@/lib/locale";

// Speaking is deliberately absent: it has its own plan and is built later.
const builtSkills = ["reading", "writing", "listening"] as const;
type BuiltSkill = (typeof builtSkills)[number];

type Props = { params: Promise<{ skill: string }> };

function parseSkill(value: string): BuiltSkill | null {
  return builtSkills.find((skill) => skill === value) ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { t } = await getDictionary();
  const skill = parseSkill((await params).skill);
  return { title: skill ? t.skills[skill] : t.common.notFound };
}

export default async function SkillPage({ params }: Props) {
  const { t } = await getDictionary();
  const skill = parseSkill((await params).skill);
  if (!skill) notFound();

  return (
    <>
      <Link
        href="/practice"
        className="inline-flex min-h-11 items-center gap-1 rounded-xl font-bold text-primary-deep hover:underline"
      >
        <Icon name="chevron-right" size={20} />
        {t.practice.backToSkills}
      </Link>
      <h1 className="mt-4 mb-8 text-3xl font-bold sm:text-4xl">{t.skills[skill]}</h1>
      {skill === "writing" && <SentenceBuilder />}
      {skill === "reading" && <SkillPractice skill="reading" icon="book-open" />}
      {skill === "listening" && <SkillPractice skill="listening" icon="headphones" />}
    </>
  );
}
