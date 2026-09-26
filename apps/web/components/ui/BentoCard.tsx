import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface BentoCardProps {
  title: string;
  category: string;
  description: string;
  slug: string;
  className?: string;
  children: React.ReactNode;
}

export function BentoCard({
  title,
  category,
  description,
  slug,
  className,
  children,
}: BentoCardProps) {
  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white dark:bg-ink-800 border border-ink/10 dark:border-paper/10 p-5 sm:p-6 hover:shadow-xl hover:border-ultramarine/40 transition-all duration-300",
        className
      )}
    >
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-ink/50 dark:text-paper/50">
            {category}
          </span>
          <Link
            href={`/modules/${slug}`}
            className="text-ink/40 dark:text-paper/40 group-hover:text-ultramarine group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all p-1"
            aria-label={`Learn more about ${title}`}
          >
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
        <h3 className="font-display font-bold text-lg text-ink dark:text-paper mb-1">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-ink/70 dark:text-paper/70 leading-relaxed mb-4">
          {description}
        </p>
      </div>

      {/* Embedded interactive visual element */}
      <div className="mt-2 w-full">{children}</div>
    </div>
  );
}
