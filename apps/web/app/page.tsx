import Link from "next/link";
import { Github } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background via-background to-muted/20">
      <div className="w-full max-w-2xl">
        {/* Main Content Card */}
        <div className="relative">
          {/* Decorative gradient blur */}
          <div className="absolute inset-0 -z-10 blur-3xl opacity-20">
            <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary rounded-full" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/50 rounded-full" />
          </div>

          <div className="text-center space-y-8">
            {/* Header */}
            <div className="space-y-3">
              <h1 className="text-5xl sm:text-6xl font-bold tracking-tight">
                Micro SaaS Boilerplate
              </h1>
              <p className="text-lg text-muted-foreground">
                Next.js + shadcn/ui starter
              </p>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 max-w-md mx-auto">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Example pages
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Example Pages Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-2xl mx-auto">
              <Link
                href="/landing-page"
                className="group relative px-8 py-4 border-2 rounded-xl font-medium hover:border-primary hover:bg-primary/5 transition-all hover:scale-105"
              >
                <span className="relative z-10">Landing Page</span>
              </Link>
              <Link
                href="/dashboard"
                className="group relative px-8 py-4 border-2 rounded-xl font-medium hover:border-primary hover:bg-primary/5 transition-all hover:scale-105"
              >
                <span className="relative z-10">Dashboard</span>
              </Link>
              <Link
                href="/trpc-demo"
                className="group relative px-8 py-4 border-2 rounded-xl font-medium hover:border-primary hover:bg-primary/5 transition-all hover:scale-105"
              >
                <span className="relative z-10">tRPC Demo</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
