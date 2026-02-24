const LOGO_URL = "https://www.modoouniform.com/icons/modoo_logo.png";
const HOME_URL = "https://www.modoouniform.com/home";

interface SiteLogoProps {
  className?: string;
  height?: number;
}

export function SiteLogo({ className = "", height = 32 }: SiteLogoProps) {
  return (
    <a
      href={HOME_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center ${className}`}
      aria-label="모두의 유니폼 홈으로 이동"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={LOGO_URL}
        alt="모두의 유니폼"
        className="h-8 w-auto"
        style={{ height: `${height}px` }}
      />
    </a>
  );
}
