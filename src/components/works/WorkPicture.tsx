"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { VideoLightbox } from "./VideoLightbox";

type WorkPictureProps = {
  src: string;
  kind: "video" | "image";
  alt: string;
  title: string;
  posterFallback?: string;
  priority?: boolean;
};

export function WorkPicture({
  src,
  kind,
  alt,
  title,
  posterFallback,
  priority = false,
}: WorkPictureProps) {
  const [open, setOpen] = useState(false);
  const thumbRef = useRef<HTMLVideoElement>(null);

  // Seek the thumbnail video to ~0.5s so the frame is meaningful,
  // not a black/empty first frame.
  const handleLoadedMetadata = () => {
    const v = thumbRef.current;
    if (v && v.duration > 0.6) v.currentTime = 0.5;
  };

  return (
    <>
      <div className="work-picture-v3__inner">
        {kind === "video" ? (
          <>
            <video
              ref={thumbRef}
              className="work-picture-v3__media"
              src={src}
              preload="metadata"
              muted
              playsInline
              poster={posterFallback}
              onLoadedMetadata={handleLoadedMetadata}
            />
            <button
              type="button"
              className="work-picture-v3__play"
              aria-label={`Play ${title} preview`}
              onClick={() => setOpen(true)}
            >
              <svg width="22" height="24" viewBox="0 0 22 24" aria-hidden>
                <path
                  d="M2 1.5v21l18-10.5L2 1.5z"
                  fill="currentColor"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </>
        ) : (
          <Image
            className="work-picture-v3__media"
            src={src}
            alt={alt}
            fill
            sizes="(max-width: 1200px) 40vw, 480px"
            priority={priority}
          />
        )}
      </div>

      {kind === "video" && (
        <VideoLightbox
          src={src}
          open={open}
          onClose={() => setOpen(false)}
          title={title}
        />
      )}
    </>
  );
}
