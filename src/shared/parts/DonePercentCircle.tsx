// =====================================================================
// DonePercentCircle : วงกลมบอก % งานที่ทำเสร็จ (แบบรูป Dashboard)
// ใช้งาน: <DonePercentCircle doneCount={2} allCount={4} />
// =====================================================================

interface DonePercentCircleProps {
  doneCount: number
  allCount: number
  /** ขนาดวงกลม (px) */
  size?: number
}

export function DonePercentCircle({ doneCount, allCount, size = 150 }: DonePercentCircleProps) {
  const percent = allCount === 0 ? 0 : Math.round((doneCount / allCount) * 100)
  const lineWidth = size * 0.09
  const radius = (size - lineWidth) / 2 - size * 0.08
  const circleLength = 2 * Math.PI * radius
  const center = size / 2

  return (
    <div
      className="relative inline-grid place-items-center"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`ทำเสร็จ ${doneCount} จาก ${allCount} งาน (${percent}%)`}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        {/* วงนอกสุดจางๆ ตกแต่ง */}
        <circle cx={center} cy={center} r={size / 2 - 2} fill="none" stroke="rgb(var(--color-blush))" strokeWidth={3} />
        {/* วงพื้นหลัง */}
        <circle cx={center} cy={center} r={radius} fill="none" stroke="rgb(var(--color-blush))" strokeWidth={lineWidth} />
        {/* วงที่บอก % */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgb(var(--color-rose))"
          strokeWidth={lineWidth}
          strokeLinecap="round"
          strokeDasharray={circleLength}
          strokeDashoffset={circleLength * (1 - percent / 100)}
          style={{ transition: 'stroke-dashoffset 600ms ease' }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="font-title text-3xl font-semibold text-wine">{percent}%</div>
          <div className="font-typewriter text-xs text-soft">
            {doneCount}/{allCount} เสร็จแล้ว
          </div>
        </div>
      </div>
    </div>
  )
}
