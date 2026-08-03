import { useMemo, type ReactNode } from "react";
import { LayoutGroup, motion } from "framer-motion";
import {
  useWaFlowSurveyAnalytics,
  useWaFlowSurveys,
} from "../../data/queries/use-wa-flow-survey";
import type { WaFlowQuestionAnalytics } from "../../data/api/wa-flow-survey-api";
import { EYLogo } from "@/components/branding/ey-logo";
import { Skeleton } from "@/components/ui/skeleton";

/** Figma: EY - Partner meet / Light mode (node 5:2) */
const PUBLIC_ORG_ID = "68b08633907a113536238290";
const PREFERRED_TEMPLATES = [
  "ey_partners_connect_form_final",
  "partners_connect_flow_test",
];
const POLL_MS = 3_000;

const C = {
  page: "#F9F9F9",
  white: "#FFFFFF",
  ink: "#1B1C1C",
  muted: "#49473A",
  olive: "#6A5F00",
  border: "#C9C7B1",
  track: "#EBE9E8",
  yellow: "#FFE600",
  chip: "#F3F3F3",
  soft: "#5E5E5E",
} as const;

type CardId = "focus" | "portfolio" | "growth" | "maturity" | "positioning";

type CardConfig = {
  id: CardId;
  eyebrow: string;
  title: string;
  /** Option values unique to this WhatsApp Flow question (fingerprint fallback). */
  optionFingerprints: string[];
};

/**
 * Display copy for each Partners Connect question.
 *
 * Interakt does NOT send screen titles. Multi-select keys are reused/unstable:
 *   `Choose all that apply:` / `_(2)` can mean Q1, Q2, or Q3 depending on Flow version.
 * Cards are matched by option fingerprints (Cost Pressure → Q1, Advisory → Q2, Cyber → Q3).
 * Single-select keys are more stable: `Choose one:_(2)` ≈ Q4, `Choose one:` ≈ Q5.
 */
const CARD_CONFIG: CardConfig[] = [
  {
    id: "focus",
    eyebrow: "Question 1",
    title: "What keeps your client's CXO awake at night?",
    optionFingerprints: [
      "cost pressure",
      "ai adoption",
      "talent shortage",
      "security & operations",
      "security and operations",
      "regulation & compliance",
      "regulation and compliance",
    ],
  },
  {
    id: "portfolio",
    eyebrow: "Question 2",
    title: "What is your current engagement with client?",
    // Do not fingerprint bare "operations" — collides with "Security & Operations" / IT Ops.
    optionFingerprints: ["advisory", "transformation", "strategy"],
  },
  {
    id: "growth",
    eyebrow: "Question 3",
    title: "If we could take over operations of the client, what would it be?",
    optionFingerprints: [
      "it operations",
      "cyber",
      "data & ai",
      "data and ai",
      "business operations",
      "hr and learning",
    ],
  },
  {
    id: "maturity",
    eyebrow: "Question 4",
    title: "Does the client already outsource operations?",
    optionFingerprints: ["yes", "no", "partially"],
  },
  {
    id: "positioning",
    eyebrow: "Question 5",
    title: "What is the client's disposition to EY as an operations partner?",
    optionFingerprints: [
      "open to our offering",
      "ey not recognized for ops",
      "prefers sis",
      "prefers incumbents",
    ],
  },
];

type RankedOption = { value: string; count: number; pct: number };

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/_/g, " ")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function rankOptions(question: WaFlowQuestionAnalytics | undefined): RankedOption[] {
  if (!question?.options?.length) return [];
  const total = question.totalAnswers || question.options.reduce((s, o) => s + o.count, 0) || 1;
  return [...question.options]
    .map((o) => ({
      value: o.value,
      count: o.count,
      pct: Math.round((o.count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
}

/**
 * Map a stored Interakt/Meta field onto a Partner Meet card.
 * Mirrors backend `resolveQuestion` in flow-score.ts — order matters:
 * specific `_(2)` / operations keys must win over bare "Choose all/one".
 */
function resolveCardId(questionKey: string, questionLabel: string): CardId | undefined {
  const keyNorm = normalize(questionKey);
  const labelNorm = normalize(questionLabel);
  const haystack = `${keyNorm} ${labelNorm}`;

  // Q3 — unique key when present (older Flows). Newer Flows put these options under
  // "Choose all that apply:" — those are resolved via option fingerprints instead.
  if (
    questionKey.toLowerCase().includes("operations_to_take_over") ||
    keyNorm.includes("operations to take over") ||
    /take over an area|take over operations/.test(haystack)
  ) {
    return "growth";
  }

  // Q4 / Q5 — Choose one keys are stable across known Flow versions.
  if (
    /choose one/.test(keyNorm) &&
    (questionKey.includes("_(2)") || /\b2\b/.test(keyNorm) || /choose one 2/.test(keyNorm))
  ) {
    return "maturity";
  }

  if (
    (/^choose one$/.test(keyNorm) || /^choose one$/.test(labelNorm)) &&
    !questionKey.includes("_(2)")
  ) {
    return "positioning";
  }

  // Title-based fallback when Flow starts sending real headings as keys/labels.
  // Do NOT map bare / _(2) "Choose all that apply" by key — swapped in ey_partners_connect_form_final.
  if (/cxo awake|awake at night/.test(haystack)) return "focus";
  if (/current engagement|engagement mix/.test(haystack)) return "portfolio";
  if (/outsource|outsourcing/.test(haystack)) return "maturity";
  if (/disposition|operations partner/.test(haystack)) return "positioning";

  return undefined;
}

function fingerprintScore(question: WaFlowQuestionAnalytics, fingerprints: string[]): number {
  if (!question.options?.length || !fingerprints.length) return 0;
  // Exact option match only — substring matching reintroduces Q1↔Q2 swaps.
  const values = new Set(question.options.map((o) => normalize(o.value)));
  let hits = 0;
  for (const fp of fingerprints) {
    if (values.has(normalize(fp))) hits += 1;
  }
  return hits;
}

function findQuestion(
  questions: WaFlowQuestionAnalytics[],
  config: CardConfig,
  usedKeys: Set<string>,
): WaFlowQuestionAnalytics | undefined {
  const unused = questions.filter((q) => !usedKeys.has(q.questionKey));

  // 1) Fingerprint by option labels FIRST — Meta reuses "Choose all that apply:" keys
  //    and ey_partners_connect_form_final swapped which screen owns bare vs _(2).
  let best: { q: WaFlowQuestionAnalytics; score: number } | undefined;
  for (const q of unused) {
    const score = fingerprintScore(q, config.optionFingerprints);
    if (score > 0 && (!best || score > best.score)) best = { q, score };
  }
  if (best && best.score >= 2) return best.q;

  // 2) Key/label resolution (stable for Choose one: / operations_to_take_over only).
  return unused.find((q) => resolveCardId(q.questionKey, q.questionLabel) === config.id);
}

/** Bar fill matches the displayed percentage (50% → half the track). */
function barWidth(pct: number) {
  if (pct <= 0) return 0;
  return Math.min(100, Math.round(pct));
}

export function PartnerMeetPublicPage() {
  const orgId = PUBLIC_ORG_ID;
  const { data: listData, isLoading: listLoading } = useWaFlowSurveys(orgId, {
    refetchInterval: POLL_MS,
  });

  const surveyId = useMemo(() => {
    const surveys = listData?.surveys ?? [];
    const preferred = surveys.find(
      (s) =>
        (s.templateName != null && PREFERRED_TEMPLATES.includes(s.templateName)) ||
        s.templateName?.includes("partners_connect") ||
        s.title?.includes("partners_connect"),
    );
    return preferred?.id ?? surveys[0]?.id ?? "";
  }, [listData?.surveys]);

  const { data: analytics, isLoading: analyticsLoading } =
    useWaFlowSurveyAnalytics(orgId, surveyId, { refetchInterval: POLL_MS });

  const cards = useMemo(() => {
    const questions = analytics?.questions ?? [];
    const used = new Set<string>();
    const byId = Object.fromEntries(
      CARD_CONFIG.map((config) => {
        const question = findQuestion(questions, config, used);
        if (question) used.add(question.questionKey);
        return [config.id, { config, options: rankOptions(question) }] as const;
      }),
    ) as Record<CardId, { config: CardConfig; options: RankedOption[] }>;
    return byId;
  }, [analytics?.questions]);

  const n = analytics?.survey.submissionCount ?? 0;
  const isLoading = listLoading || (Boolean(surveyId) && analyticsLoading && !analytics);

  return (
    <div
      className="min-h-screen font-[Inter,system-ui,sans-serif]"
      style={{ backgroundColor: C.page, color: C.ink }}
    >
      {/* Figma Header - TopNavBar */}
      <header
        className="flex items-center justify-between px-8 py-8 lg:px-16"
        style={{ backgroundColor: C.white, borderBottom: `1px solid ${C.border}` }}
      >
        <div className="flex h-16 w-[150px] items-center text-black sm:h-[72px]">
          <EYLogo className="h-full max-h-20 w-auto" />
        </div>

        <div className="flex items-center gap-6">
          <div
            className="flex items-center gap-2 rounded-full px-4 py-2"
            style={{ backgroundColor: C.chip }}
          >
            <span className="text-[32px] font-bold leading-10 tracking-tight tabular-nums">
              {isLoading ? "—" : n}
            </span>
            <span
              className="max-w-[7rem] text-[14px] font-semibold uppercase leading-5 tracking-[0.1em]"
              style={{ color: C.olive }}
            >
              Responses
              <br />
              Recorded
            </span>
          </div>

          <div
            className="flex items-center gap-2 rounded-full px-4 py-2"
            style={{ backgroundColor: C.chip }}
          >
            <span
              className="relative flex h-2.5 w-2.5"
              aria-hidden
            >
              <span
                className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
                style={{ backgroundColor: C.yellow }}
              />
              <span
                className="relative inline-flex h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: C.yellow, boxShadow: "0 0 10px rgba(255,230,0,0.45)" }}
              />
            </span>
            <span
              className="text-[14px] font-semibold uppercase leading-5 tracking-[0.1em]"
              style={{ color: C.olive }}
            >
              Live Stream
              <br />
              Active
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[1152px] flex-col gap-12 px-4 py-12 sm:px-6">
        {isLoading ? (
          <div className="grid gap-6 lg:grid-cols-12">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={`rounded-2xl bg-white p-8 ${i === 4 ? "lg:col-span-12" : i % 2 === 0 ? "lg:col-span-7" : "lg:col-span-5"}`}
              >
                <Skeleton className="h-4 w-36" />
                <Skeleton className="mt-3 h-8 w-3/4" />
                <Skeleton className="mt-10 h-48 w-full" />
              </div>
            ))}
          </div>
        ) : !surveyId ? (
          <div className="rounded-2xl bg-white px-8 py-24 text-center shadow-sm">
            <p className="text-xl font-semibold">Waiting for Partner Meet responses</p>
            <p className="mt-2 text-sm" style={{ color: C.soft }}>
              Submit the WhatsApp Flow to populate live rankings.
            </p>
          </div>
        ) : (
          <LayoutGroup>
            <div className="grid gap-6 lg:grid-cols-12">
              {/* Q1 — many options, hero + grid */}
              <div className="lg:col-span-7">
                <FocusCard
                  eyebrow={cards.focus.config.eyebrow}
                  title={cards.focus.config.title}
                  options={cards.focus.options}
                />
              </div>
              {/* Q2 — engagement mix list */}
              <div className="lg:col-span-5">
                <ListCard
                  eyebrow={cards.portfolio.config.eyebrow}
                  title={cards.portfolio.config.title}
                  options={cards.portfolio.options}
                />
              </div>
              {/* Q4 — yes/no/partial big % */}
              <div className="lg:col-span-5">
                <MaturityCard
                  eyebrow={cards.maturity.config.eyebrow}
                  title={cards.maturity.config.title}
                  options={cards.maturity.options}
                />
              </div>
              {/* Q5 — disposition 2×2 */}
              <div className="lg:col-span-7">
                <GridCard
                  eyebrow={cards.positioning.config.eyebrow}
                  title={cards.positioning.config.title}
                  options={cards.positioning.options}
                />
              </div>
              {/* Q3 — take-over areas as columns */}
              <div className="lg:col-span-12">
                <ColumnsCard
                  eyebrow={cards.growth.config.eyebrow}
                  title={cards.growth.config.title}
                  options={cards.growth.options}
                  respondents={n}
                />
              </div>
            </div>
          </LayoutGroup>
        )}

       
      </main>
    </div>
  );
}

function CardShell({
  eyebrow,
  title,
  children,
  rightMeta,
  className = "",
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
  rightMeta?: ReactNode;
  className?: string;
}) {
  return (
    <article
      className={`relative flex h-full flex-col overflow-hidden rounded-2xl p-8 ${className}`}
      style={{
        backgroundColor: C.white,
        backgroundImage:
          "radial-gradient(circle at 50% 50%, rgba(255, 230, 0, 0.05) 0%, rgba(255, 230, 0, 0) 70%)",
      }}
    >
      <div className="relative z-10 mb-6 flex items-start justify-between gap-4">
        <div>
          <p
            className="text-[14px] font-semibold uppercase leading-5 tracking-[0.1em]"
            style={{ color: C.muted }}
          >
            {eyebrow}
          </p>
          <h2
            className="mt-2 max-w-[42rem] text-[28px] font-bold leading-10 tracking-tight sm:text-[32px]"
            style={{ color: C.ink }}
          >
            {title}
          </h2>
        </div>
        {rightMeta}
      </div>
      <div className="relative z-10 flex-1">{children}</div>
    </article>
  );
}

function EmptyOptions() {
  return (
    <p className="py-10 text-sm" style={{ color: C.soft }}>
      No responses yet
    </p>
  );
}

function YellowBar({ widthPct }: { widthPct: number }) {
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-sm" style={{ backgroundColor: C.track }}>
      <motion.div
        className="h-full rounded-sm"
        style={{
          backgroundColor: C.yellow,
          boxShadow: "0px 0px 10px 0px rgba(255, 230, 0, 0.2)",
        }}
        animate={{ width: `${widthPct}%` }}
        transition={{ duration: 0.45 }}
      />
    </div>
  );
}

/** Question 1: Big Focus */
function FocusCard({
  eyebrow,
  title,
  options,
}: {
  eyebrow: string;
  title: string;
  options: RankedOption[];
}) {
  const [hero, ...rest] = options;

  return (
    <CardShell eyebrow={eyebrow} title={title}>
      {!options.length ? (
        <EmptyOptions />
      ) : (
        <div className="flex flex-col gap-8">
          {hero ? (
            <motion.div layout key={hero.value} transition={{ type: "spring", stiffness: 380, damping: 32 }}>
              <div className="flex items-end justify-between gap-4">
                <span className="text-[18px] font-semibold leading-7">{hero.value}</span>
                <span className="text-[48px] font-bold leading-[56px] tracking-[-0.02em] tabular-nums">
                  {hero.pct}%
                </span>
              </div>
              <div className="mt-3">
                <YellowBar widthPct={barWidth(hero.pct)} />
              </div>
            </motion.div>
          ) : null}

          <div className="grid grid-cols-2 gap-x-12 gap-y-6">
            {rest.slice(0, 4).map((opt) => (
              <motion.div
                layout
                key={opt.value}
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-[18px] font-medium leading-7">{opt.value}</span>
                  <span className="shrink-0 text-[18px] tabular-nums" style={{ color: C.soft }}>
                    {opt.pct}%
                  </span>
                </div>
                <div className="mt-2">
                  <YellowBar widthPct={barWidth(opt.pct)} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </CardShell>
  );
}

/** Question 2: Engagement Mix */
function ListCard({
  eyebrow,
  title,
  options,
}: {
  eyebrow: string;
  title: string;
  options: RankedOption[];
}) {
  return (
    <CardShell eyebrow={eyebrow} title={title}>
      {!options.length ? (
        <EmptyOptions />
      ) : (
        <div className="flex flex-col gap-10 pt-4">
          {options.map((opt) => (
            <motion.div
              layout
              key={opt.value}
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-[18px] font-medium leading-7">{opt.value}</span>
                <span className="text-[18px] font-semibold tabular-nums">{opt.pct}%</span>
              </div>
              <div className="mt-2">
                <YellowBar widthPct={barWidth(opt.pct)} />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </CardShell>
  );
}

/** Question 3: Outsourcing Status */
function MaturityCard({
  eyebrow,
  title,
  options,
}: {
  eyebrow: string;
  title: string;
  options: RankedOption[];
}) {
  return (
    <CardShell eyebrow={eyebrow} title={title}>
      {!options.length ? (
        <EmptyOptions />
      ) : (
        <div className="flex flex-col justify-center gap-8 pt-4">
          {options.map((opt) => (
            <motion.div
              layout
              key={opt.value}
              className="flex items-center gap-4"
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
            >
              <span className="w-[5.5rem] shrink-0 text-[48px] font-extrabold leading-[56px] tracking-[-0.04em] tabular-nums sm:text-[56px] sm:leading-[56px]">
                {opt.pct}%
              </span>
              <span className="min-w-[4rem] text-[18px] font-medium leading-7">{opt.value}</span>
              <div className="min-w-0 flex-1">
                <YellowBar widthPct={barWidth(opt.pct)} />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </CardShell>
  );
}

/** Question 4: Client Disposition */
function GridCard({
  eyebrow,
  title,
  options,
}: {
  eyebrow: string;
  title: string;
  options: RankedOption[];
}) {
  return (
    <CardShell eyebrow={eyebrow} title={title}>
      {!options.length ? (
        <EmptyOptions />
      ) : (
        <div className="grid h-full grid-cols-2 gap-8 pt-4">
          {options.slice(0, 4).map((opt) => (
            <motion.div
              layout
              key={opt.value}
              className="flex flex-col justify-between rounded-xl px-5 py-5"
              style={{ backgroundColor: C.chip }}
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
            >
              <p className="text-[16px] font-medium leading-snug" style={{ color: C.soft }}>
                {opt.value}
              </p>
              <div className="mt-6">
                <p className="text-[48px] font-bold leading-[56px] tracking-[-0.02em] tabular-nums">
                  {opt.pct}%
                </p>
                <div className="mt-4 max-w-[7rem]">
                  <YellowBar widthPct={barWidth(opt.pct)} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </CardShell>
  );
}

/** Question 5: Future Areas */
function ColumnsCard({
  eyebrow,
  title,
  options,
  respondents,
}: {
  eyebrow: string;
  title: string;
  options: RankedOption[];
  respondents: number;
}) {
  return (
    <CardShell
      eyebrow={eyebrow}
      title={title}
      rightMeta={
        <p
          className="shrink-0 border-l pl-4 pt-1 text-[14px] font-bold uppercase leading-5 tracking-[0.1em]"
          style={{ color: C.muted, borderColor: C.border }}
        >
          N = {respondents} Respondents
        </p>
      }
    >
      {!options.length ? (
        <EmptyOptions />
      ) : (
        <div className="flex items-end justify-between gap-6 overflow-x-auto pt-2">
          {options.map((opt) => {
            const fill = barWidth(opt.pct);
            return (
              <motion.div
                layout
                key={opt.value}
                className="flex min-w-[6.5rem] flex-1 flex-col items-center"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              >
                <div
                  className="relative flex h-52 w-full max-w-[9rem] flex-col justify-end overflow-hidden rounded-xl"
                  style={{ backgroundColor: C.track }}
                >
                  <motion.div
                    className="absolute inset-x-0 bottom-0"
                    style={{
                      backgroundColor: C.yellow,
                      boxShadow: "0px 0px 10px 0px rgba(255, 230, 0, 0.2)",
                    }}
                    animate={{ height: `${fill}%` }}
                    transition={{ duration: 0.5 }}
                  />
                  <div className="relative z-10 flex flex-1 items-center justify-center">
                    <span className="text-[32px] font-bold leading-10 tabular-nums">{opt.pct}%</span>
                  </div>
                </div>
                <p
                  className="mt-4 text-center text-[14px] font-bold uppercase leading-5 tracking-[0.1em]"
                  style={{ color: C.muted }}
                >
                  {opt.value}
                </p>
              </motion.div>
            );
          })}
        </div>
      )}
    </CardShell>
  );
}
