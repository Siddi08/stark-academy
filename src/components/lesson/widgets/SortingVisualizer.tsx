import { useState, useEffect, useRef, useCallback } from 'react'
import { Play, Pause, Shuffle, SkipForward } from 'lucide-react'
import { cn } from '@/utils/cn'

type Algorithm = 'bubble' | 'insertion'

interface Step {
  array: number[]
  comparing: [number, number] | null
  sortedUpTo: number
}

function shuffle(arr: number[]): number[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function* bubbleSortSteps(initial: number[]): Generator<Step> {
  const arr = [...initial]
  const n = arr.length
  let sortedUpTo = n

  for (let i = 0; i < n - 1; i++) {
    let swapped = false
    for (let j = 0; j < n - i - 1; j++) {
      yield { array: [...arr], comparing: [j, j + 1], sortedUpTo }
      if (arr[j] > arr[j + 1]) {
        ;[arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]
        swapped = true
        yield { array: [...arr], comparing: [j, j + 1], sortedUpTo }
      }
    }
    sortedUpTo = n - i - 1
    if (!swapped) break
  }

  yield { array: [...arr], comparing: null, sortedUpTo: 0 }
}

function* insertionSortSteps(initial: number[]): Generator<Step> {
  const arr = [...initial]
  const n = arr.length
  let sortedUpTo = 1

  for (let i = 1; i < n; i++) {
    let j = i
    while (j > 0) {
      yield { array: [...arr], comparing: [j - 1, j], sortedUpTo }
      if (arr[j - 1] > arr[j]) {
        ;[arr[j - 1], arr[j]] = [arr[j], arr[j - 1]]
        yield { array: [...arr], comparing: [j - 1, j], sortedUpTo }
        j--
      } else {
        break
      }
    }
    sortedUpTo = i + 1
  }

  yield { array: [...arr], comparing: null, sortedUpTo: 0 }
}

const SIZE = 16
const INITIAL = shuffle(Array.from({ length: SIZE }, (_, i) => i + 1))

export function SortingVisualizer() {
  const [algorithm, setAlgorithm] = useState<Algorithm>('bubble')
  const [baseArray, setBaseArray] = useState<number[]>(INITIAL)
  const [currentStep, setCurrentStep] = useState<Step>({
    array: INITIAL,
    comparing: null,
    sortedUpTo: SIZE,
  })
  const [steps, setSteps] = useState<Step[]>([])
  const [stepIndex, setStepIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(400)
  const [comparisons, setComparisons] = useState(0)
  const [done, setDone] = useState(false)

  const playingRef = useRef(false)
  const speedRef = useRef(speed)
  const stepIndexRef = useRef(0)

  useEffect(() => { speedRef.current = speed }, [speed])
  useEffect(() => { stepIndexRef.current = stepIndex }, [stepIndex])

  const buildSteps = useCallback((arr: number[], algo: Algorithm): Step[] => {
    const gen = algo === 'bubble' ? bubbleSortSteps(arr) : insertionSortSteps(arr)
    const result: Step[] = []
    for (const s of gen) result.push(s)
    return result
  }, [])

  const reset = useCallback((arr: number[], algo: Algorithm) => {
    playingRef.current = false
    setPlaying(false)
    const allSteps = buildSteps(arr, algo)
    setSteps(allSteps)
    setStepIndex(0)
    stepIndexRef.current = 0
    setCurrentStep({ array: arr, comparing: null, sortedUpTo: SIZE })
    setComparisons(0)
    setDone(false)
  }, [buildSteps])

  useEffect(() => {
    reset(baseArray, algorithm)
  }, [baseArray, algorithm, reset])

  const doShuffle = () => {
    const newArr = shuffle(Array.from({ length: SIZE }, (_, i) => i + 1))
    setBaseArray(newArr)
  }

  const advance = useCallback(() => {
    const idx = stepIndexRef.current
    setSteps(prev => {
      if (idx >= prev.length) return prev
      const step = prev[idx]
      setCurrentStep(step)
      if (step.comparing) setComparisons(c => c + 1)
      const nextIdx = idx + 1
      stepIndexRef.current = nextIdx
      setStepIndex(nextIdx)
      if (nextIdx >= prev.length) {
        setDone(true)
        playingRef.current = false
        setPlaying(false)
      }
      return prev
    })
  }, [])

  useEffect(() => {
    if (!playing) return
    playingRef.current = true

    const run = () => {
      if (!playingRef.current) return
      advance()
      if (playingRef.current) {
        timeoutRef.current = window.setTimeout(run, speedRef.current)
      }
    }

    const timeoutRef = { current: 0 }
    timeoutRef.current = window.setTimeout(run, speedRef.current)

    return () => {
      clearTimeout(timeoutRef.current)
    }
  }, [playing, advance])

  const togglePlay = () => {
    if (done) {
      reset(baseArray, algorithm)
      return
    }
    setPlaying(p => {
      playingRef.current = !p
      return !p
    })
  }

  const step = () => {
    if (done) return
    setPlaying(false)
    playingRef.current = false
    advance()
  }

  const { array, comparing, sortedUpTo } = currentStep
  const maxVal = SIZE

  const getBarState = (i: number): 'sorted' | 'comparing' | 'unsorted' => {
    if (done || sortedUpTo === 0) return 'sorted'
    if (comparing && (i === comparing[0] || i === comparing[1])) return 'comparing'
    if (algorithm === 'insertion' && i < sortedUpTo) return 'sorted'
    if (algorithm === 'bubble' && i >= sortedUpTo) return 'sorted'
    return 'unsorted'
  }

  return (
    <div className="not-prose my-8 p-5 sm:p-6 rounded-2xl border border-phase4/25 bg-surface">
      <div className="flex items-start justify-between mb-4">
        <div>
          <span className="font-heading text-xs text-phase4 uppercase tracking-widest">
            Sorting Visualizer
          </span>
          <p className="text-xs text-ghost mt-0.5">Watch comparison-based sorting step by step</p>
        </div>
        <span className={cn(
          'text-[10px] font-mono px-2 py-1 rounded-lg border',
          'border-fail/30 bg-fail/10 text-fail',
        )}>
          O(n²) comparisons
        </span>
      </div>

      <div className="flex gap-2 mb-4">
        {(['bubble', 'insertion'] as Algorithm[]).map(a => (
          <button
            key={a}
            onClick={() => setAlgorithm(a)}
            className={cn(
              'text-xs font-heading px-4 py-2 rounded-lg border transition-all duration-150 min-h-[36px] capitalize',
              algorithm === a
                ? 'border-spark-500/60 bg-spark-500/15 text-spark-300'
                : 'border-border text-ghost hover:border-rim hover:text-dim',
            )}
          >
            {a === 'bubble' ? 'Bubble Sort' : 'Insertion Sort'}
          </button>
        ))}
      </div>

      <div className="flex items-end gap-0.5 h-32 px-1 mb-3 bg-raised rounded-xl p-2">
        {array.map((val, i) => {
          const state = getBarState(i)
          return (
            <div
              key={i}
              className={cn(
                'flex-1 rounded-sm transition-all duration-150',
                state === 'sorted' && 'bg-phase1',
                state === 'comparing' && 'bg-phase4',
                state === 'unsorted' && 'bg-spark-400',
              )}
              style={{ height: `${(val / maxVal) * 100}%` }}
            />
          )
        })}
      </div>

      <div className="flex items-center gap-3 mb-3 flex-wrap">
        <div className="flex gap-1.5">
          <button
            onClick={doShuffle}
            className="btn-ghost text-xs px-3 min-h-[36px] flex items-center gap-1.5"
            title="Shuffle"
          >
            <Shuffle size={12} />
          </button>
          <button
            onClick={togglePlay}
            className="btn-primary text-xs px-4 min-h-[36px] flex items-center gap-1.5"
          >
            {playing ? <><Pause size={12} /> Pause</> : <><Play size={12} /> {done ? 'Replay' : 'Play'}</>}
          </button>
          <button
            onClick={step}
            disabled={done}
            className="btn-secondary text-xs px-3 min-h-[36px] flex items-center gap-1.5 disabled:opacity-40"
            title="Step"
          >
            <SkipForward size={12} />
            Step
          </button>
        </div>

        <div className="flex gap-4 ml-auto">
          <div className="text-center">
            <div className="font-mono text-sm font-bold text-ink tabular-nums">{stepIndex}</div>
            <div className="text-[10px] text-ghost">steps</div>
          </div>
          <div className="text-center">
            <div className="font-mono text-sm font-bold text-phase4 tabular-nums">{comparisons}</div>
            <div className="text-[10px] text-ghost">comparisons</div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-[10px] text-ghost whitespace-nowrap">Slow</span>
        <input
          type="range"
          min={100}
          max={800}
          step={50}
          value={800 - speed + 100}
          onChange={e => setSpeed(800 - Number(e.target.value) + 100)}
          className="flex-1 accent-phase4 h-1"
        />
        <span className="text-[10px] text-ghost whitespace-nowrap">Fast</span>
      </div>

      <div className="flex gap-3 mt-3 text-[10px] text-ghost flex-wrap">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-spark-400 flex-shrink-0" />
          Unsorted
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-phase4 flex-shrink-0" />
          Comparing
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-phase1 flex-shrink-0" />
          Sorted
        </span>
      </div>
    </div>
  )
}
