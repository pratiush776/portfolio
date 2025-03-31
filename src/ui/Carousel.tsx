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
    <div className="carousel  carousel-center min-h-fit  rounded-box max-w-md space-x-4 p-4">
      {videos?.map((video: string, index: number) => (
        <div key={index} className="carousel-item">
          <VideoPreview videoSrc={video} />
        </div>
      ))}
      {imgs?.map((img: string, index: number) => (
        <div className="carousel-item " key={index}>
          <Zoom>
            <Image
              alt="demo image"
              width={230}
              height={460}
              src={img}
              className="rounded-box"
            />
          </Zoom>
        </div>
      ))}
    </div>
  );
};

export default Carousel;
