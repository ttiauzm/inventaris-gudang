// import React, {useEffect} from 'react'
// import {useLocation} from 'react-router'
// import {AsideMenuMain} from './AsideMenuMain'
// import {DrawerComponent, ToggleComponent} from '../../../assets/ts/components'

// type Props = {
//   asideMenuCSSClasses: string[]
// }

// const AsideMenu: React.FC<Props> = () => {
//   const {pathname} = useLocation()

//   useEffect(() => {
//     setTimeout(() => {
//       DrawerComponent.reinitialization()
//       ToggleComponent.reinitialization()
//     }, 50)
//   }, [pathname])

//   return (
//     <div
//       id='kt_aside_menu'
//       className='menu menu-column menu-title-gray-600 menu-state-primary menu-state-icon-primary menu-state-bullet-primary menu-arrow-gray-500 fw-bold fs-6'
//       style={{ backgroundColor: '#F6F6F9' }}
//       data-kt-menu='true'
//     >
//       <AsideMenuMain />
//     </div>
//   )
// }

// export {AsideMenu}




import React, {useEffect} from 'react'
import {useLocation} from 'react-router'
import {AsideMenuMain} from './AsideMenuMain'
import {DrawerComponent, ToggleComponent} from '../../../assets/ts/components'

type Props = {
  asideMenuCSSClasses: string[]
}

const AsideMenu: React.FC<Props> = () => {
  const {pathname} = useLocation()

  useEffect(() => {
    setTimeout(() => {
      DrawerComponent.reinitialization()
      ToggleComponent.reinitialization()
    }, 50)
  }, [pathname])

  return (
    <div
      id='kt_aside_menu'
      className='menu menu-column'
      style={{
        backgroundColor: '#F4F3F1',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '8px 0',
        gap: '5px',
      }}
      data-kt-menu='true'
    >
      <AsideMenuMain />
    </div>
  )
}

export {AsideMenu}
