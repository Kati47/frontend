"use client"

import { useEffect, useState } from "react"

interface ViewTransitionProps {
  isTransitioning: boolean | null
  onTransitionComplete: () => void
}

export default function ViewTransition({ isTransitioning, onTransitionComplete }: ViewTransitionProps) {
  const [opacity, setOpacity] = useState(0)

  useEffect(() => {
    if (isTransitioning !== null) {
      // Fade in
      setOpacity(1)

      // After animation completes, notify parent
      const timer = setTimeout(() => {
        setOpacity(0)
        setTimeout(() => {
          onTransitionComplete()
        }, 400)
      }, 600)

      return () => clearTimeout(timer)
    }
  }, [isTransitioning, onTransitionComplete])

  if (isTransitioning === null) return null

  return (
    <div
      className="fixed inset-0 bg-white dark:bg-gray-900 z-50 pointer-events-none transition-opacity duration-400 flex items-center justify-center"
      style={{ opacity }}
    >
      <div className="flex flex-col items-center">
        <div className="mb-4">
          <svg
            className="animate-spin h-10 w-10 text-blue-600 dark:text-blue-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
          Switching to {isTransitioning ? "3D" : "2D"} View
        </div>
      </div>
    </div>
  )
}
