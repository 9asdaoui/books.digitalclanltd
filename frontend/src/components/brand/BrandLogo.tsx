import { Link } from "react-router-dom";
import { BrandMarkSvg } from "./BrandMarkSvg";
import { cn } from "../../lib/cn";

type BrandLogoProps = {
  variant?: "mark" | "wordmark" | "full";
  size?: "sm" | "md" | "lg";
  className?: string;
  href?: string;
  onDark?: boolean;
};

const markSizes = { sm: 32, md: 40, lg: 52 };
const textSizes = {
  sm: { title: "text-sm", sub: "text-[9px]" },
  md: { title: "text-sm", sub: "text-[10px]" },
  lg: { title: "text-xl", sub: "text-xs" },
};

export function BrandLogo({
  variant = "full",
  size = "md",
  className,
  href = "/",
  onDark = true,
}: BrandLogoProps) {
  const markPx = markSizes[size];
  const text = textSizes[size];

  const content = (
    <>
      {(variant === "mark" || variant === "full") && (
        <BrandMarkSvg size={markPx} className="shrink-0" idPrefix={`logo-${size}`} />
      )}
      {(variant === "wordmark" || variant === "full") && (
        <div className={cn(variant === "full" && "ml-3")}>
          <p
            className={cn(
              "text-display font-bold leading-none tracking-tight",
              text.title,
              onDark ? "text-surface-100" : "text-surface-900",
            )}
          >
            Digital Clan
          </p>
          <p className={cn("mt-0.5 font-semibold uppercase tracking-[0.22em]", text.sub, "text-accent-gold")}>
            Books
          </p>
        </div>
      )}
    </>
  );

  if (href) {
    return (
      <Link to={href} className={cn("inline-flex items-center", className)} aria-label="Digital Clan Books home">
        {content}
      </Link>
    );
  }

  return <div className={cn("inline-flex items-center", className)}>{content}</div>;
}
