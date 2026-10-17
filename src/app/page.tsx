import { EnterButton } from "@/components/EnterButton";
import { LanguageToggle } from "@/components/LanguageToggle";
import { LogoMark } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getDictionary, getTheme } from "@/lib/locale";

// Decorative words drifting at the edges; delay offsets their motion.
const words: { text: string; position: string; delay: string }[] = [
  { text: "Hello", position: "top-[11%] left-[4%]", delay: "0s" },
  { text: "Learn", position: "top-[22%] right-[4%]", delay: "-1.3s" },
  { text: "Speak", position: "bottom-[16%] left-[5%]", delay: "-2.6s" },
  { text: "Grow", position: "bottom-[8%] right-[5%]", delay: "-3.9s" },
];

// Welcome screen: the first thing shown at "/". Full-bleed, no site header.
export default async function WelcomePage() {
  const { t } = await getDictionary();
  const theme = await getTheme();

  return (
    <div className="welcome relative flex min-h-dvh flex-1 items-center justify-center overflow-hidden px-4 py-16">
      <div aria-hidden="true">
        <span className="welcome-ring block h-[560px] w-[560px]" />
        <span className="welcome-ring block h-[860px] w-[860px]" />
        {words.map((word) => (
          <span
            key={word.text}
            dir="ltr"
            style={{ animationDelay: word.delay }}
            className={`glass anim-float absolute px-4 py-1.5 font-display text-base font-bold text-primary-soft sm:px-5 sm:py-2 sm:text-xl ${word.position}`}
          >
            {word.text}
          </span>
        ))}
      </div>

      <div className="absolute end-4 top-4 z-10 flex gap-2">
        <ThemeToggle theme={theme} glass />
        <LanguageToggle glass />
      </div>

      <main className="stagger relative flex w-full max-w-md flex-col items-center text-center">
        <span className="glass flex h-28 w-28 items-center justify-center rounded-full!">
          <LogoMark size={68} loop />
        </span>

        <h1 className="mt-8 text-6xl font-bold sm:text-7xl">{t.welcome.hello}</h1>
        <p className="mt-4 font-display text-2xl leading-relaxed text-primary-soft sm:text-3xl">
          {t.welcome.tagline}
        </p>

        <div className="glass mt-10 w-full px-6 py-6">
          <p className="font-display text-3xl font-bold">{t.welcome.name}</p>
        </div>

        <div className="mt-10">
          <EnterButton />
        </div>
      </main>
    </div>
  );
}
