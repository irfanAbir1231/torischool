import { cn } from "@/lib/utils";
import Image from "next/image";

type ResponsiveVideoProps = {
  source: string | null;
  title: string;
  status?: string;
  className?: string;
  poster?: string | null;
};

function getEmbedUrl(source: string | null) {
  if (!source) return null;

  try {
    const url = new URL(source);

    if (url.hostname === "youtu.be") {
      const videoId = url.pathname.slice(1);
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }

    if (url.hostname === "www.youtube.com" || url.hostname === "youtube.com") {
      const videoId = url.searchParams.get("v");
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }

    if (url.hostname === "vimeo.com" || url.hostname === "www.vimeo.com") {
      const videoId = url.pathname.split("/").filter(Boolean).at(-1);
      return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
    }
  } catch {
    return null;
  }

  return null;
}

export function ResponsiveVideo({ source, title, status = "Video coming soon", className, poster }: ResponsiveVideoProps) {
  const embedUrl = getEmbedUrl(source);

  return (
    <div className={cn("aspect-video w-full max-w-5xl overflow-hidden rounded-2xl border border-line bg-ink", className)}>
      {embedUrl ? (
        <iframe
          className="h-full w-full"
          src={embedUrl}
          title={title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      ) : (
        <div className="relative flex h-full flex-col items-center justify-center overflow-hidden px-6 text-center text-cream">
          {poster ? <Image src={poster} alt="" fill sizes="(max-width: 1024px) 100vw, 1024px" className="object-cover opacity-65" /> : null}
          <div className="absolute inset-0 bg-ink/45" />
          <div className="relative z-10 flex flex-col items-center">
          <span aria-hidden="true" className="mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-cream/40">
            <svg viewBox="0 0 24 24" className="ml-1 h-5 w-5 fill-current" focusable="false">
              <path d="M8 5.5v13l10-6.5-10-6.5Z" />
            </svg>
          </span>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cream/70">Tori School</p>
          <p className="mt-3 text-lg font-medium tracking-[-0.01em] sm:text-xl">{title}</p>
          <p className="mt-2 text-sm text-cream/65">{status}</p>
          </div>
        </div>
      )}
    </div>
  );
}
