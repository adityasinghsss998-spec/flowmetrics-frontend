"use client";

import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export default function FlowMetricsLogo({ size = "md", className }: LogoProps) {
  const iconSizes = { sm: "h-7 w-7", md: "h-9 w-9", lg: "h-12 w-12", xl: "h-14 w-14" };
  const textSizes = { sm: "text-base", md: "text-xl", lg: "text-2xl", xl: "text-3xl" };

  return (
    <div className={cn("inline-flex items-center gap-3 select-none group", className)}>
      {/* Gradient border icon */}
      <div className={cn(
        "relative flex items-center justify-center rounded-xl p-[1.5px] shadow-lg shadow-indigo-500/30 transition-all duration-300 group-hover:shadow-indigo-500/50 group-hover:scale-105",
        "bg-gradient-to-br from-indigo-400 via-violet-500 to-cyan-400",
        iconSizes[size]
      )}>
        <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#08081a] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-transparent" />
          <svg viewBox="0 0 24 24" fill="none" className="h-[58%] w-[58%]" xmlns="http://www.w3.org/2000/svg">
            {/* Rising trend line with dots */}
            <polyline
              points="3,17 7,12 11,14.5 16,7 21,10"
              fill="none"
              stroke="url(#fm-grad)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Circles at key data points */}
            <circle cx="7"  cy="12"   r="1.6" fill="#818cf8" />
            <circle cx="11" cy="14.5" r="1.6" fill="#a78bfa" />
            <circle cx="16" cy="7"    r="1.6" fill="#67e8f9" />
            {/* Vertical bars at bottom */}
            <line x1="5"  y1="20" x2="5"  y2="17" stroke="url(#fm-grad)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="9"  y1="20" x2="9"  y2="15" stroke="url(#fm-grad)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="13" y1="20" x2="13" y2="17" stroke="url(#fm-grad)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="17" y1="20" x2="17" y2="13" stroke="url(#fm-grad)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="21" y1="20" x2="21" y2="17" stroke="url(#fm-grad)" strokeWidth="1.5" strokeLinecap="round" />
            <defs>
              <linearGradient id="fm-grad" x1="3" y1="7" x2="21" y2="17" gradientUnits="userSpaceOnUse">
                <stop stopColor="#818cf8" />
                <stop offset="0.5" stopColor="#c084fc" />
                <stop offset="1" stopColor="#67e8f9" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Brand text */}
      <span className={cn("font-extrabold tracking-tight text-white", textSizes[size])}>
        Flow
        <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
          Metrics
        </span>
      </span>
    </div>
  );
}
