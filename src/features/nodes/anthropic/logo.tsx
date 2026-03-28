import type { SVGProps } from "react";

export function AnthropicLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path d="M16.143 2H7.857L.429 14.857h3.714L7 8.143h10l2.857 6.714h3.714zm-4.714 6.143h1.143l3.429 8h-3.429L12 14.857H9.429L8.857 16.143H5.429zM10 13.571h4l-2-4.714z" />
    </svg>
  );
}
