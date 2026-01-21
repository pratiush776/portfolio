import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useRef } from "react";
import { ChevronLeft, Play } from "lucide-react"; // adjust import accordingly
import Image from "next/image";

interface VideoPreviewProps {
  className?: string;
  videoSrc: string; // URL of the video
  thumbnailSrc?: string; // URL of the thumbnail
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
        className={`relative h-[30vh] bg-white rounded-[20px] w-[90%] flex justify-center items-center border-1 border-navy border-r-[4px] border-b-[4px] cursor-pointer ${className}`}
      >
        <div className="relative h-full w-full aspect-square object-cover text-navy  rounded-[20px] bg-[#8d99aec2] hover:translate-0 -translate-[8px]">
          {!playVideo && (
            <>
              <Play
                className="absolute top-1/2 left-1/2 -translate-1/2 mx-auto opacity-80 z-10 bg-navy text-beige rounded-full p-2 cursor-pointer "
                size={36}
              />
              {thumbnailSrc && (
                <Image
                  src={thumbnailSrc}
                  alt="Demo Video"
                  fill
                  sizes="30vh"
                  className="w-full h-full object-cover rounded-[20px]"
                />
              )}
              {
                <div className="h3 h-full flex justify-center items-center ">
                  Demo
                </div>
              }
            </>
          )}
        </div>
      </motion.div>

      {/* Fullscreen Video Overlay */}
      <AnimatePresence>
        {playVideo && (
          <motion.div
            key="fullscreen-video"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="fixed pb-[1em] bottom-0 inset-0 bg-black flex rounded-[20px] justify-center items-center z-50"
            onClick={handleClose} // clicking the overlay closes it
          >
            {/* Back Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClose();
              }}
              className="absolute cursor-pointer top-[2em] left-5 bg-white text-navy p-2 rounded-full z-51"
            >
              <ChevronLeft size={16} />
            </button>

            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="w-full h-full max-w-5xl max-h-[90vh] overflow-hidden rounded-[20px]"
              onClick={(e) => e.stopPropagation()} // prevent closing when clicking video container
            >
              <video
                ref={videoRef}
                src={videoSrc}
                controls
                autoPlay
                loop
                muted
                className="w-full h-full "
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default VideoPreview;
