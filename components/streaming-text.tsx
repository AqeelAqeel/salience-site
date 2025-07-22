"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

const words = ["persistence", "personalized", "perseverance", "perspicacity"]
const sharedPrefix = "pers"

export function StreamingText({ className }: { className?: string }) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  
  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentWordIndex((prev) => (prev + 1) % words.length)
        setIsTransitioning(false)
      }, 300)
    }, 2500)
    
    return () => clearInterval(interval)
  }, [])
  
  const currentWord = words[currentWordIndex]
  const suffix = currentWord.substring(sharedPrefix.length)
  
  return (
    <div className={cn("inline-flex items-baseline font-medium", className)}>
      <span className="relative">
        <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient-x">
          {sharedPrefix}
        </span>
      </span>
      <span className="relative overflow-hidden">
        <span
          className={cn(
            "inline-block transition-all duration-300",
            isTransitioning ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
          )}
        >
          {suffix}
        </span>
      </span>
    </div>
  )
}