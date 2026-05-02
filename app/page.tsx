import { SnakeGame } from "@/components/snake-game"

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <h1 className="text-4xl font-bold mb-8 text-balance text-center">
        🐍 Snake Game
      </h1>
      <SnakeGame />
    </main>
  )
}
