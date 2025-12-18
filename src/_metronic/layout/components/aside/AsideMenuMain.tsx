
import {useIntl} from 'react-intl'
import {AsideMenuItemWithSubMain} from './AsideMenuItemWithSubMain'
import {AsideMenuItemWithSub} from './AsideMenuItemWithSub'
import {AsideMenuItem} from './AsideMenuItem'
import { useAuth } from '../../../../app/modules/auth'

export function AsideMenuMain() {
  const intl = useIntl()
  const {currentUser, logout} = useAuth()

  //check superadmin
  const isSuperAdmin = currentUser?.roles?.includes(999)

  const handleLogout = () => {
    logout()
    window.location.href = '/auth/login'
  }

  
  return (
    <>
      <AsideMenuItem
        to='/dashboard'
        title={intl.formatMessage({id: 'MENU.DASHBOARD'})}
        fontIcon='bi-bar-chart-line'
        bsTitle={intl.formatMessage({id: 'MENU.DASHBOARD'})}
        className='py-3'
      />
      
      <AsideMenuItem
        to='/builder'
        title='Layout Builder'
        bsTitle='Layout Builder'
        fontIcon='bi-person'
        className='py-3'
      />
      <AsideMenuItem
        to='/crafted/account/overview'
        title='Account'
        bsTitle='Account'
        fontIcon='bi-person'
        className='py-3'
      />
      <AsideMenuItem
        to='/apps/inventory'
        title='Inventory'
        bsTitle='Inventory'
        fontIcon='bi-box'
        className='py-3'
      />
      <AsideMenuItem
        to='/apps/history'
        title='History'
        bsTitle='History'
        fontIcon='bi-clock-history'
        className='py-3'
      />
      <AsideMenuItem
        to='/apps/log-system'
        title='System Log'
        bsTitle='System Log'
        fontIcon='bi-gear'
        className='py-3'
      />
      <AsideMenuItem
        to='/apps/supplier'
        title='Supplier'
        bsTitle='Supplier'
        fontIcon='bi-truck'
        className='py-3'
      />

      {isSuperAdmin && (
        <>
          <div className='separator separator-dashed mx-5 my-3'></div>
          <div className='menu-section text-muted text-uppercase fs-8 ls-1 px-5 mb-2'>
            Admin Panel
          </div>
          <AsideMenuItem
            to='/admin/users'
            icon='profile-user'
            title='Manajemen Akun'
            fontIcon='bi-people'
          />
          <AsideMenuItem
            to='/admin/categories'
            icon='category'
            title='Kategori Barang'
            fontIcon='bi-grid'
          />
          <AsideMenuItem
            to='/admin/materials'
            icon='bucket'
            title='Jenis Material'
            fontIcon='bi-box2'
          />
        </>
      )}

      {/* Divider */}
      <div className='separator separator-dashed mx-5 mb-5'></div>

      <div className='menu-item mb-5'>
        <button
          onClick={handleLogout}
          className='menu-link w-100 text-start border-0 bg-transparent'
          style={{cursor: 'pointer'}}
        >
          <span className='menu-icon'>
            <i className='ki-duotone ki-exit-left fs-2'>
              <span className='path1'></span>
              <span className='path2'></span>
            </i>
          </span>
        </button>
      </div>

      {/* <AsideMenuItemWithSubMain
        to='/crafted/pages'
        title='Crafted'
        fontIcon='bi-file-text'
        bsTitle='Crafted'
      >
        <AsideMenuItemWithSub to='/crafted/pages/profile' title='Profile' hasBullet={true}>
          <AsideMenuItem
            to='/crafted/pages/profile/overview'
            title='Overview'
            bsTitle='Overview'
            hasBullet={true}
          />
        </AsideMenuItemWithSub>
      </AsideMenuItemWithSubMain> */}

      {/* <AsideMenuItemWithSubMain
        to='/crafted/pages'
        title='Crafted'
        fontIcon='bi-file-text'
        bsTitle='Crafted'
      >
        <AsideMenuItemWithSub to='/crafted/pages/profile' title='Profile' hasBullet={true}>
          <AsideMenuItem
            to='/crafted/pages/profile/overview'
            title='Overview'
            bsTitle='Overview'
            hasBullet={true}
          />
          <AsideMenuItem
            to='/crafted/pages/profile/projects'
            title='Projects'
            bsTitle='Projects'
            hasBullet={true}
          />
          <AsideMenuItem
            to='/crafted/pages/profile/campaigns'
            title='Campaigns'
            bsTitle='Campaigns'
            hasBullet={true}
          />
        </AsideMenuItemWithSub>

      {/* <AsideMenuItemWithSubMain to='/error' title='Errors' fontIcon='bi-sticky' bsTitle='Errors'>
        <AsideMenuItem to='/error/404' title='Error 404' hasBullet={true} />
        <AsideMenuItem to='/error/500' title='Error 500' hasBullet={true} />
      </AsideMenuItemWithSubMain> */}

      {/* <AsideMenuItem
        to='/apps/user-management/users'
        title='User management'
        fontIcon='bi-people'
        bsTitle='User management'
        className='py-3'
      />
      <AsideMenuItem
        outside={true}
        to={import.meta.env.VITE_APP_PREVIEW_DOCS_URL + '/changelog'}
        title='User management'
        fontIcon='bi-card-text'
        bsTitle={`Changelog ${import.meta.env.VITE_APP_VERSION}`}
        className='py-3'
      /> */}
    </>
  )
}
