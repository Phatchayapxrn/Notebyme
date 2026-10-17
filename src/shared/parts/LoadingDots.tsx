// =====================================================================
// LoadingDots : จุดสามจุดกระพริบ ระหว่างรอโหลด
// =====================================================================

export function LoadingDots({ text = 'กำลังโหลด' }: { text?: string }) {
  return (
    <div role="status" className="flex items-center justify-center gap-1.5 py-8" aria-label={text}>
      {[0, 150, 300].map((delay) => (
        <span key={delay} className="h-2.5 w-2.5 animate-bounce rounded-full bg-pink" style={{ animationDelay: `${delay}ms` }} />
      ))}
    </div>
  )
}
