import { PROVIDER_META, VOICE_PROVIDERS } from "../../../types";
import type { VoiceProvider } from "../../../types";

interface ProviderBadgeProps {
  provider: string;
}

export function ProviderBadge({ provider }: ProviderBadgeProps) {
  const isKnown = (VOICE_PROVIDERS as readonly string[]).includes(provider);
  const meta = isKnown
    ? PROVIDER_META[provider as VoiceProvider]
    : { label: provider, color: "#6B7280" };

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
      style={{
        backgroundColor: `${meta.color}18`,
        color: meta.color,
        border: `1px solid ${meta.color}40`,
      }}
    >
      <span
        className="size-1.5 rounded-full"
        style={{ backgroundColor: meta.color }}
      />
      {meta.label}
    </span>
  );
}
