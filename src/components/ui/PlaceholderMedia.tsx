import Image from "next/image";

import { cn } from "@/lib/utils";

type PlaceholderMediaProps = {
  label: string;
  image?: string | null;
  aspectClass?: string;
  labelClassName?: string;
  className?: string;
};

export function PlaceholderMedia({ label, image, aspectClass = "aspect-[4/5]", labelClassName = "text-muted", className }: PlaceholderMediaProps) {
  if (image) {
    return (
      <div className={cn(aspectClass, "relative overflow-hidden bg-surface", className)}>
        <Image src={image} alt={label} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
      </div>
    );
  }

  return (
    <div className={cn(aspectClass, "relative flex overflow-hidden border border-line bg-surface p-5", className)}>
      <div aria-hidden="true" className="absolute inset-4 border border-ink/10" />
      <p className={cn("relative mt-auto max-w-[14rem] text-sm leading-6", labelClassName)}>{label}</p>
    </div>
  );
}
