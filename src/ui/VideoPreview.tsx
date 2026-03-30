"use client";
import { AnimatePresence, motion } from "motion/react";
import React, { useState, useRef } from "react";
import { ChevronLeft, Play } from "lucide-react";
import Image from "next/image";

interface VideoPreviewProps {
  className?: string;
  videoSrc: string;
  thumbnailSrc?: string;
}

const VideoPreview: React.FC<VideoPreviewProps> = ({
  className,
  videoSrc,
  thumbnailSrc,
}) => {
  const [playVideo, setPlayVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleClose = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setPlayVideo(false);
  };

  return (
    <>
      {/* Preview Container */}
      <motion.div
        onClick={() => setPlayVideo(true)}
        className={`relative h-[30vh] bg-white rounded-[20px] w-full max-w-lg min-w-[280px] flex justify-center items-center border-1 border-navy border-r-[4px] border-b-[4px] cursor-pointer ${className}`}
      >
        <div className="relative h-full w-full object-cover text-navy rounded-[20px] bg-[#8d99aec2] hover:-translate-x-[4px] hover:-translate-y-[4px] transition duration-200 overflow-hidden">
          {!playVideo && (
            <>
              <Play
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mx-auto opacity-80 z-10 bg-navy text-beige rounded-full p-2 cursor-pointer shadow-md"
                size={48}
              />
              {thumbnailSrc && (
                <Image
                  src={thumbnailSrc}
                  alt="Demo Video"
                  fill
                  sizes="(max-width: 768px) 100vw, 30vh"
                  className="w-full h-full object-cover rounded-[20px]"
                />
              )}
              {!thumbnailSrc && (
                <div className="h3 h-full flex justify-center items-center font-bold tracking-widest text-[#3c4555]">
                  Demo Video
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>

      {/* Fullscreen Video Popup (in container) */}
      <AnimatePresence>
        {playVideo && (
          <motion.div
            key="fullscreen-video"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="absolute inset-0 flex rounded-[20px] justify-center items-center z-[100] bg-transparent backdrop-blur-md"
            onClick={handleClose}
          >
            {/* Back Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClose();
              }}
              className="absolute cursor-pointer top-[2em] left-6 bg-white border-navy border-1 shadow-md text-navy p-2 rounded-full z-110 hover:scale-105 transition-transform"
            >
              <ChevronLeft size={20} />
            </button>

            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="w-full h-full max-w-[95%] max-h-[90%] overflow-hidden rounded-[20px] shadow-2xl bg-black flex items-center justify-center p-2"
              onClick={(e) => e.stopPropagation()}
            >
              <video
                ref={videoRef}
                src={videoSrc}
                controls
                autoPlay
                className="w-full h-full object-contain rounded-[14px]"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default VideoPreview;
