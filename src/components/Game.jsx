import { useEffect, useRef, useState } from 'react'

const WIDTH = 360
const HEIGHT = 600
const GROUND_HEIGHT = 100
const GRAVITY = 0.5
const FLAP = -8
const PIPE_GAP = 140
const PIPE_WIDTH = 70
const PIPE_SPEED = 2.5

function rand(min, max) {
  return Math.random() * (max - min) + min
}

export default function Game() {
  const canvasRef = useRef(null)
  const rafRef = useRef(null)

  const [running, setRunning] = useState(false)
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(() => Number(localStorage.getItem('flappy-best') || 0))
  const [gameOver, setGameOver] = useState(false)

  const stateRef = useRef({
    bird: { x: 80, y: HEIGHT / 2, vy: 0, r: 16 },
    pipes: [],
    frame: 0,
    passedId: null,
  })

  useEffect(() => {
    const canvas = canvasRef.current
    canvas.width = WIDTH
    canvas.height = HEIGHT

    const ctx = canvas.getContext('2d')

    const spawnPipe = () => {
      const holeY = rand(120, HEIGHT - GROUND_HEIGHT - 120)
      const id = Math.random().toString(36).slice(2)
      stateRef.current.pipes.push({
        id,
        x: WIDTH + 20,
        w: PIPE_WIDTH,
        gapTop: holeY - PIPE_GAP / 2,
        gapBottom: holeY + PIPE_GAP / 2,
        scored: false,
      })
    }

    const reset = () => {
      stateRef.current = {
        bird: { x: 80, y: HEIGHT / 2, vy: 0, r: 16 },
        pipes: [],
        frame: 0,
        passedId: null,
      }
      setScore(0)
      setGameOver(false)
    }

    const flap = () => {
      stateRef.current.bird.vy = FLAP
    }

    const drawBackground = () => {
      // sky gradient
      const g = ctx.createLinearGradient(0, 0, 0, HEIGHT)
      g.addColorStop(0, '#0f172a')
      g.addColorStop(1, '#1e293b')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, WIDTH, HEIGHT)

      // stars
      ctx.fillStyle = 'rgba(255,255,255,0.08)'
      for (let i = 0; i < 40; i++) {
        const x = (i * 97 + stateRef.current.frame * 0.2) % WIDTH
        const y = (i * 53) % (HEIGHT - GROUND_HEIGHT)
        ctx.fillRect(x, y, 2, 2)
      }

      // ground
      ctx.fillStyle = '#0b1220'
      ctx.fillRect(0, HEIGHT - GROUND_HEIGHT, WIDTH, GROUND_HEIGHT)
      ctx.fillStyle = '#0ea5e9'
      ctx.fillRect(0, HEIGHT - GROUND_HEIGHT, WIDTH, 4)
    }

    const drawBird = () => {
      const { x, y, r } = stateRef.current.bird
      // body
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fillStyle = '#38bdf8'
      ctx.fill()
      // wing
      ctx.beginPath()
      ctx.arc(x - 6, y, r * 0.6, Math.PI * 0.2, Math.PI * 1.8)
      ctx.fillStyle = '#7dd3fc'
      ctx.fill()
      // eye
      ctx.beginPath()
      ctx.arc(x + 6, y - 4, 3, 0, Math.PI * 2)
      ctx.fillStyle = 'white'
      ctx.fill()
      ctx.beginPath()
      ctx.arc(x + 7, y - 4, 1.5, 0, Math.PI * 2)
      ctx.fillStyle = '#0f172a'
      ctx.fill()
      // beak
      ctx.fillStyle = '#f59e0b'
      ctx.beginPath()
      ctx.moveTo(x + r - 4, y - 2)
      ctx.lineTo(x + r + 8, y + 2)
      ctx.lineTo(x + r - 4, y + 6)
      ctx.closePath()
      ctx.fill()
    }

    const drawPipes = () => {
      ctx.fillStyle = '#22d3ee'
      ctx.strokeStyle = '#06b6d4'
      ctx.lineWidth = 3
      for (const p of stateRef.current.pipes) {
        // top pipe
        ctx.beginPath()
        ctx.rect(p.x, 0, p.w, p.gapTop)
        ctx.fill()
        ctx.stroke()
        // bottom pipe
        ctx.beginPath()
        ctx.rect(p.x, p.gapBottom, p.w, HEIGHT - GROUND_HEIGHT - p.gapBottom)
        ctx.fill()
        ctx.stroke()
      }
    }

    const update = () => {
      stateRef.current.frame++
      const bird = stateRef.current.bird
      bird.vy += GRAVITY
      bird.y += bird.vy

      // pipes movement/spawn
      if (stateRef.current.frame % 90 === 0) spawnPipe()
      for (const p of stateRef.current.pipes) {
        p.x -= PIPE_SPEED
      }
      // remove offscreen
      stateRef.current.pipes = stateRef.current.pipes.filter(p => p.x + p.w > -10)

      // scoring
      for (const p of stateRef.current.pipes) {
        if (!p.scored && bird.x > p.x + p.w) {
          p.scored = true
          setScore(s => {
            const ns = s + 1
            if (ns > best) {
              setBest(ns)
              localStorage.setItem('flappy-best', String(ns))
            }
            return ns
          })
        }
      }

      // collisions
      if (bird.y + bird.r > HEIGHT - GROUND_HEIGHT || bird.y - bird.r < 0) {
        setGameOver(true)
        setRunning(false)
      }
      for (const p of stateRef.current.pipes) {
        const withinX = bird.x + bird.r > p.x && bird.x - bird.r < p.x + p.w
        const hitTop = bird.y - bird.r < p.gapTop
        const hitBottom = bird.y + bird.r > p.gapBottom
        if (withinX && (hitTop || hitBottom)) {
          setGameOver(true)
          setRunning(false)
        }
      }
    }

    const drawHud = () => {
      ctx.fillStyle = 'rgba(15,23,42,0.6)'
      ctx.fillRect(10, 10, 90, 48)
      ctx.fillStyle = '#e2e8f0'
      ctx.font = 'bold 20px Inter, system-ui, sans-serif'
      ctx.fillText(`Score`, 18, 30)
      ctx.font = 'bold 22px Inter, system-ui, sans-serif'
      ctx.fillStyle = '#22d3ee'
      ctx.fillText(String(score).padStart(2, '0'), 18, 52)

      ctx.fillStyle = 'rgba(15,23,42,0.5)'
      ctx.fillRect(WIDTH - 110, 10, 100, 48)
      ctx.fillStyle = '#e2e8f0'
      ctx.font = 'bold 16px Inter, system-ui, sans-serif'
      ctx.fillText(`Best`, WIDTH - 100, 30)
      ctx.font = 'bold 20px Inter, system-ui, sans-serif'
      ctx.fillStyle = '#fbbf24'
      ctx.fillText(String(best).padStart(2, '0'), WIDTH - 100, 52)

      if (!running) {
        ctx.fillStyle = 'rgba(2,6,23,0.6)'
        ctx.fillRect(30, HEIGHT/2 - 80, WIDTH - 60, 140)
        ctx.strokeStyle = 'rgba(56,189,248,0.5)'
        ctx.strokeRect(30, HEIGHT/2 - 80, WIDTH - 60, 140)
        ctx.fillStyle = '#e2e8f0'
        ctx.font = 'bold 24px Inter, system-ui, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(gameOver ? 'Game Over' : 'Flappy Bird', WIDTH/2, HEIGHT/2 - 40)
        ctx.font = '16px Inter, system-ui, sans-serif'
        ctx.fillStyle = '#94a3b8'
        ctx.fillText('Tap / Click / Space to flap', WIDTH/2, HEIGHT/2 - 12)
        ctx.fillText('Press R to restart', WIDTH/2, HEIGHT/2 + 12)
        ctx.textAlign = 'start'
      }
    }

    const loop = () => {
      // update
      if (running) update()

      // draw
      drawBackground()
      drawPipes()
      drawBird()
      drawHud()

      rafRef.current = requestAnimationFrame(loop)
    }

    const onPointer = () => {
      if (!running) {
        if (gameOver) reset()
        setRunning(true)
      }
      flap()
    }

    const onKey = (e) => {
      if (e.code === 'Space') {
        e.preventDefault()
        onPointer()
      } else if (e.key.toLowerCase() === 'r') {
        reset()
      }
    }

    canvas.addEventListener('pointerdown', onPointer)
    window.addEventListener('keydown', onKey)

    loop()

    return () => {
      cancelAnimationFrame(rafRef.current)
      canvas.removeEventListener('pointerdown', onPointer)
      window.removeEventListener('keydown', onKey)
    }
  }, [running, score, best, gameOver])

  return (
    <div className="relative">
      <canvas ref={canvasRef} className="rounded-xl border border-blue-400/30 shadow-2xl" style={{ width: WIDTH, height: HEIGHT }} />
    </div>
  )
}
