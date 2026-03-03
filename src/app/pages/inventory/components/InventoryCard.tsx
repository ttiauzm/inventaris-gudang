import {FC} from 'react'
import {InventoryItem} from '../core/_model'
import {KTIcon} from '../../../../_metronic/helpers'

interface InventoryCardProps {
  item: InventoryItem
  onEdit: (item: InventoryItem) => void
}

const InventoryCard: FC<InventoryCardProps> = ({item, onEdit}) => {
  const defaultImage = '/media/svg/material/material-dummy.svg'

  return (
    <div className='card card-custom h-100'>
      {/* Image */}
      <div className='card-img-top' style={{
        height: '200px',
        backgroundImage: `url(${item.image || defaultImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderRadius: '0.625rem 0.625rem 0 0'
      }}>
        {/* Edit Button Overlay */}
        <div className='position-absolute top-0 end-0 m-3'>
          <button
            className='btn btn-sm btn-light-primary'
            onClick={() => onEdit(item)}
          >
            <KTIcon iconName='pencil' className='fs-4' />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className='card-body'>
        <h5 className='card-title fw-bold mb-2'>{item.name}</h5>
        <p className='card-text text-muted fs-7 mb-3'>
          {item.supplier}
        </p>

        {/* Stats */}
        <div className='d-flex justify-content-between align-items-center'>
          <span className='badge badge-light-primary'>
            Stock: {item.quantity} {item.unit}
          </span>
          {item.price && (
            <span className='fw-bold text-primary'>
              Rp {item.price.toLocaleString('id-ID')}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export {InventoryCard}