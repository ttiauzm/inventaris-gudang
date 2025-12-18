// import {FC, ReactNode} from 'react'
// import {useAuth} from '../modules/auth'
// import {hasPermission, isSuperAdmin} from '../utils/permissionHelper'

// interface ProtectedButtonProps {
//   permission?: string
//   requireSuperAdmin?: boolean
//   onClick: () => void
//   children: ReactNode
//   className?: string
//   disabled?: boolean
//   showTooltip?: boolean
// }

// const ProtectedButton: FC<ProtectedButtonProps> = ({
//   permission,
//   requireSuperAdmin = false,
//   onClick,
//   children,
//   className = 'btn btn-primary',
//   disabled = false,
//   showTooltip = true
// }) => {
//   const {currentUser} = useAuth()

//   // Check permissions
//   const hasAccess = requireSuperAdmin
//     ? isSuperAdmin(currentUser)
//     : permission
//     ? hasPermission(currentUser, permission)
//     : true

//   if (!hasAccess) {
//     return showTooltip ? (
//       <button
//         className={`${className} disabled`}
//         disabled
//         title='Anda tidak memiliki akses'
//       >
//         {children}
//       </button>
//     ) : null
//   }

//   return (
//     <button
//       className={className}
//       onClick={onClick}
//       disabled={disabled}
//     >
//       {children}
//     </button>
//   )
// }

// export {ProtectedButton}

// // Usage Example:
// /*
// <ProtectedButton
//   permission={PERMISSIONS.INVENTORY_CREATE}
//   onClick={handleAdd}
//   className='btn btn-sm btn-primary'
// >
//   <KTIcon iconName='plus' className='fs-3' />
//   Tambah Barang
// </ProtectedButton>

// <ProtectedButton
//   requireSuperAdmin={true}
//   onClick={handleDeleteAll}
//   className='btn btn-sm btn-danger'
// >
//   Delete All
// </ProtectedButton>
// */