"use client";

import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useRef, ReactNode } from "react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(SplitText, ScrollTrigger);
}

interface TextBlockAnimationProps {
  children: ReactNode;
  animateOnScroll?: boolean;
  delay?: number;
  blockColor?: string;
  stagger?: number;
  duration?: number;
}

export default function TextBlockAnimation({
  children,
  animateOnScroll = true,
  delay = 0,
  blockColor = "#6366f1",
  stagger = 0.1,
  duration = 0.6,
}: TextBlockAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current) return;

    const split = new SplitText(containerRef.current, {
      type: "lines",
      linesClass: "split-line",
    });

    const lines = split.lines as HTMLElement[];
    const blocks: HTMLElement[] = [];

    lines.forEach((line) => {
      const wrapper = document.createElement("div");
      wrapper.style.cssText = "position:relative;display:block;overflow:hidden;";

      const block = document.createElement("div");
      block.style.cssText = `position:absolute;top:0;left:0;width:100%;height:100%;background-color:${blockColor};z-index:2;transform:scaleX(0);transform-origin:left center;`;

      if (line.parentNode) {
        line.parentNode.insertBefore(wrapper, line);
        wrapper.appendChild(line);
        wrapper.appendChild(block);
      }

      gsap.set(line, { opacity: 0 });
      blocks.push(block);
    });

    const tl = gsap.timeline({
      defaults: { ease: "expo.inOut" },
      scrollTrigger: animateOnScroll ? {
        trigger: containerRef.current,
        start: "top 85%",
        toggleActions: "play none none reverse",
      } : undefined,
      delay,
    });

    tl.to(blocks, { scaleX: 1, duration, stagger, transformOrigin: "left center" })
      .set(lines, { opacity: 1, stagger }, `<${duration / 2}`)
      .to(blocks, { scaleX: 0, duration, stagger, transformOrigin: "right center" }, `<${duration * 0.4}`);

  }, { scope: containerRef, dependencies: [animateOnScroll, delay, blockColor, stagger, duration] });

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      {children}
    </div>
  );
}
