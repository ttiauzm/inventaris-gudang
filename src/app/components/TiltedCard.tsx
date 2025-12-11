import {useRef, useState} from 'react'
import {motion, useMotionValue, useSpring} from 'framer-motion'

interface TiltedCardProps {
  imageSrc: string
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

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(useMotionValue(0), {damping: 30, stiffness: 100, mass: 2})
  const rotateY = useSpring(useMotionValue(0), {damping: 30, stiffness: 100, mass: 2})
  const scale = useSpring(1, {damping: 30, stiffness: 100, mass: 2})
  const opacity = useSpring(0)

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
    scale.set(1.05)
    opacity.set(1)
  }

  function handleMouseLeave() {
    opacity.set(0)
    scale.set(1)
    rotateX.set(0)
    rotateY.set(0)
  }

  return (
    <div
      ref={ref}
      className='position-relative'
      style={{
        perspective: '800px',
        cursor: 'pointer'
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
        <div
          style={{
            height: '200px',
            backgroundImage: `url(${imageSrc})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRadius: '0.625rem 0.625rem 0 0'
          }}
        />

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