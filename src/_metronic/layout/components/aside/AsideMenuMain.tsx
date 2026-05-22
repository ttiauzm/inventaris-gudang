
// import {useIntl} from 'react-intl'
// import {useState} from 'react'
// import {AsideMenuItemWithSubMain} from './AsideMenuItemWithSubMain'
// import {AsideMenuItemWithSub} from './AsideMenuItemWithSub'
// import {AsideMenuItem} from './AsideMenuItem'
// import { useAuth } from '../../../../app/modules/auth'
// import { isSuperAdmin as checkSuperAdmin, isAdmin as checkIsAdmin } from '../../../../app/utils/permissionHelper'
// import {ConfirmModal} from '../../../../app/components/ConfirmModal'

// export function AsideMenuMain() {
//   const intl = useIntl()
//   const {currentUser, logout} = useAuth()

//   // Gunakan helper dari permissionHelper agar konsisten dengan backend role_name
//   const isSuperAdmin = checkSuperAdmin(currentUser)
//   const isAdmin = checkIsAdmin(currentUser)

//   const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

//   const handleLogout = () => {
//     setShowLogoutConfirm(true)
//   }

//   const confirmLogout = () => {
//     setShowLogoutConfirm(false)
//     logout()
//     window.location.href = '/auth/login'
//   }

//   return (
//     <>
//       <AsideMenuItem
//         to='/dashboard'
//         title={intl.formatMessage({id: 'MENU.DASHBOARD'})}
//         customIcon='/media/icons/custom/delova_home.svg'
//         bsTitle={intl.formatMessage({id: 'MENU.DASHBOARD'})}
//         className='py-3'
//       />
      
//       {/* Nav Account dinonaktifkan sementara
//       <AsideMenuItem
//         to='/crafted/account/overview'
//         title='Account'
//         bsTitle='Account'
//         customIcon='/media/icons/custom/delova_account.svg'
//         className='py-3'
//       />
//       */}
      
//       {/* Inventory - Available for both Admin and SuperAdmin */}
//       <AsideMenuItem
//         to='/apps/inventory'
//         title='Inventory'
//         bsTitle='Inventory'
//         customIcon='/media/icons/custom/delova_inventory.svg'
//         className='py-3'
//       />
      
//       {/* Admin & SuperAdmin - History */}
//       {isAdmin && (
//         <AsideMenuItem
//           to='/apps/history'
//           title='History'
//           bsTitle='History'
//           customIcon='/media/icons/custom/delova_history.svg'
//           className='py-3'
//         />
//       )}
      
//       {/* SuperAdmin Only - Log System */}
//       {isSuperAdmin && (
//         <AsideMenuItem
//           to='/apps/log-system'
//           title='System Log'
//           bsTitle='System Log'
//           customIcon='/media/icons/custom/delova_systemlog.svg'
//           className='py-3'
//         />
//       )}
      
//       {/* Supplier - SuperAdmin only */}
//       {isSuperAdmin && (
//         <AsideMenuItem
//           to='/apps/supplier'
//           title='Supplier'
//           bsTitle='Supplier'
//           customIcon='/media/icons/custom/delova_supplier.svg'
//           className='py-3'
//         />
//       )}
      
//       {/* SuperAdmin Only - User Management */}
//       {isSuperAdmin && (
//         <AsideMenuItem
//           to='/apps/users'
//           customIcon='/media/icons/custom/delova_users.svg'
//           bsTitle='Manajemen Akun'
//           title='Manajemen Akun'
//           className='py-3'
//         />
//       )}
      
//       {/* SuperAdmin Only - Master Data */}
//       {isSuperAdmin && (
//         <AsideMenuItem
//           to='/apps/master-data'
//           customIcon='/media/icons/custom/delova_database.svg'
//           bsTitle='Master Data'
//           title='Master Data'
//           className='py-3'
//         />
//       )}

//       {/* Divider */}
//       <div className='separator separator-dashed mx-5 mb-5'></div>

//       <div className='menu-item py-3 d-flex justify-content-center'>
//         <button
//           onClick={handleLogout}
//           className='menu-link menu-center border-0 bg-transparent p-0'
//           style={{cursor: 'pointer'}}
//         >
//           <span className='menu-icon me-0'>
//             <img src='/media/icons/custom/delova_logout.svg' alt='Logout' className='mh-30px' />
//           </span>
//         </button>
//       </div>

//       {/* Modal konfirmasi logout */}
//       {showLogoutConfirm && (
//         <ConfirmModal
//           message='Apakah anda yakin untuk logout dan kembali ke halaman login?'
//           confirmText='Logout'
//           cancelText='Batal'
//           confirmClass='btn-danger'
//           onConfirm={confirmLogout}
//           onCancel={() => setShowLogoutConfirm(false)}
//         />
//       )}

//       {/* <AsideMenuItemWithSubMain
//         to='/crafted/pages'
//         title='Crafted'
//         fontIcon='bi-file-text'
//         bsTitle='Crafted'
//       >
//         <AsideMenuItemWithSub to='/crafted/pages/profile' title='Profile' hasBullet={true}>
//           <AsideMenuItem
//             to='/crafted/pages/profile/overview'
//             title='Overview'
//             bsTitle='Overview'
//             hasBullet={true}
//           />
//         </AsideMenuItemWithSub>
//       </AsideMenuItemWithSubMain> */}

//       {/* <AsideMenuItemWithSubMain
//         to='/crafted/pages'
//         title='Crafted'
//         fontIcon='bi-file-text'
//         bsTitle='Crafted'
//       >
//         <AsideMenuItemWithSub to='/crafted/pages/profile' title='Profile' hasBullet={true}>
//           <AsideMenuItem
//             to='/crafted/pages/profile/overview'
//             title='Overview'
//             bsTitle='Overview'
//             hasBullet={true}
//           />
//           <AsideMenuItem
//             to='/crafted/pages/profile/projects'
//             title='Projects'
//             bsTitle='Projects'
//             hasBullet={true}
//           />
//           <AsideMenuItem
//             to='/crafted/pages/profile/campaigns'
//             title='Campaigns'
//             bsTitle='Campaigns'
//             hasBullet={true}
//           />
//         </AsideMenuItemWithSub>

//       {/* <AsideMenuItemWithSubMain to='/error' title='Errors' fontIcon='bi-sticky' bsTitle='Errors'>
//         <AsideMenuItem to='/error/404' title='Error 404' hasBullet={true} />
//         <AsideMenuItem to='/error/500' title='Error 500' hasBullet={true} />
//       </AsideMenuItemWithSubMain> */}

//       {/* <AsideMenuItem
//         to='/apps/user-management/users'
//         title='User management'
//         fontIcon='bi-people'
//         bsTitle='User management'
//         className='py-3'
//       />
//       <AsideMenuItem
//         outside={true}
//         to={import.meta.env.VITE_APP_PREVIEW_DOCS_URL + '/changelog'}
//         title='User management'
//         fontIcon='bi-card-text'
//         bsTitle={`Changelog ${import.meta.env.VITE_APP_VERSION}`}
//         className='py-3'
//       /> */}
//     </>
//   )
// }




import {useIntl} from 'react-intl'
import {useState} from 'react'
import {AsideMenuItemWithSubMain} from './AsideMenuItemWithSubMain'
import {AsideMenuItemWithSub} from './AsideMenuItemWithSub'
import {AsideMenuItem} from './AsideMenuItem'
import {useAuth} from '../../../../app/modules/auth'
import {isSuperAdmin as checkSuperAdmin, isAdmin as checkIsAdmin} from '../../../../app/utils/permissionHelper'
import {ConfirmModal} from '../../../../app/components/ConfirmModal'

export function AsideMenuMain() {
  const intl = useIntl()
  const {currentUser, logout} = useAuth()

  const isSuperAdmin = checkSuperAdmin(currentUser)
  const isAdmin = checkIsAdmin(currentUser)

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const handleLogout = () => setShowLogoutConfirm(true)

  const confirmLogout = () => {
    setShowLogoutConfirm(false)
    logout()
    window.location.href = '/auth/login'
  }

  /* Shared hover style via inline approach — no extra CSS file needed */
  const logoutBtnStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    transition: 'background 0.18s ease',
    padding: 0,
  }

  return (
    <>
      <AsideMenuItem
        to='/dashboard'
        title={intl.formatMessage({id: 'MENU.DASHBOARD'})}
        customIcon='/media/icons/custom/delova_home.svg'
        bsTitle={intl.formatMessage({id: 'MENU.DASHBOARD'})}
      />

      {/* Inventory — Admin & SuperAdmin */}
      <AsideMenuItem
        to='/apps/inventory'
        title='Inventory'
        bsTitle='Inventory'
        customIcon='/media/icons/custom/delova_inventory.svg'
      />

      {/* History — Admin & SuperAdmin */}
      {isAdmin && (
        <AsideMenuItem
          to='/apps/history'
          title='History'
          bsTitle='History'
          customIcon='/media/icons/custom/delova_history.svg'
        />
      )}

      {/* Log System — SuperAdmin only */}
      {isSuperAdmin && (
        <AsideMenuItem
          to='/apps/log-system'
          title='System Log'
          bsTitle='System Log'
          customIcon='/media/icons/custom/delova_systemlog.svg'
        />
      )}

      {/* Supplier — SuperAdmin only */}
      {isSuperAdmin && (
        <AsideMenuItem
          to='/apps/supplier'
          title='Supplier'
          bsTitle='Supplier'
          customIcon='/media/icons/custom/delova_supplier.svg'
        />
      )}

      {/* User Management — SuperAdmin only */}
      {isSuperAdmin && (
        <AsideMenuItem
          to='/apps/users'
          customIcon='/media/icons/custom/delova_users.svg'
          bsTitle='Manajemen Akun'
          title='Manajemen Akun'
        />
      )}

      {/* Master Data — SuperAdmin only */}
      {isSuperAdmin && (
        <AsideMenuItem
          to='/apps/master-data'
          customIcon='/media/icons/custom/delova_database.svg'
          bsTitle='Master Data'
          title='Master Data'
        />
      )}

      {/* Divider */}
      <div
        style={{
          width: '40px',
          height: '1px',
          backgroundColor: '#ddd8d4',
          margin: '10px auto',
          borderRadius: '1px',
        }}
      />

      {/* Logout Button */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          width: '100%',
          padding: '3px 0',
        }}
      >
        <button
          onClick={handleLogout}
          style={logoutBtnStyle}
          aria-label='Logout'
          title='Logout'
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.75)'
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
          }}
        >
          <img
            src='/media/icons/custom/delova_logout.svg'
            alt='Logout'
            style={{
              width: '22px',
              height: '22px',
              objectFit: 'contain',
              filter:
                'brightness(0) saturate(100%) invert(72%) sepia(8%) saturate(400%) hue-rotate(330deg) brightness(100%)',
            }}
          />
        </button>
      </div>

      {/* Confirm Modal */}
      {showLogoutConfirm && (
        <ConfirmModal
          message='Apakah anda yakin untuk logout dan kembali ke halaman login?'
          confirmText='Logout'
          cancelText='Batal'
          confirmClass='btn-danger'
          onConfirm={confirmLogout}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      )}
    </>
  )
}
