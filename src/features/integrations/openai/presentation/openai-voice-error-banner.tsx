interface OpenAIVoiceErrorBannerProps {
  error?: string | null;
}

export function OpenAIVoiceErrorBanner({ error }: OpenAIVoiceErrorBannerProps) {
  if (!error) return null;

  return (
    <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
      {error}
    </div>
  );
}
