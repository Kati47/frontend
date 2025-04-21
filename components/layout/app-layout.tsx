"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import MobileNavigation from "./mobile-navigation"
import SideNavigation from "./side-navigation"
import { useMobile } from "@/hooks/use-mobile"
import { AnimatePresence, motion } from "framer-motion"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isMobile = useMobile()
  const [prevPath, setPrevPath] = useState(pathname)
  const [direction, setDirection] = useState(0)

  useEffect(() => {
    if (pathname !== prevPath) {
      // Simplified direction logic for complex navigation
      setDirection(Math.random() > 0.5 ? 1 : -1)
      setPrevPath(pathname)
    }
  }, [pathname, prevPath])

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {!isMobile && <SideNavigation />}

      <main className="flex-1 flex flex-col">
        <div className="flex-1 container max-w-7xl mx-auto p-4 pb-20 md:pb-4">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={pathname}
              initial={{
                opacity: 0,
                x: direction * 100,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              exit={{
                opacity: 0,
                x: direction * -100,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>

        {isMobile && <MobileNavigation />}
      </main>
    </div>
  )
}

