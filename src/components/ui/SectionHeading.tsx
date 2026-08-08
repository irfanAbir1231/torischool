import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
};

export function SectionHeading({ eyebrow, title, description, align = "left" }: SectionHeadingProps) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center")}>
      {eyebrow ? <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-accent">{eyebrow}</p> : null}
      <h2 className="text-3xl font-semibold tracking-[-0.03em] text-ink sm:text-4xl">{title}</h2>
      {description ? <p className="mt-5 text-base leading-8 text-muted">{description}</p> : null}
    </div>
  );
}
