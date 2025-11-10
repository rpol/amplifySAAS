"use client";

import { type SVGProps } from "react";

import type { SimpleIcon as SimpleIconDescriptor } from "simple-icons";

import { cn } from "@/lib/utils";

type SimpleIconProps = {
  icon: SimpleIconDescriptor;
  className?: string;
} & SVGProps<SVGSVGElement>;

export function SimpleIcon({ icon, className, ...props }: SimpleIconProps) {
  const { title, path } = icon;

  return (
    <svg
      viewBox="0 0 24 24"
      aria-label={title}
      aria-hidden="false"
      focusable="false"
      className={cn("fill-foreground size-5", className)}
      {...props}
    >
      <title>{title}</title>
      <path d={path} />
    </svg>
  );
}
