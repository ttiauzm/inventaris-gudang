import {FC, useState, useEffect} from 'react'
import {useIntl} from 'react-intl'
import {PageTitle} from '../../../_metronic/layout/core'
// import {
//   ListsWidget5,
//   TablesWidget10,
//   MixedWidget8,
//   MixedWidget3,
// } from '../../../_metronic/partials/widgets'
import { Toolbar } from '../../../_metronic/layout/components/toolbar/Toolbar'
import { Content } from '../../../_metronic/layout/components/Content'
import { useAuth } from '../../modules/auth'
import { KTIcon, toAbsoluteUrl } from '../../../_metronic/helpers'
import EmptyState404 from '../../components/EmptyState404'
import { getHistory } from '../history/core/_requests'
import { HistoryItem } from '../history/core/_model'

const DashboardWrapper: FC = () => {
  const {currentUser} = useAuth()
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      setLoading(true)
      const data = await getHistory()
      setHistory(data)
    } catch (error) {
      console.error('Error fetching history:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredHistory = history.filter(item =>
    item.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = filteredHistory.slice(startIndex, startIndex + itemsPerPage)

  const getCurrentDate = () => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
    
    const now = new Date()
    const dayName = days[now.getDay()]
    const day = now.getDate().toString().padStart(2, '0')
    const monthName = months[now.getMonth()]
    const year = now.getFullYear()
    
    return `${dayName}, ${day} ${monthName} ${year}`
  }

  return (
    <>
    <div style={{borderRadius: '9px',margin: '10px' ,padding: '10px', backgroundColor: '#B7ADA6', minHeight: 'calc(5vh - 40px)'}}>
      {/* Hero Card - Logo Delova */}
      <div 
        className='card' 
        style={{
          backgroundColor: '#B7ADA6',
          border: 'none',
          borderRadius: '0'
        }}
      >
        <div 
          className='card-body d-flex flex-column align-items-center justify-content-center' 
          style={{
            minHeight: '400px',
            backgroundColor: '#F4EFE6',
            margin: '20px',
            borderRadius: '12px'
          }}
        >
          {/* Logo */}
          <div className='mb-8 text-center'>
            <img 
              src={toAbsoluteUrl('public/media/logos/delova.svg')} 
              alt='Delova Logo' 
              style={{maxWidth: '300px', height: 'auto'}}
            />
          </div>

          {/* Welcome Text */}
          <div className='text-center'>
            <h2 
              className='fw-bold mb-2' 
              style={{
                color: '#2C3E50', 
                fontSize: '1.75rem'
              }}
            >
              Selamat Datang, {currentUser?.first_name || 'User'}
            </h2>
            <p 
              className='text-muted mb-0' 
              style={{fontSize: '0.95rem'}}
            >
              {getCurrentDate()}
            </p>
          </div>
        </div>
      </div>

      {/* Histori Pengambilan Card */}
      <div 
        className='card' 
        style={{
          backgroundColor: '#B7ADA6',
          border: 'none',
          borderRadius: '0',
          padding: '20px'
        }}
      >
        <div 
          className='card' 
          style={{
            backgroundColor: '#FFFFFF',
            border: 'none',
            borderRadius: '12px'
          }}
        >
          <div className='card-header border-0 pt-6' style={{backgroundColor: 'transparent'}}>
            <div className='card-title'>
              <h3 className='fw-bold mb-0'>Histori Pengambilan</h3>
            </div>
            
            {/* Search */}
            <div className='card-toolbar'>
              <div className='d-flex align-items-center position-relative'>
                <KTIcon iconName='magnifier' className='fs-3 position-absolute ms-5' />
                <input
                  type='text'
                  className='form-control form-control-solid w-250px ps-13'
                  placeholder='Cari Barang'
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setCurrentPage(1)
                  }}
                />
              </div>
            </div>
          </div>

          <div className='card-body py-4'>
            {loading ? (
              <div className='text-center py-10'>
                <span className='spinner-border spinner-border-lg'></span>
              </div>
            ) : (
              <>
                {/* Table */}
                <div className='table-responsive'>
                  <table className='table align-middle table-row-dashed fs-6 gy-5'>
                    <thead>
                      <tr className='text-start text-muted fw-bold fs-7 text-uppercase gs-0'>
                        <th className='w-10px pe-2'>
                          <div className='form-check form-check-sm form-check-custom form-check-solid me-3'>
                            <input className='form-check-input' type='checkbox' />
                          </div>
                        </th>
                        <th className='min-w-200px'>Nama Barang</th>
                        <th className='min-w-100px'>Jumlah</th>
                        <th className='min-w-150px'>Tanggal</th>
                        <th className='min-w-125px'>Username</th>
                      </tr>
                    </thead>
                    <tbody className='text-gray-600 fw-semibold'>
                      {paginatedData.length > 0 ? (
                        paginatedData.map((item) => (
                          <tr key={item.id}>
                            <td>
                              <div className='form-check form-check-sm form-check-custom form-check-solid'>
                                <input className='form-check-input' type='checkbox' />
                              </div>
                            </td>
                            <td>
                              <div className='d-flex flex-column'>
                                <span className='text-gray-800 fw-bold mb-1'>
                                  {item.item_name}
                                </span>
                                <span className='text-muted fs-7'>
                                  {item.description}
                                </span>
                              </div>
                            </td>
                            <td>
                              <span className='badge badge-light-primary'>
                                {item.quantity} {item.unit}
                              </span>
                            </td>
                            <td>
                              {new Date(item.date).toLocaleDateString('id-ID', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </td>
                            <td>{item.admin_name}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5}>
                            <EmptyState404
                              title='Barang yang anda cari tidak ada'
                              subtitle='Pastikan kata kunci anda benar.'
                            />
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {filteredHistory.length > 0 && (
                  <div className='d-flex justify-content-between align-items-center flex-wrap pt-5'>
                    <div className='d-flex align-items-center'>
                      <span className='text-muted me-2'>Show</span>
                      <span className='fw-bold me-2'>{itemsPerPage}</span>
                      <span className='text-muted'>per page</span>
                    </div>

                    <div className='text-muted'>
                      {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredHistory.length)} of {filteredHistory.length}
                    </div>

                    <div className='d-flex gap-2'>
                      <button
                        className='btn btn-sm btn-light-primary'
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => prev - 1)}
                      >
                        <KTIcon iconName='arrow-left' className='fs-3' />
                      </button>
                      
                      {[...Array(totalPages)].map((_, index) => (
                        <button
                          key={index + 1}
                          className={`btn btn-sm ${currentPage === index + 1 ? 'btn-primary' : 'btn-light'}`}
                          onClick={() => setCurrentPage(index + 1)}
                        >
                          {index + 1}
                        </button>
                      ))}

                      <button
                        className='btn btn-sm btn-light-primary'
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(prev => prev + 1)}
                      >
                        <KTIcon iconName='arrow-right' className='fs-3' />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      </div>
    </>
  )
}

export {DashboardWrapper}

// const DashboardPage = () => {
//   useEffect(() => {
//     // We have to show toolbar only for dashboard page
//     document.getElementById('kt_layout_toolbar')?.classList.remove('d-none')
//     return () => {
//       document.getElementById('kt_layout_toolbar')?.classList.add('d-none')
//     }
//   }, [])

//   return (
//     <>
//       <Toolbar />
//       <Content>
//         {/* begin::Row  */}
//         <div className='row g-5 g-xl-8'>
//           {/* begin::Col  */}
//           <div className='col-xxl-4'>
//             <MixedWidget8 className='card-xxl-stretch' chartColor='warning' chartHeight='150px' />
//           </div>
//           {/* end::Col  */}
//           {/* begin::Col  */}
//           <div className='col-xxl-8'>
//             <TablesWidget10 className='card-xxl-stretch mb-5 mb-xl-8' />
//           </div>
//           {/* end::Col  */}
//         </div>
//         {/* end::Row  */}

//         {/* begin::Row  */}
//         <div className='row gy-5 g-xl-8'>
//           {/* begin::Col  */}
//           <div className='col-xl-4'>
//             <ListsWidget5 className='card-xl-stretch mb-xl-8' />
//           </div>
//           {/* end::Col  */}
//           {/* begin::Col  */}
//           <div className='col-xl-4'>
//             <MixedWidget3
//               className='card-xl-stretch mb-5 mb-xl-8'
//               chartColor='primary'
//               chartHeight='225px'
//             />
//           </div>
//           {/* end::Col  */}
//         </div>
//         {/* end::Row */}
//       </Content>  
//     </>
//   )
// }

// const DashboardWrapper = () => {
//   const intl = useIntl()
//   return (
//     <>
//       <PageTitle breadcrumbs={[]}>{intl.formatMessage({id: 'MENU.DASHBOARD'})}</PageTitle>
//       <DashboardPage />
//     </>
//   )
// }

// export {DashboardWrapper}

// import {
//   ListsWidget4,
//   ListsWidget5,
//   TablesWidget10,
//   MixedWidget8,
//   MixedWidget5,
//   MixedWidget3,
// } from '../../../_metronic/partials/widgets'

{/* begin::Col  */}
          {/* <div className='col-xl-4'>
            <ListsWidget4 className='card-xl-stretch mb-5 mb-xl-8' items={6} />
          </div> */}
          {/* end::Col  */}
        {/*</div>*/}
        {/* end::Row  */}

        {/* begin::Row */}
        {/*<div className='row gy-0 gx-5 gx-xl-8'>*/}
          {/* begin::Col */}
          {/* <div className='col-xl-4'>
            <MixedWidget5
              className='card-xl-stretch mb-5 mb-xl-0'
              image='/media/svg/brand-logos/plurk.svg'
              time='7 hours ago'
              title='PitStop - Multiple Email Generator'
              description='
                  Pitstop creates quick email campaigns.<br/>
                  We help to strengthen your brand.
              '
            />
          </div> */}
          {/* end::Col */}

          {/* begin::Col */}
          {/* <div className='col-xl-4'>
            <MixedWidget5
              className='card-xl-stretch mb-5 mb-xl-0'
              image='/media/svg/brand-logos/telegram.svg'
              time='10 days ago'
              title='ReactJS Admin Theme'
              description='
              Keenthemes uses the latest and greatest<br/>
              frameworks for complete modernization.
              '
            />
          </div> */}
          {/* end::Col */}

          {/* begin::Col */}
          {/* <div className='col-xl-4'>
            <MixedWidget5
              className='card-xl-stretch mb-5 mb-xl-0'
              image='/media/svg/brand-logos/vimeo.svg'
              time='2 weeks ago'
              title='KT.com - High Quality Templates'
              description='
              Easy to use, incredibly flexible and secure<br/>
              with in-depth documentation that outlines.
              '
            />
          </div> */}
          {/* end::Col */}