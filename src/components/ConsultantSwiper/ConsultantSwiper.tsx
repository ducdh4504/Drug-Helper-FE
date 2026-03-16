import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Pagination } from "swiper/modules"
import { useRef } from "react"
import "swiper/css/navigation"
import "swiper/css/pagination"
import "./ConsultantSwiper.scss"
import ConsultantBox from "../ConsultantBox/ConsultantBox"
import type { Users } from "../../types/interfaces/User"
import { useNavigate } from "react-router-dom"

interface ConsultantSwiperProps {
  consultants: Users[]
}

const ConsultantSwiper = ({ consultants }: ConsultantSwiperProps) => {
  const swiperRef = useRef<any>(null)
  const navigate = useNavigate()

  const handlePrev = () => {
    if (swiperRef.current) {
      swiperRef.current.slidePrev()
    }
  }

  const handleNext = () => {
    if (swiperRef.current) {
      swiperRef.current.slideNext()
    }
  }

  return (
    <div className="consultant__swiper-container">
      <Swiper
        modules={[Navigation, Pagination]}
        spaceBetween={12}
        slidesPerView={3}
        onSwiper={(swiper) => {
          swiperRef.current = swiper
        }}
        pagination={{ clickable: true }}
        loop={true}
        className="consultant__swiper"
        breakpoints={{
          320: {
            slidesPerView: 1,
            spaceBetween: 8,
          },
          768: {
            slidesPerView: 2,
            spaceBetween: 10,
          },
          1024: {
            slidesPerView: 3,
            spaceBetween: 12,
          },
        }}
      >
        {consultants.map((c, idx) => (
          <SwiperSlide key={c.userID || idx}>
            <ConsultantBox
              user={c}
              onBooking={() => navigate(`/booking/${c.userID}`)}
              onMore={() => navigate(`/consultant/${c.userID}`)}
            />
          </SwiperSlide>
        ))}
      </Swiper>
      <div className="swiper-button-prev" onClick={handlePrev}></div>
      <div className="swiper-button-next" onClick={handleNext}></div>
    </div>
  )
}

export default ConsultantSwiper
