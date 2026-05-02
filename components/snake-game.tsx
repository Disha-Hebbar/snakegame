"use client"

import { useCallback, useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"

const GRID_SIZE = 20
const CELL_SIZE = 20
const INITIAL_SPEED = 150

type Position = { x: number; y: number }
type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT"

const getRandomPosition = (snake: Position[]): Position => {
  let position: Position
  do {
    position = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    }
  } while (snake.some((segment) => segment.x === position.x && segment.y === position.y))
  return position
}

export function SnakeGame() {
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }])
  const [food, setFood] = useState<Position>({ x: 15, y: 15 })
  const [direction, setDirection] = useState<Direction>("RIGHT")
  const [gameOver, setGameOver] = useState(false)
  const [isPaused, setIsPaused] = useState(true)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const directionRef = useRef<Direction>(direction)
  const gameAreaRef = useRef<HTMLDivElement>(null)

  const resetGame = useCallback(() => {
    const initialSnake = [{ x: 10, y: 10 }]
    setSnake(initialSnake)
    setFood(getRandomPosition(initialSnake))
    setDirection("RIGHT")
    directionRef.current = "RIGHT"
    setGameOver(false)
    setScore(0)
    setIsPaused(true)
  }, [])

  const startGame = useCallback(() => {
    if (gameOver) {
      resetGame()
    }
    setIsPaused(false)
    gameAreaRef.current?.focus()
  }, [gameOver, resetGame])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent | KeyboardEvent) => {
      if (gameOver) return

      const key = e.key

      if (key === " " || key === "Escape") {
        e.preventDefault()
        setIsPaused((prev) => !prev)
        return
      }

      if (isPaused) return

      const currentDir = directionRef.current

      switch (key) {
        case "ArrowUp":
        case "w":
        case "W":
          if (currentDir !== "DOWN") {
            setDirection("UP")
            directionRef.current = "UP"
          }
          break
        case "ArrowDown":
        case "s":
        case "S":
          if (currentDir !== "UP") {
            setDirection("DOWN")
            directionRef.current = "DOWN"
          }
          break
        case "ArrowLeft":
        case "a":
        case "A":
          if (currentDir !== "RIGHT") {
            setDirection("LEFT")
            directionRef.current = "LEFT"
          }
          break
        case "ArrowRight":
        case "d":
        case "D":
          if (currentDir !== "LEFT") {
            setDirection("RIGHT")
            directionRef.current = "RIGHT"
          }
          break
      }
    },
    [gameOver, isPaused]
  )

  // Game loop
  useEffect(() => {
    if (isPaused || gameOver) return

    const moveSnake = () => {
      setSnake((prevSnake) => {
        const head = prevSnake[0]
        const currentDirection = directionRef.current
        let newHead: Position

        switch (currentDirection) {
          case "UP":
            newHead = { x: head.x, y: head.y - 1 }
            break
          case "DOWN":
            newHead = { x: head.x, y: head.y + 1 }
            break
          case "LEFT":
            newHead = { x: head.x - 1, y: head.y }
            break
          case "RIGHT":
            newHead = { x: head.x + 1, y: head.y }
            break
        }

        // Check wall collision
        if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
          setGameOver(true)
          setHighScore((prev) => Math.max(prev, score))
          return prevSnake
        }

        // Check self collision
        if (prevSnake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
          setGameOver(true)
          setHighScore((prev) => Math.max(prev, score))
          return prevSnake
        }

        const newSnake = [newHead, ...prevSnake]

        // Check if food is eaten
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore((prev) => prev + 10)
          setFood(getRandomPosition(newSnake))
          return newSnake
        }

        // Remove tail if no food eaten
        newSnake.pop()
        return newSnake
      })
    }

    const gameInterval = setInterval(moveSnake, INITIAL_SPEED)
    return () => clearInterval(gameInterval)
  }, [isPaused, gameOver, food, score])

  // Focus game area on mount
  useEffect(() => {
    gameAreaRef.current?.focus()
  }, [])

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Score display */}
      <div className="flex items-center gap-8">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Score</p>
          <p className="text-3xl font-bold text-emerald-500">{score}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">High Score</p>
          <p className="text-3xl font-bold text-amber-500">{highScore}</p>
        </div>
      </div>

      {/* Game board */}
      <div
        ref={gameAreaRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className="relative rounded-lg border-4 border-foreground/20 bg-muted/50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        style={{
          width: GRID_SIZE * CELL_SIZE,
          height: GRID_SIZE * CELL_SIZE,
        }}
      >
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(to right, currentColor 1px, transparent 1px),
              linear-gradient(to bottom, currentColor 1px, transparent 1px)
            `,
            backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`,
          }}
        />

        {/* Snake */}
        {snake.map((segment, index) => (
          <div
            key={index}
            className={`absolute rounded-sm transition-all duration-75 ${
              index === 0 ? "bg-emerald-500 shadow-lg shadow-emerald-500/50" : "bg-emerald-400"
            }`}
            style={{
              width: CELL_SIZE - 2,
              height: CELL_SIZE - 2,
              left: segment.x * CELL_SIZE + 1,
              top: segment.y * CELL_SIZE + 1,
              transform: index === 0 ? "scale(1.05)" : "scale(1)",
            }}
          >
            {/* Snake eyes on head */}
            {index === 0 && (
              <div className="absolute inset-0 flex items-center justify-center gap-1">
                <div className="h-1.5 w-1.5 rounded-full bg-white" />
                <div className="h-1.5 w-1.5 rounded-full bg-white" />
              </div>
            )}
          </div>
        ))}

        {/* Food */}
        <div
          className="absolute animate-pulse rounded-full bg-red-500 shadow-lg shadow-red-500/50"
          style={{
            width: CELL_SIZE - 4,
            height: CELL_SIZE - 4,
            left: food.x * CELL_SIZE + 2,
            top: food.y * CELL_SIZE + 2,
          }}
        />

        {/* Game Over Overlay */}
        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-lg bg-background/90 backdrop-blur-sm">
            <h2 className="text-3xl font-bold text-destructive">Game Over!</h2>
            <p className="text-lg text-muted-foreground">Final Score: {score}</p>
            <Button onClick={startGame} className="bg-emerald-500 hover:bg-emerald-600 text-white">
              Play Again
            </Button>
          </div>
        )}

        {/* Start/Pause Overlay */}
        {isPaused && !gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-lg bg-background/90 backdrop-blur-sm">
            <h2 className="text-2xl font-bold">
              {snake.length === 1 ? "Snake Game" : "Paused"}
            </h2>
            <Button onClick={startGame} className="bg-emerald-500 hover:bg-emerald-600 text-white">
              {snake.length === 1 ? "Start Game" : "Resume"}
            </Button>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="text-center text-sm text-muted-foreground">
        <p className="mb-2 font-medium">Controls</p>
        <div className="flex flex-wrap justify-center gap-4">
          <span>
            <kbd className="rounded bg-muted px-2 py-1 font-mono">↑↓←→</kbd> or{" "}
            <kbd className="rounded bg-muted px-2 py-1 font-mono">WASD</kbd> to move
          </span>
          <span>
            <kbd className="rounded bg-muted px-2 py-1 font-mono">Space</kbd> to pause
          </span>
        </div>
      </div>

      {/* Mobile controls */}
      <div className="grid grid-cols-3 gap-2 md:hidden">
        <div />
        <Button
          variant="outline"
          size="lg"
          onTouchStart={() => {
            if (directionRef.current !== "DOWN" && !isPaused && !gameOver) {
              setDirection("UP")
              directionRef.current = "UP"
            }
          }}
          className="h-14 w-14"
        >
          ↑
        </Button>
        <div />
        <Button
          variant="outline"
          size="lg"
          onTouchStart={() => {
            if (directionRef.current !== "RIGHT" && !isPaused && !gameOver) {
              setDirection("LEFT")
              directionRef.current = "LEFT"
            }
          }}
          className="h-14 w-14"
        >
          ←
        </Button>
        <Button
          variant="outline"
          size="lg"
          onTouchStart={() => {
            if (!gameOver) {
              if (isPaused) {
                startGame()
              } else {
                setIsPaused(true)
              }
            }
          }}
          className="h-14 w-14 text-xs"
        >
          {isPaused ? "▶" : "⏸"}
        </Button>
        <Button
          variant="outline"
          size="lg"
          onTouchStart={() => {
            if (directionRef.current !== "LEFT" && !isPaused && !gameOver) {
              setDirection("RIGHT")
              directionRef.current = "RIGHT"
            }
          }}
          className="h-14 w-14"
        >
          →
        </Button>
        <div />
        <Button
          variant="outline"
          size="lg"
          onTouchStart={() => {
            if (directionRef.current !== "UP" && !isPaused && !gameOver) {
              setDirection("DOWN")
              directionRef.current = "DOWN"
            }
          }}
          className="h-14 w-14"
        >
          ↓
        </Button>
        <div />
      </div>
    </div>
  )
}
