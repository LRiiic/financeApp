import { React } from "react";
import { useState, useEffect } from "react"
import './style.css';

export default function Carousel({
  children: slides,
  autoSlide = false,
  autoSlideInterval = 3000,
}) {
  const [curr, setCurr] = useState(0)

  const prev = () =>
    setCurr((curr) => (curr === 0 ? slides.length - 1 : curr - 1))
  const next = () =>
    setCurr((curr) => (curr === slides.length - 1 ? 0 : curr + 1))

  useEffect(() => {
    if (!autoSlide) return
    const slideInterval = setInterval(next, autoSlideInterval)
    return () => clearInterval(slideInterval)
  }, [])
  return (
    <div className="carousel">
      <div
        className="carousel__slide"
        style={{ transform: `translateX(-${curr * 100}%)` }}
      >
        {slides}
      </div>
      <div className="carousel__actions">
        <button onClick={prev} className="carousel-prev"><i></i></button>
        <button onClick={next} className="carousel-next"><i></i></button>
      </div>

      <div className="carousel__dots">
        <div className="dots__container">
          {slides.map((_, i) => (
            <div
              className={`dots ${curr === i ? "p-2" : "bg-opacity-50"}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}