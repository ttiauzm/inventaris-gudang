// import {FC} from 'react'
// import clsx from 'clsx'
// import {Link} from 'react-router-dom'
// import {useLocation} from 'react-router'
// import {OverlayTrigger, Tooltip} from 'react-bootstrap'
// import {checkIsActive, KTIcon, WithChildren} from '../../../helpers'
// import {useLayout} from '../../core'

// type Props = {
//   to: string
//   title: string
//   icon?: string
//   fontIcon?: string
//   customIcon?: string
//   className?: string
//   hasBullet?: boolean
//   bsTitle?: string
//   outside?: boolean
// }

// const AsideMenuItem: FC<Props & WithChildren> = ({
//   children,
//   to,
//   title,
//   icon,
//   fontIcon,
//   customIcon,
//   className,
//   bsTitle,
//   outside = false,
//   hasBullet = false,
// }) => {
//   const {pathname} = useLocation()
//   const isActive = checkIsActive(pathname, to)
//   const {config} = useLayout()
//   const {aside} = config

//   return (
//     <OverlayTrigger
//       placement='right'
//       delay={{show: 250, hide: 400}}
//       overlay={(props) => (
//         <Tooltip id='button-tooltip' {...props}>
//           {bsTitle}
//         </Tooltip>
//       )}
//     >
//       <div className={clsx('menu-item', isActive && 'here show', className)}>
//         {outside ? (
//           <a
//             href={to}
//             target='_blank'
//             className={clsx('menu-link menu-center', {active: isActive})}
//           >
//             {customIcon ? (
//               <span className='menu-icon me-0'>
//                 <img src={customIcon} alt={title} className='mh-30px' />
//               </span>
//             ) : fontIcon && aside.menuIcon === 'font' && (
//               <span className='menu-icon me-0'>
//                 <i className={clsx('bi', fontIcon, 'fs-2')}></i>
//               </span>
//             )}
//           </a>
//         ) : (
//           <>
//             <Link
//               className={clsx('menu-link menu-center', {active: isActive})}
//               to={to}
//               data-bs-toggle='tooltip'
//               data-bs-trigger='hover'
//               data-bs-dismiss='click'
//               data-bs-placement='right'
//               data-bs-original-title={bsTitle}
//             >
//               {hasBullet && (
//                 <span className='menu-bullet'>
//                   <span className='bullet bullet-dot'></span>
//                 </span>
//               )}
//               {customIcon ? (
//                 <span className='menu-icon me-0'>
//                   <img src={customIcon} alt={title} className='mh-30px' />
//                 </span>
//               ) : (
//                 <>
//                   {icon && aside.menuIcon === 'svg' && (
//                     <span className='menu-icon'>
//                       <KTIcon iconName={icon} className='fs-2' />
//                     </span>
//                   )}
//                   {fontIcon && aside.menuIcon === 'font' && (
//                     <span className='menu-icon me-0'>
//                       <i className={clsx('bi', fontIcon, 'fs-2')}></i>
//                     </span>
//                   )}
//                 </>
//               )}
//             </Link>
//             {children}
//           </>
//         )}
//       </div>
//     </OverlayTrigger>
//   )
// }

// export {AsideMenuItem}




import {FC} from 'react'
import clsx from 'clsx'
import {Link} from 'react-router-dom'
import {useLocation} from 'react-router'
import {OverlayTrigger, Tooltip} from 'react-bootstrap'
import {checkIsActive, KTIcon, WithChildren} from '../../../helpers'
import {useLayout} from '../../core'

type Props = {
  to: string
  title: string
  icon?: string
  fontIcon?: string
  customIcon?: string
  className?: string
  hasBullet?: boolean
  bsTitle?: string
  outside?: boolean
}

const AsideMenuItem: FC<Props & WithChildren> = ({
  children,
  to,
  title,
  icon,
  fontIcon,
  customIcon,
  className,
  bsTitle,
  outside = false,
  hasBullet = false,
}) => {
  const {pathname} = useLocation()
  const isActive = checkIsActive(pathname, to)
  const {config} = useLayout()
  const {aside} = config

  const iconContent = (
    <>
      {customIcon ? (
        <img
          src={customIcon}
          alt={title}
          style={{
            width: '22px',
            height: '22px',
            objectFit: 'contain',
            filter: isActive
              ? 'brightness(0) saturate(100%) invert(37%) sepia(12%) saturate(700%) hue-rotate(330deg) brightness(90%)'
              : 'brightness(0) saturate(100%) invert(72%) sepia(8%) saturate(400%) hue-rotate(330deg) brightness(100%)',
            transition: 'filter 0.18s ease',
          }}
        />
      ) : (
        <>
          {icon && aside.menuIcon === 'svg' && (
            <KTIcon iconName={icon} className='fs-2' />
          )}
          {fontIcon && aside.menuIcon === 'font' && (
            <i className={clsx('bi', fontIcon, 'fs-2')}></i>
          )}
        </>
      )}
    </>
  )

  const linkStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    textDecoration: 'none',
    transition: 'background 0.18s ease, box-shadow 0.18s ease',
    background: isActive ? '#ffffff' : 'transparent',
    boxShadow: isActive
      ? '0 2px 12px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05)'
      : 'none',
  }

  const wrapperStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    padding: '3px 0',
  }

  return (
    <OverlayTrigger
      placement='right'
      delay={{show: 250, hide: 400}}
      overlay={(props) => (
        <Tooltip id={`aside-tip-${title}`} {...props}>
          {bsTitle || title}
        </Tooltip>
      )}
    >
      <div style={wrapperStyle} className={className}>
        {outside ? (
          <a
            href={to}
            target='_blank'
            rel='noopener noreferrer'
            style={linkStyle}
            aria-label={title}
          >
            {iconContent}
          </a>
        ) : (
          <>
            <Link
              to={to}
              style={linkStyle}
              aria-label={title}
            >
              {hasBullet && (
                <span className='menu-bullet'>
                  <span className='bullet bullet-dot'></span>
                </span>
              )}
              {iconContent}
            </Link>
            {children}
          </>
        )}
      </div>
    </OverlayTrigger>
  )
}

export {AsideMenuItem}
