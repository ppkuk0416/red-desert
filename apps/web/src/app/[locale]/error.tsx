'use client'

import { useEffect } from 'react'

type Props = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: Props) {
  useEffect(() => {
    // 에러 모니터링 서비스 연동 시 여기서 리포트
    console.error('[Error boundary]', error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 text-6xl">⚠️</div>
      <h2 className="mb-3 text-2xl font-bold text-stone-100">
        문제가 발생했습니다
      </h2>
      <p className="mb-8 max-w-md text-stone-500">
        예기치 않은 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="rounded-lg border border-crimson-700 bg-crimson-900/30 px-5 py-2.5
                     text-sm font-medium text-crimson-400 transition-colors
                     hover:bg-crimson-900/50"
        >
          다시 시도
        </button>
        <a
          href="/"
          className="rounded-lg border border-stone-700 bg-stone-800 px-5 py-2.5
                     text-sm font-medium text-stone-300 transition-colors hover:bg-stone-700"
        >
          홈으로
        </a>
      </div>
      {process.env.NODE_ENV === 'development' && error.message && (
        <pre className="mt-8 max-w-2xl overflow-auto rounded-xl border border-stone-800
                        bg-stone-950 p-4 text-left text-xs text-stone-500">
          {error.message}
        </pre>
      )}
    </div>
  )
}
