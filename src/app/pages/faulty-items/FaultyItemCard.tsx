import {FC, useState} from 'react'

export interface FaultyReport {
  id: string
  item_id: string
  item_name: string
  quantity: number
  unit?: string
  description: string
  photo_url?: string
  reported_by: string
  reported_at: string
  status?: string
}

interface Props {
  report: FaultyReport
}

export const FaultyItemCard: FC<Props> = ({report}) => {
  const [imgError, setImgError]     = useState(false)
  const [pressed, setPressed]       = useState(false)
  const [lightbox, setLightbox]     = useState(false)

  const dateObj = new Date(report.reported_at)
  const formattedDate = isNaN(dateObj.getTime())
    ? report.reported_at
    : dateObj.toLocaleDateString('id-ID', {day: '2-digit', month: 'short', year: 'numeric'}) +
      ', ' +
      dateObj.toLocaleTimeString('id-ID', {hour: '2-digit', minute: '2-digit', second: '2-digit'})

  const hasPhoto = !!report.photo_url && !imgError

  return (
    <>
      <style>{`
        .faulty-card {
          position: relative;
          display: flex;
          align-items: stretch;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid rgba(183, 173, 166, 0.35);
          background: linear-gradient(135deg, rgb(255, 255, 255) 0%, rgb(253, 252, 251) 60%, rgb(243, 242, 241) 100%);
          box-shadow: 0 2px 10px rgba(0,0,0,0.06);
          min-height: 40px;
          cursor: pointer;
          transition: box-shadow 0.22s ease, transform 0.18s ease, background 0.18s ease;
          -webkit-tap-highlight-color: transparent;
          user-select: none;
        }
        .faulty-card::before {
          content: '';
          position: absolute;
          inset-x: 0;
          top: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.85) 40%, rgba(255,255,255,0.35) 100%);
          z-index: 2;
        }
        .faulty-card:hover {
          box-shadow: 0 6px 24px rgba(137, 120, 112, 0.22);
          transform: translateY(-1px);
          background: linear-gradient(135deg, #F7F3EE 0%, #EEE7DD 60%, rgb(229, 221, 211) 100%);
        }
        .faulty-card:active,
        .faulty-card.pressed {
          transform: scale(0.985);
          box-shadow: 0 2px 8px rgba(137, 120, 112, 0.14);
        }
        .faulty-card-body {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 12px 16px;
          flex: 1;
          min-width: 0;
          gap: 6px;
          z-index: 1;
        }
        .faulty-card-image {
          position: relative;
          flex-shrink: 0;
          width: 440px;
          max-height: 100px;
          overflow: hidden;
        }
        .faulty-card-image-fade {
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          background: linear-gradient(90deg, rgb(243, 242, 241) 10%, rgba(243, 242, 241, 0) 100%, transparent 100%);
        }
        .faulty-qty-badge {
          background-color: #fff5f5;
          color: #dc3545;
          padding: 3px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          white-space: nowrap;
          flex-shrink: 0;
          border: 1px solid rgba(220,53,69,0.15);
        }
        .faulty-divider {
          height: 1px;
          background: linear-gradient(90deg, rgba(183,173,166,0.4) 0%, rgba(183,173,166,0.08) 100%);
        }
        .faulty-card-ornament {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          opacity: 0.12;
          z-index: 2;
          pointer-events: none;
        }

        /* ── Lightbox ── */
        .faulty-lightbox-backdrop {
          position: fixed;
          inset: 0;
          z-index: 2000;
          background: rgba(0, 0, 0, 0.82);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: zoom-out;
          animation: faulty-fade-in 0.18s ease;
        }
        @keyframes faulty-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .faulty-lightbox-inner {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          cursor: default;
          animation: faulty-scale-in 0.2s ease;
          max-width: 90vw;
        }
        @keyframes faulty-scale-in {
          from { transform: scale(0.92); opacity: 0; }
          to   { transform: scale(1);    opacity: 1; }
        }
        .faulty-lightbox-card {
          background: #fff;
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 32px 80px rgba(0,0,0,0.45);
          max-width: 480px;
          width: 100%;
        }
        .faulty-lightbox-img-wrap {
          width: 100%;
          max-height: 55vh;
          overflow: hidden;
          background: #f5f0eb;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .faulty-lightbox-img-wrap img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
          max-height: 55vh;
        }
        .faulty-lightbox-info {
          padding: 18px 20px 20px;
        }
        .faulty-lightbox-close {
          position: fixed;
          top: 18px;
          right: 18px;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: none;
          background: rgba(255,255,255,0.18);
          color: #fff;
          font-size: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.15s;
          z-index: 2001;
          line-height: 1;
        }
        .faulty-lightbox-close:hover {
          background: rgba(255,255,255,0.32);
        }
        .faulty-no-photo-box {
          width: 100%;
          height: 180px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: linear-gradient(135deg, rgba(183,173,166,0.12) 0%, rgba(137,120,112,0.06) 100%);
        }
      `}</style>

      {/* ── Lightbox overlay ───────────────────────────────────────────────── */}
      {lightbox && (
        <div
          className='faulty-lightbox-backdrop'
          onClick={() => setLightbox(false)}
        >
          {/* Tombol tutup */}
          <button
            className='faulty-lightbox-close'
            onClick={(e) => { e.stopPropagation(); setLightbox(false) }}
          >×</button>

          {/* Kartu detail */}
          <div
            className='faulty-lightbox-inner'
            onClick={(e) => e.stopPropagation()}
          >
            <div className='faulty-lightbox-card'>

              {/* Gambar atau placeholder */}
              <div className='faulty-lightbox-img-wrap'>
                {hasPhoto ? (
                  <img
                    src={report.photo_url}
                    alt='Bukti kerusakan'
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className='faulty-no-photo-box'>
                    <svg width='40' height='40' viewBox='0 0 24 24' fill='none' style={{opacity: 0.3}}>
                      <rect x='3' y='3' width='18' height='18' rx='3' stroke='#897870' strokeWidth='1.5' />
                      <circle cx='8.5' cy='8.5' r='1.5' fill='#897870' />
                      <path d='M3 15l5-5 4 4 3-3 6 6' stroke='#897870' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
                    </svg>
                    <span style={{fontSize: '12px', color: '#b0a89f'}}>Tidak ada foto bukti</span>
                  </div>
                )}
              </div>

              {/* Info detail */}
              <div className='faulty-lightbox-info'>
                {/* Nama + badge qty */}
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '10px'}}>
                  <p style={{margin: 0, fontSize: '15px', fontWeight: 700, color: '#2C1E18', lineHeight: 1.35}}>                {/* Ini tuh aselinya bisa ditambahin fontfamily */}
                    {report.item_name || '—'}
                  </p>
                  <span className='faulty-qty-badge' style={{fontSize: '12px', padding: '4px 12px'}}>
                    -{report.quantity} {report.unit || 'pcs'}
                  </span>
                </div>

                {/* Divider */}
                <div className='faulty-divider' style={{marginBottom: '10px'}} />

                {/* Tanggal */}
                <p style={{margin: '0 0 4px', fontSize: '11.5px', color: '#897870', letterSpacing: '0.03em'}}>                  {/* Ini tuh aselinya bisa ditambahin fontfamily */}
                  {formattedDate}
                </p>

                {/* Reporter */}
                <p style={{margin: '0 0 8px', fontSize: '12px', color: '#6B5750'}}>
                  Dilaporkan oleh{' '}
                  <span style={{fontWeight: 700, color: '#3D2B24'}}>{report.reported_by || '—'}</span>
                </p>

                {/* Divider */}
                <div className='faulty-divider' style={{marginBottom: '10px'}} />

                {/* Deskripsi */}
                <p style={{margin: 0, fontSize: '13px', color: '#4a3a34', lineHeight: 1.55}}>                                   {/* Ini tuh aselinya bisa ditambahin fontfamily */}
                  {report.description || '—'}
                </p>
              </div>
            </div>

            {/* Hint tutup */}
            <p style={{color: 'rgba(255,255,255,0.4)', fontSize: '11px', margin: 0}}>
              Klik di luar kartu untuk menutup
            </p>
          </div>
        </div>
      )}

      {/* ── Card list ─────────────────────────────────────────────────────── */}
      <div
        className={`faulty-card${pressed ? ' pressed' : ''}`}
        onClick={() => setLightbox(true)}
        onMouseDown={() => setPressed(true)}
        onMouseUp={() => setPressed(false)}
        onMouseLeave={() => setPressed(false)}
        onTouchStart={() => setPressed(true)}
        onTouchEnd={() => setPressed(false)}
        onTouchCancel={() => setPressed(false)}
      >
        {/* Left accent bar */}
        <div className='faulty-card-accent' />

        {/* Main content */}
        <div className='faulty-card-body'>
          {/* Row 1: Nama + qty badge */}
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px'}}>
            <p
              style={{
                margin: 0,
                // fontFamily: "'Georgia', 'Times New Roman', serif",
                fontSize: '0.97rem',
                fontWeight: 700,
                color: '#2C1E18',
                letterSpacing: '0.02em',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flex: 1,
              }}
            >
              {report.item_name || '—'}
            </p>
            <span className='faulty-qty-badge'>
              -{report.quantity} {report.unit || 'pcs'}
            </span>
          </div>

          {/* Divider 1 */}
          <div className='faulty-divider' />

          {/* Row 2: Tanggal */}
          <p
            style={{
              margin: 0,
              // fontFamily: "'Georgia', serif",
              fontSize: '0.70rem',
              color: '#897870',
              letterSpacing: '0.03em',
            }}
          >
            {formattedDate}
          </p>

          {/* Divider 2 */}
          <div className='faulty-divider' />

          {/* Row 3: Reporter + Deskripsi */}
          <p
            style={{
              margin: 0,
              // fontFamily: "'Georgia', serif",
              fontSize: '0.73rem',
              color: '#6B5750',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{fontWeight: 600, color: '#3D2B24'}}>
              {report.reported_by || '—'}
            </span>
            <span style={{margin: '0 6px', color: 'rgba(137,120,112,0.45)'}}>·</span>
            {report.description}
          </p>
        </div>

        {/* Right: Foto */}
        <div className='faulty-card-image'>
          <div className='faulty-card-image-fade' />

          {hasPhoto ? (
            <img
              src={report.photo_url}
              alt='Bukti kerusakan'
              onError={() => setImgError(true)}
              style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, rgba(183,173,166,0.18) 0%, rgba(137,120,112,0.09) 100%)',
              }}
            >
              <svg width='32' height='32' viewBox='0 0 24 24' fill='none' style={{opacity: 0.3}}>
                <rect x='3' y='3' width='18' height='18' rx='3' stroke='#897870' strokeWidth='1.5' />
                <circle cx='8.5' cy='8.5' r='1.5' fill='#897870' />
                <path d='M3 15l5-5 4 4 3-3 6 6' stroke='#897870' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
              </svg>
            </div>
          )}

          {/* Ornament */}
          <svg className='faulty-card-ornament' width='48' height='48' viewBox='0 0 52 52' fill='none'>
            <circle cx='26' cy='26' r='24' stroke='#897870' strokeWidth='1.5' />
            <line x1='26' y1='4' x2='26' y2='48' stroke='#897870' strokeWidth='1.2' />
            <line x1='4' y1='26' x2='48' y2='26' stroke='#897870' strokeWidth='1.2' />
            <line x1='9' y1='9' x2='43' y2='43' stroke='#897870' strokeWidth='1' />
            <line x1='43' y1='9' x2='9' y2='43' stroke='#897870' strokeWidth='1' />
            <circle cx='26' cy='26' r='4' stroke='#897870' strokeWidth='1.2' />
          </svg>
        </div>
      </div>
    </>
  )
}