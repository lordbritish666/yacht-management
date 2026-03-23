import Link from 'next/link'
import { BerthWithStatus, BerthStatus } from '@/types'

const SCALE = 3 // 1 m = 3 px

const CAT_STYLES: Record<string, { bg: string; border: string; text: string }> = {
  sailboat: { bg: 'rgba(8,40,80,0.92)',  border: '#2563eb', text: '#93c5fd' },
  motor:    { bg: 'rgba(25,10,55,0.92)', border: '#7c3aed', text: '#c4b5fd' },
  large:    { bg: 'rgba(28,16,0,0.92)',  border: '#d97706', text: '#fcd34d' },
  mega:     { bg: 'rgba(28,5,5,0.92)',   border: '#dc2626', text: '#fca5a5' },
}

const PIERS = [
  { key: 'sailboat', letter: 'A', codes: ['A-01','A-02','A-03','A-04','A-05','A-06','A-07','A-08','A-09','A-10'] },
  { key: 'motor',    letter: 'B', codes: ['B-01','B-02','B-03','B-04','B-05','B-06','B-07','B-08','B-09','B-10'] },
  { key: 'large',    letter: 'C', codes: ['C-01','C-02','C-03','C-04','C-05','C-06','C-07'] },
  { key: 'mega',     letter: 'D', codes: ['D-01','D-02','D-03'] },
]

interface Props {
  berths: BerthWithStatus[]
}

export function MarinaMap({ berths }: Props) {
  const berthMap = new Map(berths.map(b => [b.code, b]))

  return (
    <div
      className="relative rounded-2xl border border-[#1a3a5c] overflow-x-auto"
      style={{
        background: 'linear-gradient(178deg, #051525 0%, #071d38 35%, #0a2e55 70%, #0d3b6e 100%)',
        minHeight: 300,
      }}
    >
      {/* Wave lines */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 28px, rgba(255,255,255,0.025) 28px, rgba(255,255,255,0.025) 29px)',
        }}
      />

      {/* Basin watermark */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 select-none pointer-events-none">
        <span className="text-4xl font-black tracking-[0.55em] text-white/[0.04] uppercase">
          Basin
        </span>
      </div>

      {/* Compass */}
      <div className="absolute top-14 right-4 text-slate-700 text-[10px] font-bold leading-none select-none">
        <div className="flex flex-col items-center gap-0.5">
          <span>N</span>
          <span className="text-[8px]">↑</span>
        </div>
      </div>

      {/* Quay */}
      <div className="bg-[#2a3441] border-b-4 border-[#3d4f63] px-8 py-3 flex items-center gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="w-2 h-2 rounded-full bg-slate-500 shrink-0" />
        ))}
        <span className="mx-3 text-xs font-bold tracking-widest text-slate-400 uppercase">
          Quay
        </span>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="w-2 h-2 rounded-full bg-slate-500 shrink-0" />
        ))}
        <span className="ml-auto text-[10px] text-slate-600 italic">
          Telaga Marina, Langkawi
        </span>
      </div>

      {/* Piers */}
      <div className="flex items-start gap-10 px-10 pb-14 min-w-max">
        {PIERS.map(pier => {
          const catStyle = CAT_STYLES[pier.key]
          const half = Math.ceil(pier.codes.length / 2)
          const leftCodes  = pier.codes.slice(0, half)
          const rightCodes = pier.codes.slice(half)

          return (
            <div key={pier.key} className="flex flex-col items-center">
              <div className="flex items-start">

                {/* Left berths */}
                <div className="flex flex-col gap-px items-end">
                  {leftCodes.map(code => {
                    const b = berthMap.get(code)
                    if (!b) return null
                    return (
                      <BerthSlot
                        key={code}
                        berth={b}
                        catStyle={catStyle}
                        side="left"
                      />
                    )
                  })}
                </div>

                {/* Pier walkway */}
                <div
                  className="self-stretch shrink-0"
                  style={{
                    width: 12,
                    minHeight: 40,
                    backgroundColor: '#3d4f63',
                    borderLeft:  '1.5px solid #5a7a9a',
                    borderRight: '1.5px solid #5a7a9a',
                  }}
                />

                {/* Right berths */}
                <div className="flex flex-col gap-px items-start">
                  {rightCodes.map(code => {
                    const b = berthMap.get(code)
                    if (!b) return null
                    return (
                      <BerthSlot
                        key={code}
                        berth={b}
                        catStyle={catStyle}
                        side="right"
                      />
                    )
                  })}
                </div>
              </div>

              {/* Pier label */}
              <div
                className="mt-3 px-3 py-0.5 rounded-full border text-[10px] font-bold"
                style={{ backgroundColor: catStyle.bg, borderColor: catStyle.border, color: catStyle.text }}
              >
                Pier {pier.letter}
              </div>
            </div>
          )
        })}
      </div>

      {/* Harbour entrance */}
      <div className="absolute bottom-4 left-0 right-0 flex items-center gap-3 px-10">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600/50 to-transparent" />
        <div className="flex items-center gap-2">
          <div className="w-px h-3 bg-slate-500/70" />
          <span className="text-[10px] font-medium tracking-widest text-slate-500 uppercase">
            Harbour Entrance
          </span>
          <div className="w-px h-3 bg-slate-500/70" />
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600/50 to-transparent" />
      </div>
    </div>
  )
}

// ─── Status overlay helpers ────────────────────────────────────────────────────

const STATUS_OVERLAY: Record<BerthStatus, { bg?: string; border?: string; icon?: string; iconColor?: string }> = {
  vacant:   {},
  reserved: { border: '#f59e0b', icon: '◆', iconColor: '#f59e0b' },
  occupied: { bg: 'rgba(15,20,25,0.82)', border: '#475569', icon: '✕', iconColor: 'rgba(255,255,255,0.55)' },
  away:     { bg: 'rgba(15,20,25,0.45)', border: '#6d28d9', icon: '⇡', iconColor: '#a78bfa' },
}

// ─── BerthSlot ────────────────────────────────────────────────────────────────

function BerthSlot({
  berth,
  catStyle,
  side,
}: {
  berth: BerthWithStatus
  catStyle: { bg: string; border: string; text: string }
  side: 'left' | 'right'
}) {
  const w = Math.round(berth.length_m * SCALE)
  const h = Math.max(Math.round(berth.width_m * SCALE), 10)
  const num = berth.code.split('-')[1]

  const overlay = STATUS_OVERLAY[berth.status]
  const bg     = overlay.bg     ?? catStyle.bg
  const border = overlay.border ?? catStyle.border

  const vesselTip = berth.current_booking
    ? ` · ${berth.current_booking.vessel_name} (${berth.status})`
    : ''

  return (
    <Link
      href={`/berths/${berth.code}`}
      style={{
        width: w,
        height: h,
        backgroundColor: bg,
        borderColor: border,
        borderWidth: 1,
        borderStyle: 'solid',
        borderRadius: side === 'left' ? '3px 0 0 3px' : '0 3px 3px 0',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textDecoration: 'none',
        transition: 'filter 0.1s',
      }}
      title={`${berth.code} — ${berth.length_m}m × ${berth.width_m}m${vesselTip}`}
      className="hover:brightness-125"
    >
      {/* Berth number (show when tall enough) */}
      {h >= 14 && !overlay.icon && (
        <span style={{ color: catStyle.text, fontSize: 7, lineHeight: 1, opacity: 0.85 }}>
          {num}
        </span>
      )}

      {/* Status icon (occupied ✕, reserved ◆, away ⇡) */}
      {overlay.icon && (
        <span
          style={{
            color: overlay.iconColor,
            fontSize: h >= 20 ? 11 : 8,
            lineHeight: 1,
            fontWeight: 900,
            pointerEvents: 'none',
          }}
        >
          {overlay.icon}
        </span>
      )}

      {/* Water-line tick on open end */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          [side === 'left' ? 'left' : 'right']: 0,
          width: 1,
          height: '60%',
          backgroundColor: border,
          opacity: 0.35,
          transform: 'translateY(-50%)',
        }}
      />
    </Link>
  )
}
