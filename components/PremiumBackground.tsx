"use client"

import { useEffect, useState } from "react"

interface PremiumBackgroundProps {
  theme: "aurora" | "bokeh" | "minimalista" | string
  brandColor: string
}

export default function PremiumBackground({ theme, brandColor }: PremiumBackgroundProps) {
  const [mounted, setMounted] = useState(false)

  // Evita erros de hidratação no Next.js renderizando apenas no cliente
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  // TEMA 1: AURORA PREMIUM (Gradientes em movimento)
  if (theme === "aurora") {
    return (
      <div className="fixed inset-0 z-[-1] overflow-hidden bg-zinc-950">
        <div 
          className="absolute -top-[20%] -left-[10%] w-[50vw] h-[50vw] rounded-full mix-blend-screen filter blur-[100px] opacity-40 animate-pulse"
          style={{ backgroundColor: brandColor, animationDuration: '8s' }}
        />
        <div 
          className="absolute top-[40%] -right-[10%] w-[40vw] h-[40vw] rounded-full mix-blend-screen filter blur-[120px] opacity-30 animate-pulse"
          style={{ backgroundColor: brandColor, animationDuration: '12s', animationDelay: '2s' }}
        />
        <div 
          className="absolute -bottom-[20%] left-[20%] w-[60vw] h-[60vw] rounded-full mix-blend-screen filter blur-[150px] opacity-20 animate-pulse"
          style={{ backgroundColor: brandColor, animationDuration: '10s', animationDelay: '4s' }}
        />
      </div>
    )
  }

  // TEMA 2: CLASSIC BOKEH (Partículas flutuantes)
  if (theme === "bokeh") {
    // Array fixo para gerar partículas em posições e tamanhos diferentes
    const particles = Array.from({ length: 20 })
    return (
      <div className="fixed inset-0 z-[-1] overflow-hidden bg-zinc-950">
        <style>{`
          @keyframes floatUp {
            0% { transform: translateY(100vh) scale(0); opacity: 0; }
            50% { opacity: 0.8; }
            100% { transform: translateY(-20vh) scale(1); opacity: 0; }
          }
        `}</style>
        {particles.map((_, i) => {
          const size = 2 + (i % 5) // Tamanhos variados de 2px a 6px
          const left = (i * 7) % 100 // Posições horizontais espalhadas
          const delay = (i * 0.7) % 5 // Atrasos diferentes
          const duration = 6 + (i % 4) // Duração entre 6s e 9s

          return (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                left: `${left}%`,
                bottom: '-10px',
                backgroundColor: brandColor,
                boxShadow: `0 0 ${size * 2}px ${brandColor}`,
                animation: `floatUp ${duration}s infinite linear ${delay}s`,
                opacity: 0
              }}
            />
          )
        })}
      </div>
    )
  }

  // TEMA 3: MINIMALISTA VIVO (Formas geométricas girando)
  if (theme === "minimalista") {
    return (
      <div className="fixed inset-0 z-[-1] overflow-hidden bg-zinc-50 dark:bg-zinc-950">
        <style>{`
          @keyframes spinSlow {
            from { transform: translate(-50%, -50%) rotate(0deg); }
            to { transform: translate(-50%, -50%) rotate(360deg); }
          }
        `}</style>
        <div 
          className="absolute top-1/2 left-1/2 w-[120vw] h-[120vw] md:w-[80vw] md:h-[80vw] rounded-full border-[1px] opacity-10 dark:opacity-5"
          style={{ 
            borderColor: brandColor, 
            animation: 'spinSlow 40s linear infinite',
            borderStyle: 'dashed'
          }}
        />
        <div 
          className="absolute top-1/2 left-1/2 w-[90vw] h-[90vw] md:w-[60vw] md:h-[60vw] rounded-full border-[2px] opacity-5"
          style={{ 
            borderColor: brandColor, 
            animation: 'spinSlow 30s linear infinite reverse'
          }}
        />
      </div>
    )
  }

  // Fallback para liso
  return <div className="fixed inset-0 z-[-1] bg-zinc-50 dark:bg-zinc-950" />
}