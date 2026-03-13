import {useRef, useState} from 'react'
import {motion, useMotionValue, useSpring} from 'framer-motion'

interface TiltedCardProps {
  imageSrc?: string
  altText?: string
  title: string
  supplier: string
  quantity: number
  unit: string
  price?: number
  onClick?: () => void
}

const TiltedCard: React.FC<TiltedCardProps> = ({
  imageSrc,
  altText = 'Product image',
  title,
  supplier,
  quantity,
  unit,
  price,
  onClick
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const [lastY, setLastY] = useState(0)
  const [imgError, setImgError] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(useMotionValue(0), {damping: 30, stiffness: 100, mass: 2})
  const rotateY = useSpring(useMotionValue(0), {damping: 30, stiffness: 100, mass: 2})
  const scale = useSpring(1, {damping: 30, stiffness: 100, mass: 2})
  const opacity = useSpring(0)

  const showPlaceholder = !imageSrc || imgError

  function handleMouse(e: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const offsetX = e.clientX - rect.left - rect.width / 2
    const offsetY = e.clientY - rect.top - rect.height / 2
    const rotationX = (offsetY / (rect.height / 2)) * -12
    const rotationY = (offsetX / (rect.width / 2)) * 12
    rotateX.set(rotationX)
    rotateY.set(rotationY)
    x.set(e.clientX - rect.left)
    y.set(e.clientY - rect.top)
    setLastY(offsetY)
  }

  function handleMouseEnter() {
    scale.set(1.15)
    opacity.set(1)
    setIsHovered(true)
  }

  function handleMouseLeave() {
    opacity.set(0)
    scale.set(1)
    rotateX.set(0)
    rotateY.set(0)
    setIsHovered(false)
  }

  return (
    <div
      ref={ref}
      className='position-relative'
      style={{
        perspective: '800px',
        cursor: 'pointer',
        zIndex: isHovered ? 10 : 1,
        position: 'relative'
      }}
      onMouseMove={handleMouse}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          scale,
          transformStyle: 'preserve-3d'
        }}
        className='card h-100'
      >
        {/* Image */}
        {showPlaceholder ? (
          <div
            style={{
              height: '200px',
              backgroundColor: '#EDE8E3',
              borderRadius: '0.625rem 0.625rem 0 0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='48'
              height='48'
              viewBox='0 0 24 24'
              fill='none'
              stroke='#B7ADA6'
              strokeWidth='1.5'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <rect x='2' y='7' width='20' height='14' rx='2' ry='2' />
              <path d='M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2' />
              <line x1='12' y1='12' x2='12' y2='16' />
              <line x1='10' y1='14' x2='14' y2='14' />
            </svg>
            <span style={{fontSize: '11px', color: '#B7ADA6', fontWeight: 500}}>Belum ada foto</span>
          </div>
        ) : (
          <img
            src={imageSrc}
            alt={altText}
            onError={() => setImgError(true)}
            style={{
              height: '200px',
              width: '100%',
              objectFit: 'cover',
              borderRadius: '0.625rem 0.625rem 0 0',
              display: 'block',
            }}
          />
        )}

        {/* Content */}
        <div className='card-body'>
          <h5 className='card-title fw-bold mb-2'>{title}</h5>
          <p className='card-text text-muted fs-7 mb-3'>{supplier}</p>

          <div className='d-flex justify-content-between align-items-center'>
            <span className='badge badge-light-primary'>
              Stock: {quantity} {unit}
            </span>
            {price && (
              <span className='fw-bold text-primary'>
                Rp {price.toLocaleString('id-ID')}
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Tooltip */}
      <motion.div
        style={{
          x,
          y,
          opacity,
          position: 'absolute',
          pointerEvents: 'none',
          left: 0,
          top: 0,
          backgroundColor: '#fff',
          padding: '4px 10px',
          borderRadius: '4px',
          fontSize: '10px',
          color: '#2d2d2d',
          zIndex: 3
        }}
      >
        {title}
      </motion.div>
    </div>
  )
}

export default TiltedCard