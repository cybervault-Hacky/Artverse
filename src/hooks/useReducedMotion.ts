import { useSyncExternalStore } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

/**
 * A single MediaQueryList is reused for the lifetime of the page. It is
 * created lazily so the module can be imported in an environment without a
 * DOM (for example a server render or a smoke test).
 */
let mediaQueryList: MediaQueryList | null = null

function getMediaQueryList(): MediaQueryList | null {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return null
  }
  mediaQueryList ??= window.matchMedia(QUERY)
  return mediaQueryList
}

function subscribe(onChange: () => void): () => void {
  const list = getMediaQueryList()
  if (!list) return () => undefined

  list.addEventListener('change', onChange)
  return () => list.removeEventListener('change', onChange)
}

function getSnapshot(): boolean {
  return getMediaQueryList()?.matches ?? false
}

function getServerSnapshot(): boolean {
  return false
}

/**
 * Tracks the visitor's reduced-motion preference.
 *
 * Animation is already disabled in CSS for reduced-motion visitors; this hook
 * exists so the design-system page can report the live state of that
 * preference. `useSyncExternalStore` keeps the value correct without an effect
 * that writes state.
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
