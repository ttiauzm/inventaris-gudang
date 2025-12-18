

import {FC, useState, useEffect} from 'react'
import {Link} from 'react-router-dom'
import clsx from 'clsx'
import {useLayout} from '../../core'
import {KTIcon, KTSVG, toAbsoluteUrl} from '../../../helpers'
import {AsideMenu} from './AsideMenu'
import {Dropdown2} from '../../../partials'

const AsideDefault: FC = () => {
  const {config, classes} = useLayout()
  const {aside} = config
  const [mobileShow, setMobileShow] = useState(false)

  // Close aside when clicking outside on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 991) {
        setMobileShow(false)
      }
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className='btn btn-icon btn-active-color-primary d-lg-none'
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          zIndex: 105,
          backgroundColor: '#fff',
          boxShadow: '0 0 10px rgba(0,0,0,0.1)',
          borderRadius: '8px',
          width: '40px',
          height: '40px'
        }}
        onClick={() => setMobileShow(!mobileShow)}
      >
        <i className='bi bi-list fs-1'></i>
      </button>

      {/* Mobile Overlay */}
      {mobileShow && (
        <div
          className='drawer-overlay d-lg-none'
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 104
          }}
          onClick={() => setMobileShow(false)}
        />
      )}

      {/* Aside */}
      <div
        id='kt_aside'
        className={clsx('aside', classes.aside.join(' '), {
          'd-none d-lg-flex': !mobileShow,
          'd-flex': mobileShow
        })}
        style={{
          backgroundColor: '#F6F6F9',
          ...(mobileShow ? {
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            zIndex: 105
          } : {})
        }}
        data-kt-drawer='true'
        data-kt-drawer-name='aside'
        data-kt-drawer-activate='{default: true, lg: false}'
        data-kt-drawer-overlay='true'
        data-kt-drawer-width='auto'
        data-kt-drawer-direction='start'
        data-kt-drawer-toggle='#kt_aside_toggle'
      >
        {/* Logo */}
        <div
          className='aside-logo d-flex flex-column align-items-center flex-column-auto py-8'
          id='kt_aside_logo'
        >
          <Link to='/dashboard'>
            <img 
              src={toAbsoluteUrl('media/logos/default-delova.png')} 
              alt='Delova Logo' 
              className='h-40px'
              style={{maxWidth: '100px'}}
            />
          </Link>
          
          {/* Close button for mobile */}
          {mobileShow && (
            <button
              className='btn btn-sm btn-icon btn-active-color-primary mt-3 d-lg-none'
              onClick={() => setMobileShow(false)}
            >
              <i className='bi bi-x-lg fs-2'></i>
            </button>
          )}
        </div>

        {/* Menu */}
        <div
          className='aside-nav d-flex flex-column align-lg-center flex-column-fluid w-100 pt-5 pt-lg-0'
          style={{backgroundColor: '#F6F6F9'}}
          id='kt_aside_nav'
        >
          <AsideMenu asideMenuCSSClasses={classes.asideMenu} />
        </div>
      </div>
    </>
  )
}

export {AsideDefault}
