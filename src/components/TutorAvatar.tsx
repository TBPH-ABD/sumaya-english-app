import { useId } from "react";

export type TutorStatus = "idle" | "thinking" | "speaking" | "listening";

type Props = {
  status: TutorStatus;
  // Changes on every spoken word; each change plays one open-and-close of the mouth.
  beat?: number;
  // How long that mouth movement lasts, in milliseconds.
  beatMs?: number;
  // Part of the picture to show, in picture pixels. The default frames head and shoulders.
  viewBox?: string;
  className?: string;
};

const SIZE = 1254;

// The tutor's picture, brought to life: the lower lip moves with each spoken word, the eyes
// blink and the head sways. All coordinates below are pixels of public/tutor.jpg (1254 x 1254),
// so they only fit that exact picture: replacing it means re-measuring the mouth and the eyes.
export function TutorAvatar({ status, beat = 0, beatMs = 260, viewBox = "255 40 640 800", className = "" }: Props) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const talking = status === "speaking" && beat > 0;

  return (
    <svg
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      data-status={status}
      className={`tutor-face ${className}`}
    >
      <defs>
        <filter id={`soft-${id}`}>
          <feGaussianBlur stdDeviation="2" />
        </filter>
        {/* Eyelid skin: darker at the crease, lighter towards the lashes, like the shading around the eyes. */}
        <linearGradient id={`lid-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6b3524" />
          <stop offset="1" stopColor="#99573b" />
        </linearGradient>
        {/* Lower lip and the skin just under it. The top edge runs just below the line between
            the lips; the blur softens the seam where the moved piece meets the still picture. */}
        <mask id={`jaw-${id}`} maskUnits="userSpaceOnUse" x="500" y="440" width="200" height="130">
          <polygon
            filter={`url(#soft-${id})`}
            fill="#ffffff"
            points="534,503 544,504 552,504 560,502.5 568,500 576,497 584,496 592,494 600,491 608,487 616,484 624,481 632,478 640,474 648,470 658,462 664,458 668,470 662,492 648,510 628,526 605,536 578,538 555,530 540,518 532,508"
          />
        </mask>
      </defs>

      <g className="tutor-head">
        <image href="/tutor.jpg" width={SIZE} height={SIZE} />

        {/* Inside of the mouth and a hint of teeth: invisible at rest, shown while the lip is down. */}
        <g
          key={`mouth-${beat}`}
          className={talking ? "tutor-mouth tutor-mouth-open" : "tutor-mouth"}
          style={talking ? { animationDuration: `${beatMs}ms` } : undefined}
        >
          <path
            d="M536,501 L552,502 L568,498 L584,494 L600,489 L616,482 L632,476 L648,468 L658,461 L648,476 L632,487 L616,495 L600,502 L584,507 L568,510 L552,509 L540,504 Z"
            fill="#3a1411"
          />
          <path
            d="M556,502 L568,499.5 L584,495.5 L600,490.5 L616,483.5 L632,477.5 L642,472.5 L640,478 L632,483 L616,489 L600,496 L584,501 L568,504.5 L558,505 Z"
            fill="#eadbd1"
            opacity="0.9"
          />
        </g>

        {/* The masked piece moves as a whole (mask included), uncovering the mouth above it.
            key restarts the movement for every word. */}
        <g
          key={beat}
          mask={`url(#jaw-${id})`}
          className={talking ? "tutor-jaw" : undefined}
          style={talking ? { animationDuration: `${beatMs}ms` } : undefined}
        >
          <image href="/tutor.jpg" width={SIZE} height={SIZE} />
        </g>

        {/* Closed eyelids, shown for an instant every few seconds. */}
        <g className="tutor-lids">
          <g filter={`url(#soft-${id})`} fill={`url(#lid-${id})`}>
            <path d="M429,376 Q452,348 492,349 Q513,355 522,372 Q500,394 467,398 Q444,393 429,376 Z" />
            <path d="M599,348 Q611,314 642,296 Q673,290 691,307 Q681,328 643,342 Q618,352 599,348 Z" />
          </g>
          <g fill="none" stroke="#160b08" strokeWidth="5" strokeLinecap="round">
            <path d="M432,380 Q467,401 520,373" />
            <path d="M601,350 Q645,345 690,310" />
          </g>
        </g>
      </g>
    </svg>
  );
}
