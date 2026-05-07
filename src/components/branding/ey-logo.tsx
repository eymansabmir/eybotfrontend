import { cn } from "@/lib/utils";

interface EYLogoProps {
  className?: string;
}

export function EYLogo({ className }: EYLogoProps) {
  return (
    <svg
      viewBox="0 0 101.7 102.6"
      preserveAspectRatio="xMidYMid meet"
      aria-label="EY"
      role="img"
      className={cn("block h-full w-auto", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <polygon points="101.7,0 0,36.8 101.7,19" fill="#FFE600" />
      <path
        d="M16.4,90.9h25.7v11.7H1V51.7h29.2L37,63.4H16.4v8.4H35v10.7H16.4V90.9z M69.5,51.7l-8.7,16.6
        l-8.7-16.6H35l18,30.8v20.1h15.4V82.5l18-30.8H69.5z"
        fill="currentColor"
      />
    </svg>
  );
}
