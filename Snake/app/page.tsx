"use client"

import { useEffect, useRef, useState, useCallback } from "react"

const BOX = 20
const CANVAS_SIZE = 400
const GRID_SIZE = CANVAS_SIZE / BOX

type Position = { x: number; y: number }
type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT"

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }])
  const [food, setFood] = useState<Position>({ x: 15, y: 15 })
  const [direction, setDirection] = useState<Direction>("RIGHT")
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const directionRef = useRef<Direction>("RIGHT")

  const generateFood = useCallback((): Position => {
    return {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    }
  }, [])

  const resetGame = useCallback(() => {
    setSnake([{ x: 10, y: 10 }])
    setFood(generateFood())
    setDirection("RIGHT")
    directionRef.current = "RIGHT"
    setGameOver(false)
    setScore(0)
    setIsPlaying(true)
  }, [generateFood])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const currentDir = directionRef.current

    switch (e.key) {
      case "ArrowUp":
        if (currentDir !== "DOWN") {
          setDirection("UP")
          directionRef.current = "UP"
        }
        break
      case "ArrowDown":
        if (currentDir !== "UP") {
          setDirection("DOWN")
          directionRef.current = "DOWN"
        }
        break
      case "ArrowLeft":
        if (currentDir !== "RIGHT") {
          setDirection("LEFT")
          directionRef.current = "LEFT"
        }
        break
      case "ArrowRight":
        if (currentDir !== "LEFT") {
          setDirection("RIGHT")
          directionRef.current = "RIGHT"
        }
        break
    }
  }, [])

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  useEffect(() => {
    if (!isPlaying || gameOver) return

    const moveSnake = () => {
      setSnake((prevSnake) => {
        const head = { ...prevSnake[0] }

        switch (directionRef.current) {
          case "UP":
            head.y -= 1
            break
          case "DOWN":
            head.y += 1
            break
          case "LEFT":
            head.x -= 1
            break
          case "RIGHT":
            head.x += 1
            break
        }

        // Check wall collision
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
          setGameOver(true)
          setIsPlaying(false)
          return prevSnake
        }

        // Check self collision
        if (prevSnake.some((segment) => segment.x === head.x && segment.y === head.y)) {
          setGameOver(true)
          setIsPlaying(false)
          return prevSnake
        }

        const newSnake = [head, ...prevSnake]

        // Check food collision
        if (head.x === food.x && head.y === food.y) {
          setScore((s) => s + 1)
          setFood(generateFood())
        } else {
          newSnake.pop()
        }

        return newSnake
      })
    }

    const gameLoop = setInterval(moveSnake, 100)
    return () => clearInterval(gameLoop)
  }, [isPlaying, gameOver, food, generateFood])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = "#1a1a2e"
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

    // Draw grid
    ctx.strokeStyle = "#252540"
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath()
      ctx.moveTo(i * BOX, 0)
      ctx.lineTo(i * BOX, CANVAS_SIZE)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(0, i * BOX)
      ctx.lineTo(CANVAS_SIZE, i * BOX)
      ctx.stroke()
    }

    // Draw snake
    snake.forEach((segment, index) => {
      const gradient = ctx.createRadialGradient(
        segment.x * BOX + BOX / 2,
        segment.y * BOX + BOX / 2,
        0,
        segment.x * BOX + BOX / 2,
        segment.y * BOX + BOX / 2,
        BOX / 2
      )

      if (index === 0) {
        gradient.addColorStop(0, "#4ade80")
        gradient.addColorStop(1, "#22c55e")
      } else {
        gradient.addColorStop(0, "#22c55e")
        gradient.addColorStop(1, "#16a34a")
      }

      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.roundRect(segment.x * BOX + 1, segment.y * BOX + 1, BOX - 2, BOX - 2, 4)
      ctx.fill()
    })

    // Draw food
    const foodGradient = ctx.createRadialGradient(
      food.x * BOX + BOX / 2,
      food.y * BOX + BOX / 2,
      0,
      food.x * BOX + BOX / 2,
      food.y * BOX + BOX / 2,
      BOX / 2
    )
    foodGradient.addColorStop(0, "#f87171")
    foodGradient.addColorStop(1, "#ef4444")

    ctx.fillStyle = foodGradient
    ctx.beginPath()
    ctx.arc(food.x * BOX + BOX / 2, food.y * BOX + BOX / 2, BOX / 2 - 2, 0, Math.PI * 2)
    ctx.fill()
  }, [snake, food])

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground mb-2">Snake Game</h1>
        <p className="text-2xl font-semibold text-green-500">Score: {score}</p>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="rounded-lg border-2 border-border shadow-2xl"
        />

        {!isPlaying && (
          <div className="absolute inset-0 bg-black/70 rounded-lg flex flex-col items-center justify-center gap-4">
            {gameOver && (
              <div className="text-center">
                <p className="text-3xl font-bold text-red-500 mb-2">Game Over!</p>
                <p className="text-xl text-foreground">Final Score: {score}</p>
              </div>
            )}
            <button
              onClick={resetGame}
              className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors text-lg"
            >
              {gameOver ? "Play Again" : "Start Game"}
            </button>
          </div>
        )}
      </div>

      <div className="text-muted-foreground text-center">
        <p>Use arrow keys to control the snake</p>
        <div className="flex gap-2 justify-center mt-3">
          <kbd className="px-3 py-1.5 bg-muted rounded border border-border text-sm">↑</kbd>
        </div>
        <div className="flex gap-2 justify-center mt-1">
          <kbd className="px-3 py-1.5 bg-muted rounded border border-border text-sm">←</kbd>
          <kbd className="px-3 py-1.5 bg-muted rounded border border-border text-sm">↓</kbd>
          <kbd className="px-3 py-1.5 bg-muted rounded border border-border text-sm">→</kbd>
        </div>
      </div>
    </main>
  )
}
