import Link from "next/link";
import { Github } from "lucide-react";

export function SiteBanner() {
  return (
    <div className="border-b bg-muted/40 px-4 py-2">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Built by</span>
          <Link
            href="https://github.com/washingtonserip"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium hover:underline"
          >
            @washingtonserip
          </Link>
        </div>
        <span className="text-muted-foreground">•</span>
        <Link
          href="https://github.com/washingtonserip/micro-saas-boilerplate"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 font-medium hover:underline"
        >
          <Github className="h-4 w-4" />
          <span className="hidden sm:inline">View on GitHub</span>
          <span className="sm:hidden">GitHub</span>
        </Link>
      </div>
    </div>
  );
}
