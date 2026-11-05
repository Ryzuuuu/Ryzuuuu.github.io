import { useEffect, useState } from 'react'
import { profile } from '../constants'

const KEY = 'last-push'
const FRESH = 30 * 60 * 1000

const fromCache = () => {
  try {
    const hit = JSON.parse(sessionStorage.getItem(KEY))
    return hit && Date.now() - hit.at < FRESH ? hit : null
  } catch {
    return null
  }
}

const toCache = (value) => {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(value))
  } catch {
    // Private windows can refuse storage. The site just asks GitHub again next time.
  }
}

export const timeAgo = (date) => {
  const fmt = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  const mins = Math.round((new Date(date) - Date.now()) / 60000)
  if (Math.abs(mins) < 60) return fmt.format(mins, 'minute')
  const hours = Math.round(mins / 60)
  if (Math.abs(hours) < 24) return fmt.format(hours, 'hour')
  return fmt.format(Math.round(hours / 24), 'day')
}

// The repo most recently pushed to, from GitHub's public events. Returns null until it
// arrives and stays null if GitHub says no, so callers show nothing rather than a stale claim.
export const useLastPush = () => {
  const [push, setPush] = useState(fromCache)

  useEffect(() => {
    if (push) return
    const abort = new AbortController()
    fetch(`https://api.github.com/users/${profile.githubUser}/events/public?per_page=30`, { signal: abort.signal })
      .then((r) => (r.ok ? r.json() : []))
      .then((events) => {
        const e = events.find((ev) => ev.type === 'PushEvent')
        if (!e) return
        const value = { repo: e.repo.name.split('/')[1], date: e.created_at, at: Date.now() }
        toCache(value)
        setPush(value)
      })
      .catch(() => {})
    return () => abort.abort()
  }, [push])

  return push
}
