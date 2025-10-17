// ImageGallery.jsx
import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Thumbs } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import { AiOutlineClose } from "react-icons/ai"; // react-icons dan close icon
import { MdOutlineImageNotSupported } from "react-icons/md";
import { baseURL } from "../../../api/path";

export default function ImageGallery({ images }) {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <div className="relative z-0 sm:z-11">
      {/* BIG SLIDER */}
      {images.length !== 0 ? (
        <Swiper
          loop
          autoplay={{ delay: 3000 }}
          modules={[Autoplay, Navigation, Thumbs]}
          navigation
          thumbs={{ swiper: thumbsSwiper }}
          className="rounded-xl shadow mb-4 relative z-0"
        >
          {images?.map((imgId) => (
            <SwiperSlide key={imgId}>
              <img
                src={`${baseURL}/file/download/${imgId}`}
                alt="Vacancy"
                className="w-full h-[250px] object-cover rounded-xl cursor-pointer"
                onClick={(e) => {
                  if (
                    !e.target.closest(".swiper-button-next") &&
                    !e.target.closest(".swiper-button-prev")
                  ) {
                    setSelectedImage(
                      `${baseURL}/file/download/${imgId}`
                    );
                  }
                }}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <MdOutlineImageNotSupported className="w-full  h-[250px] object-cover rounded-xl cursor-pointer" />
      )}

      {/* THUMBNAILS */}
      <Swiper
        onSwiper={setThumbsSwiper}
        slidesPerView={3}
        breakpoints={{ 640: { slidesPerView: 4 } }}
        spaceBetween={10}
        watchSlidesProgress
        modules={[Thumbs]}
        className="rounded-lg relative z-0"
      >
        {images?.map((imgId) => (
          <SwiperSlide key={imgId}>
            <img
              src={`${baseURL}/file/download/${imgId}`}
              alt="Vacancy thumb"
              className="w-full h-20 sm:h-24 object-cover rounded-md border cursor-pointer"
            />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* MODAL */}
      {selectedImage && (
        <div className="fixed  inset-0 bg-black/20 flex items-center justify-center z-[9999]">
          <div className="relative  p-4">
            {/* CLOSE BUTTON */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute z-20 top-10 close right-10 text-[red] bg-black cursor-pointer hover:bg-black/80 rounded-full p-2 transition"
            >
              <AiOutlineClose size={24} />
            </button>

            {/* IMAGE */}
            <img
              src={selectedImage}
              alt="Preview"
              className="max-h-[90vh] w-auto mx-auto rounded-lg shadow-lg"
            />
          </div>

          {/* BACKDROP */}
          <div
            className="absolute inset-0"
            onClick={() => setSelectedImage(null)}
          />
        </div>
      )}
    </div>
  );
}
