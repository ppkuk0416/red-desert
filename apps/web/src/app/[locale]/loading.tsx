export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 animate-pulse">
      {/* 타이틀 스켈레톤 */}
      <div className="mb-8">
        <div className="mb-3 h-9 w-48 rounded-lg bg-stone-800" />
        <div className="h-4 w-72 rounded bg-stone-800/60" />
      </div>

      {/* 필터 바 스켈레톤 */}
      <div className="mb-6 flex gap-2">
        {[120, 80, 100].map((w) => (
          <div key={w} className="h-10 rounded-xl bg-stone-800" style={{ width: `${w}px` }} />
        ))}
      </div>

      {/* 그리드 스켈레톤 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-48 rounded-xl border border-stone-800 bg-stone-900"
          />
        ))}
      </div>
    </div>
  )
}
