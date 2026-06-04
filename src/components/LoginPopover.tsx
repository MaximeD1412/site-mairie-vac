'use client'

import { useState, useEffect, useRef } from 'react'
import { User } from 'lucide-react'
import { LoginForm } from './LoginForm'

export function LoginPopover() {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    function onMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [isOpen])

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setIsOpen(o => !o)}
        aria-label="Se connecter"
        aria-expanded={isOpen}
        className="w-9 h-9 rounded-full bg-white/12 text-white flex items-center justify-center hover:bg-white/22 transition-colors"
      >
        <User size={16} aria-hidden="true" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl p-6 z-50 text-gray-700">
          <LoginForm onSuccess={() => setIsOpen(false)} />
        </div>
      )}
    </div>
  )
}
