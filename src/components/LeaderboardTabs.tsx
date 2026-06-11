import { useEffect, useState } from 'react'
import type { HighScore } from '../lib/highscores'
import { loadHighScores } from '../lib/highscores'
import { fetchGlobalScores } from '../lib/leaderboard'
import HighScores from './HighScores'

type Tab = 'global' | 'local'

interface LeaderboardTabsProps {
  /**
   * Controlled global board: an array, null (unreachable), or 'loading'.
   * Omit entirely to let the component fetch on mount.
   */
  globalScores?: HighScore[] | null | 'loading'
  /** Defaults to the localStorage board. */
  localScores?: HighScore[]
  globalHighlight?: number
  localHighlight?: number
}

/** The 英雄榜 with a Global ⇄ Local toggle. Global degrades softly when offline. */
export default function LeaderboardTabs({
  globalScores,
  localScores,
  globalHighlight,
  localHighlight,
}: LeaderboardTabsProps) {
  const [tab, setTab] = useState<Tab>('global')
  const [fetched, setFetched] = useState<HighScore[] | null | 'loading'>('loading')
  const controlled = globalScores !== undefined

  useEffect(() => {
    if (controlled) return
    let alive = true
    void fetchGlobalScores().then((scores) => {
      if (alive) setFetched(scores)
    })
    return () => {
      alive = false
    }
  }, [controlled])

  const globalBoard = controlled ? globalScores : fetched
  const localBoard = localScores ?? loadHighScores()

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-2">
      <div className="flex gap-2">
        <TabButton active={tab === 'global'} onClick={() => setTab('global')}>
          天下 · Global
        </TabButton>
        <TabButton active={tab === 'local'} onClick={() => setTab('local')}>
          此機 · Local
        </TabButton>
      </div>

      {tab === 'local' ? (
        <HighScores scores={localBoard} highlight={localHighlight} />
      ) : globalBoard === 'loading' ? (
        <p className="py-4 text-sm text-paper-200/50">Summoning the world's heroes…</p>
      ) : globalBoard === null ? (
        <>
          <p className="text-center text-xs text-paper-200/50">
            The global board is unreachable — showing this machine's heroes.
          </p>
          <HighScores scores={localBoard} highlight={localHighlight} />
        </>
      ) : (
        <HighScores scores={globalBoard} highlight={globalHighlight} />
      )}
    </div>
  )
}

interface TabButtonProps {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}

function TabButton({ active, onClick, children }: TabButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-4 py-1 font-arcade text-xs transition-colors ${
        active
          ? 'border-gold-400 text-gold-300'
          : 'border-paper-200/30 text-paper-200/70 hover:border-paper-200/60'
      }`}
    >
      {children}
    </button>
  )
}
