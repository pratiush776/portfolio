import React from "react";
import VideoPreview from "./VideoPreview";
import Image from "next/image";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";

interface CarouselProps {
  videos?: string[];
  imgs?: string[];
}
const Carousel: React.FC<CarouselProps> = ({ videos, imgs }) => {
  return (
    <div className="carousel  carousel-center min-h-fit  rounded-box max-w-full space-x-4 p-4">
      {videos?.map((video: string, index: number) => (
        <div key={index} className="carousel-item">
          <VideoPreview videoSrc={video} />
        </div>
      ))}
      {imgs?.map((img: string, index: number) => (
        <div
          className="carousel-item border-navy border-1 border-r-[4px] border-b-[4px] rounded-[20px] "
          key={index}
        >
          <Zoom>
            <img
              alt="project screenshot"
              src={img}
              className="rounded-[20px] h-[min(40vh,400px)] w-auto max-w-[85vw] object-contain opacity-90 cursor-zoom-in"
              style={{ objectPosition: "top center" }}
            />
          </Zoom>
        </div>
      ))}
    </div>
  );
};

export default Carousel;
