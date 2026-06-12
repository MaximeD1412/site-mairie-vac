'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

interface NavigationContextValue {
  isPending: boolean
  navigate: (url: string) => void
}

const NavigationContext = createContext<NavigationContextValue>({
  isPending: false,
  navigate: () => {},
})

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, setIsPending] = useState(false)
  const delayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const forceCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimers = useCallback(() => {
    if (delayTimerRef.current) clearTimeout(delayTimerRef.current)
    if (forceCloseTimerRef.current) clearTimeout(forceCloseTimerRef.current)
  }, [])

  const startNavigation = useCallback(() => {
    clearTimers()
    delayTimerRef.current = setTimeout(() => {
      setIsPending(true)
      forceCloseTimerRef.current = setTimeout(() => {
        setIsPending(false)
      }, 10000)
    }, 200)
  }, [clearTimers])

  const navigate = useCallback(
    (url: string) => {
      startNavigation()
      router.push(url)
    },
    [router, startNavigation],
  )

  // Close overlay when pathname changes (navigation complete)
  const prevPathnameRef = useRef(pathname)
  useEffect(() => {
    if (pathname !== prevPathnameRef.current) {
      prevPathnameRef.current = pathname
      clearTimers()
      setIsPending(false)
    }
  }, [pathname, clearTimers])

  // Intercept document-level <a> clicks for internal links
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as Element).closest('a')
      if (!target) return

      const href = target.getAttribute('href')
      if (!href) return

      // Skip external links
      if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//')) return
      // Skip hash-only links
      if (href.startsWith('#')) return
      // Skip same-page links
      const hrefPath = href.split('?')[0].split('#')[0]
      if (hrefPath === pathname || hrefPath === '') return

      startNavigation()
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [pathname, startNavigation])

  return (
    <NavigationContext.Provider value={{ isPending, navigate }}>
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigate() {
  return useContext(NavigationContext).navigate
}

export function useIsPending() {
  return useContext(NavigationContext).isPending
}
