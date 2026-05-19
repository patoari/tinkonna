import { useState, useEffect, useRef, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

// Export transition options for settings
export const TRANSITION_OPTIONS = [
  { value: 'slide', label: 'Slide' },
  { value: 'fade', label: 'Fade' },
  { value: 'zoom', label: 'Zoom In' },
  { value: 'zoomOut', label: 'Zoom Out' },
  { value: 'slideUp', label: 'Slide Up' },
  { value: 'slideDown', label: 'Slide Down' },
  { value: 'flip', label: 'Flip' },
  { value: 'rotate', label: 'Rotate' },
  { value: 'blur', label: 'Blur' },
  { value: 'scale', label: 'Scale Bounce' },
  { value: 'kenburns', label: 'Ken Burns' },
  { value: 'crossfade', label: 'Cross Fade' },
]

export default function HeroCarousel({ 
  images = [], 
  fallbackColor = '#2563eb', 
  interval = 5000, 
  transition = 'slide',
  onSlideChange,
  children 
}) {
  const count = images.length
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [direction, setDirection] = useState('next')
  const timerRef = useRef(null)

  const goTo = useCallback((index) => {
    if (isTransitioning || index === currentIndex) return
    setDirection(index > currentIndex ? 'next' : 'prev')
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentIndex(index)
      setTimeout(() => setIsTransitioning(false), 50)
    }, 50)
  }, [currentIndex, isTransitioning])

  const goNext = useCallback(() => {
    const nextIndex = (currentIndex + 1) % count
    goTo(nextIndex)
  }, [currentIndex, count, goTo])

  const goPrev = useCallback(() => {
    const prevIndex = (currentIndex - 1 + count) % count
    goTo(prevIndex)
  }, [currentIndex, count, goTo])

  // Auto-play
  useEffect(() => {
    if (count <= 1) return
    timerRef.current = setInterval(goNext, interval)
    return () => clearInterval(timerRef.current)
  }, [count, goNext, interval])

  // Notify parent of slide change
  useEffect(() => {
    if (images[currentIndex]) {
      onSlideChange?.(images[currentIndex])
    }
  }, [currentIndex, images, onSlideChange])

  const getSlideStyle = (index) => {
    const isActive = index === currentIndex
    const isPrev = index === (currentIndex - 1 + count) % count
    const isNext = index === (currentIndex + 1) % count

    let style = {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
    }

    switch (transition) {
      case 'fade':
        style.opacity = isActive ? 1 : 0
        style.transition = 'opacity 0.8s ease-in-out'
        style.zIndex = isActive ? 2 : 1
        break

      case 'zoom':
        style.opacity = isActive ? 1 : 0
        style.transform = isActive ? 'scale(1)' : 'scale(1.2)'
        style.transition = 'opacity 0.8s ease-in-out, transform 1s ease-in-out'
        style.zIndex = isActive ? 2 : 1
        break

      case 'zoomOut':
        style.opacity = isActive ? 1 : 0
        style.transform = isActive ? 'scale(1)' : 'scale(0.8)'
        style.transition = 'opacity 0.8s ease-in-out, transform 1s ease-in-out'
        style.zIndex = isActive ? 2 : 1
        break

      case 'slideUp':
        style.transform = isActive ? 'translateY(0)' : 'translateY(100%)'
        style.transition = 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
        style.zIndex = isActive ? 2 : 1
        break

      case 'slideDown':
        style.transform = isActive ? 'translateY(0)' : 'translateY(-100%)'
        style.transition = 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
        style.zIndex = isActive ? 2 : 1
        break

      case 'flip':
        style.opacity = isActive ? 1 : 0
        style.transform = isActive ? 'rotateY(0deg)' : 'rotateY(90deg)'
        style.transition = 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease-in-out'
        style.transformStyle = 'preserve-3d'
        style.zIndex = isActive ? 2 : 1
        break

      case 'rotate':
        style.opacity = isActive ? 1 : 0
        style.transform = isActive ? 'rotate(0deg) scale(1)' : 'rotate(15deg) scale(0.9)'
        style.transition = 'transform 1s ease-in-out, opacity 0.6s ease-in-out'
        style.zIndex = isActive ? 2 : 1
        break

      case 'blur':
        style.opacity = isActive ? 1 : 0
        style.filter = isActive ? 'blur(0px)' : 'blur(10px)'
        style.transition = 'filter 0.6s ease-in-out, opacity 0.6s ease-in-out'
        style.zIndex = isActive ? 2 : 1
        break

      case 'scale':
        style.opacity = isActive ? 1 : 0
        style.transform = isActive ? 'scale(1)' : 'scale(0.5)'
        style.transition = 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.6s ease-in-out'
        style.zIndex = isActive ? 2 : 1
        break

      case 'kenburns':
        style.opacity = isActive ? 1 : 0
        style.transform = isActive ? 'scale(1.1)' : 'scale(1)'
        style.transition = isActive 
          ? 'opacity 0.8s ease-in-out, transform 8s ease-out'
          : 'opacity 0.8s ease-in-out, transform 0s'
        style.zIndex = isActive ? 2 : 1
        break

      case 'crossfade':
        style.opacity = isActive ? 1 : 0
        style.transition = 'opacity 1.2s ease-in-out'
        style.zIndex = isActive ? 2 : 1
        break

      case 'slide':
      default:
        // Classic slide effect
        if (isActive) {
          style.transform = 'translateX(0)'
          style.zIndex = 2
        } else if (direction === 'next') {
          style.transform = isPrev ? 'translateX(-100%)' : 'translateX(100%)'
          style.zIndex = 1
        } else {
          style.transform = isNext ? 'translateX(100%)' : 'translateX(-100%)'
          style.zIndex = 1
        }
        style.transition = 'transform 0.7s ease-in-out'
        break
    }

    return style
  }

  const renderSlide = (item, index) => (
    <div key={index} style={getSlideStyle(index)}>
      <img
        src={item.url}
        alt=""
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'block',
          objectFit: 'cover',
          objectPosition: 'center top',
        }}
        draggable={false}
      />
    </div>
  )

  return (
    <div
      className="relative text-white w-full"
      style={{
        // Mobile: ~220px, tablet: ~380px, desktop: ~520px — no overflow
        height: 'clamp(220px, 55vw, 520px)',
        maxWidth: '100vw',
        overflow: 'hidden',
      }}
    >
      {/* Slides container — strictly clipped to wrapper */}
      <div
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          overflow: 'hidden',
        }}
      >
        {count > 0 ? (
          images.map((item, index) => renderSlide(item, index))
        ) : (
          <div
            style={{
              position: 'absolute', inset: 0,
              background: `linear-gradient(135deg, ${fallbackColor} 0%, #1e40af 100%)`,
            }}
          />
        )}
      </div>

      {/* NO overlay — images display 100% clean */}

      {/* Content — fully interactive, above slides */}
      <div className="relative h-full" style={{ zIndex: 10 }}>{children}</div>

      {/* Navigation */}
      {count > 1 && (
        <>
          <button
            onClick={goPrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center text-white transition-colors"
            style={{ zIndex: 20 }}
            aria-label="Previous"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={goNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center text-white transition-colors"
            style={{ zIndex: 20 }}
            aria-label="Next"
          >
            <ChevronRight size={18} />
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5" style={{ zIndex: 20 }}>
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === currentIndex ? 'bg-white w-4' : 'bg-white/50 hover:bg-white/80 w-1.5'
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}