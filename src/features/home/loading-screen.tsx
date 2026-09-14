import { useEffect, useId, useRef, useState, type CSSProperties } from "react"
import styles from "./loading-screen.module.css"

type LoaderProps = { onLoadingComplete?: () => void }
type LoaderPhase = "loading" | "wiping" | "exiting"

const ASSEMBLY_DURATION = 1800
const LOAD_DURATION = 4460
const COMPLETION_HOLD_DURATION = 300
const WIPE_DURATION = 340
const REDUCED_HOLD_DURATION = 120
const REDUCED_EXIT_DURATION = 140

const SLICES = [
  { y: 0, height: 98, offset: -8, scaleX: 1.012, scaleY: 0.99, kick: -20, idle: 0 },
  { y: 98, height: 94, offset: 5, scaleX: 0.994, scaleY: 1.008, kick: 14, idle: 2 },
  { y: 192, height: 95, offset: -3, scaleX: 1.008, scaleY: 0.996, kick: -11, idle: -1 },
  { y: 287, height: 103, offset: 6, scaleX: 0.997, scaleY: 1.006, kick: 17, idle: 0 },
  { y: 390, height: 96, offset: 4, scaleX: 1.006, scaleY: 0.995, kick: 12, idle: -2 },
  { y: 486, height: 91, offset: -7, scaleX: 0.992, scaleY: 1.01, kick: -19, idle: 2 },
  { y: 577, height: 93, offset: 2, scaleX: 1.009, scaleY: 0.996, kick: 9, idle: 0 },
  { y: 670, height: 110, offset: -5, scaleX: 0.996, scaleY: 1.007, kick: -15, idle: -1 },
] as const

const TOP_PATCHES = [
  { x: 90, y: 72, width: 245, height: 118 },
  { x: 410, y: 168, width: 190, height: 96 },
  { x: 675, y: 236, width: 235, height: 112 },
] as const

const Loader = ({ onLoadingComplete }: LoaderProps) => {
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState<LoaderPhase>("loading")
  const onLoadingCompleteRef = useRef(onLoadingComplete)
  const didCompleteRef = useRef(false)
  const svgId = `loader-${useId().replace(/:/g, "")}`

  useEffect(() => {
    onLoadingCompleteRef.current = onLoadingComplete
  }, [onLoadingComplete])

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const timers: ReturnType<typeof setTimeout>[] = []
    let animationFrame: number | undefined
    let cancelled = false
    let previousProgress = -1

    const finish = () => {
      if (cancelled || didCompleteRef.current) return
      didCompleteRef.current = true
      setPhase("exiting")
      onLoadingCompleteRef.current?.()
    }

    if (reducedMotion) {
      setProgress(100)
      timers.push(
        setTimeout(() => {
          if (cancelled) return
          setPhase("wiping")
          timers.push(setTimeout(finish, REDUCED_EXIT_DURATION))
        }, REDUCED_HOLD_DURATION),
      )
    } else {
      const startedAt = performance.now()
      const updateProgress = (now: number) => {
        if (cancelled) return

        const nextProgress = Math.min(100, Math.round(((now - startedAt) / LOAD_DURATION) * 100))
        if (nextProgress !== previousProgress) {
          previousProgress = nextProgress
          setProgress(nextProgress)
        }

        if (nextProgress < 100) {
          animationFrame = window.requestAnimationFrame(updateProgress)
          return
        }

        timers.push(
          setTimeout(() => {
            if (cancelled) return
            setPhase("wiping")
            timers.push(setTimeout(finish, WIPE_DURATION))
          }, COMPLETION_HOLD_DURATION),
        )
      }

      animationFrame = window.requestAnimationFrame(updateProgress)
    }

    return () => {
      cancelled = true
      if (animationFrame !== undefined) window.cancelAnimationFrame(animationFrame)
      timers.forEach(clearTimeout)
    }
  }, [])

  const lineOneId = `${svgId}-line-one`
  const lineTwoId = `${svgId}-line-two`
  return (
    <output
      className={`${styles.wrapper} ${progress >= 95 ? styles.locked : ""} ${phase === "wiping" ? styles.wiping : ""} ${phase === "exiting" ? styles.exiting : ""}`}
      data-loader-phase={phase}
      style={
        {
          "--assembly-duration": `${ASSEMBLY_DURATION}ms`,
          "--timeline-duration": `${LOAD_DURATION}ms`,
          "--wipe-duration": `${WIPE_DURATION}ms`,
        } as CSSProperties
      }
      aria-live="polite"
      aria-atomic="true"
    >
      <span className={styles.srOnly}>T4ko0522を読み込んでいます</span>

      <svg
        className={styles.wordmark}
        viewBox="0 0 1000 780"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <text
            id={lineOneId}
            x="500"
            y="350"
            textAnchor="middle"
            textLength="920"
            lengthAdjust="spacingAndGlyphs"
          >
            T4ko
          </text>
          <text
            id={lineTwoId}
            x="500"
            y="735"
            textAnchor="middle"
            textLength="920"
            lengthAdjust="spacingAndGlyphs"
          >
            0522
          </text>

          {SLICES.map((slice, index) => (
            <clipPath id={`${svgId}-slice-${index}`} clipPathUnits="userSpaceOnUse" key={index}>
              <rect x="0" y={slice.y} width="1000" height={slice.height} />
            </clipPath>
          ))}
          {TOP_PATCHES.map((patch, index) => (
            <clipPath id={`${svgId}-top-patch-${index}`} clipPathUnits="userSpaceOnUse" key={index}>
              <rect x={patch.x} y={patch.y} width={patch.width} height={patch.height} />
            </clipPath>
          ))}
          <clipPath id={`${svgId}-lower-accent`} clipPathUnits="userSpaceOnUse">
            <rect x="350" y="390" width="570" height="390" />
          </clipPath>
          <filter
            id={`${svgId}-horizontal-trail`}
            x="0"
            y="390"
            width="1000"
            height="390"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur stdDeviation="2 0" />
          </filter>
        </defs>

        {[1, 2].map((outline) => (
          <g
            className={`${styles.idleOutline} ${styles[`idleOutline${outline}`]}`}
            style={
              {
                "--outline-offset": `${outline === 1 ? 2 : -4}px`,
                "--outline-opacity": outline === 1 ? 0.2 : 0.1,
                "--outline-delay": `${outline * 55}ms`,
              } as CSSProperties
            }
            key={outline}
          >
            <use href={`#${lineOneId}`} />
            <use href={`#${lineTwoId}`} />
          </g>
        ))}

        <g className={styles.slices}>
          {SLICES.map((slice, index) => (
            <g
              className={styles.slicePosition}
              clipPath={`url(#${svgId}-slice-${index})`}
              style={
                {
                  "--slice-offset": `${slice.offset}px`,
                  "--slice-scale-x": slice.scaleX,
                  "--slice-scale-y": slice.scaleY,
                  "--slice-kick": `${slice.kick}px`,
                  "--slice-rebound": `${slice.kick * -0.32}px`,
                  "--slice-micro": `${slice.kick * 0.23}px`,
                  "--slice-idle": `${slice.idle}px`,
                  "--idle-jitter": `${slice.idle === 0 ? 0 : slice.idle > 0 ? 1 : -1}px`,
                  "--idle-jitter-opposite": `${slice.idle === 0 ? 0 : slice.idle > 0 ? -1 : 1}px`,
                  "--jitter-delay": `${index * 17}ms`,
                } as CSSProperties
              }
              key={index}
            >
              <g className={styles.sliceMotion}>
                <use href={`#${lineOneId}`} />
                <use href={`#${lineTwoId}`} />
              </g>
            </g>
          ))}
        </g>

        {TOP_PATCHES.map((patch, index) => (
          <g
            className={`${styles.topPatch} ${styles[`topPatch${index + 1}`]}`}
            clipPath={`url(#${svgId}-top-patch-${index})`}
            key={patch.x}
          >
            <rect
              className={styles.patchCover}
              x={patch.x}
              y={patch.y}
              width={patch.width}
              height={patch.height}
            />
            <use
              className={styles.patchGlyph}
              href={`#${lineOneId}`}
              style={{
                transformOrigin: `${patch.x + patch.width / 2}px ${patch.y + patch.height / 2}px`,
              }}
            />
          </g>
        ))}

        <g className={styles.lowerAccent} clipPath={`url(#${svgId}-lower-accent)`}>
          <rect className={styles.patchCover} x="350" y="390" width="570" height="390" />
          <use className={styles.lowerAccentGlyph} href={`#${lineTwoId}`} />
        </g>

        {[1, 2, 3].map((echo) => (
          <g
            className={`${styles.lowerEcho} ${styles[`echo${echo}`]}`}
            clipPath={`url(#${svgId}-lower-accent)`}
            filter={echo === 3 ? `url(#${svgId}-horizontal-trail)` : undefined}
            style={
              {
                "--echo-opacity": echo === 1 ? 0.32 : echo === 2 ? 0.2 : 0.11,
                "--echo-delay": `${echo === 1 ? 40 : echo === 2 ? 60 : 80}ms`,
              } as CSSProperties
            }
            key={echo}
          >
            <use href={`#${lineTwoId}`} />
          </g>
        ))}
      </svg>

      <div className={styles.footer} aria-hidden="true">
        <span>Loading</span>
        <span className={styles.progress}>{progress}%</span>
      </div>
    </output>
  )
}

export default Loader
