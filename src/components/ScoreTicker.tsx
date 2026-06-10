import { useEffect, useRef, useState } from 'react'

/**
 * Animates the displayed number toward `value` over ~400ms. Isolated on
 * purpose: only this span re-renders during the count-up, so the ticker can
 * never reintroduce board-wide render lag.
 */
export default function ScoreTicker({ value }: { value: number }) {
  const [shown, setShown] = useState(value)
  const shownRef = useRef(value)

  useEffect(() => {
    const from = shownRef.current
    if (from === value) return
    const start = performance.now()
    const duration = 400
    let raf = 0
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / duration)
      const eased = 1 - (1 - p) ** 3
      const current = Math.round(from + (value - from) * eased)
      shownRef.current = current
      setShown(current)
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [value])

  return <>{shown}</>
}
