import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  href?: string;
  className?: string;
}

export function Logo({
  href = "/",
  className,
}: LogoProps) {
  const content = (
    <img
      src="/brand/macwav-logo.svg"
      alt="macwav logo"
      className={cn("block h-auto w-full object-contain", className)}
      loading="eager"
      decoding="async"
    />
  );

  if (!href) {
    return content;
  }

  return (
    <Link href={href} className="inline-flex items-center">
      {content}
    </Link>
  );
}
