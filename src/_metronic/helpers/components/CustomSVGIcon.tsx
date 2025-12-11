import {FC} from 'react'
import {toAbsoluteUrl} from '../AssetHelpers'

interface CustomSVGIconProps {
  iconName: string
  className?: string
}

const CustomSVGIcon: FC<CustomSVGIconProps> = ({iconName, className = 'fs-2'}) => {
  return (
    <img 
      src={toAbsoluteUrl(`/media/icons/custom/${iconName}.svg`)} 
      alt={iconName}
      className={className}
      style={{width: '24px', height: '24px'}}
    />
  )
}

export {CustomSVGIcon}

// Usage dalam AsideMenuMain.tsx:
// <CustomSVGIcon iconName='home' className='fs-2' />