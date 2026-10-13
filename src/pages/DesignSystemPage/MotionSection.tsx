import { useMemo, useState } from 'react'
import { FloatingArtwork, type FloatingVariant } from '@/components/FloatingArtwork/FloatingArtwork'
import { Button } from '@/components/Button/Button'
import { getArtworkById } from '@/data'
import { MOTION_TOKENS } from '@/data/designSystemDocs'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { cn } from '@/utils/cn'
import { PreviewBlock } from './PreviewBlock'
import table from './table.module.css'
import styles from './MotionSection.module.css'

const PROTOTYPE_WORK_IDS = [
  'sample-painting-01',
  'sample-handmade-01',
  'sample-decor-01',
  'sample-digital-01',
]

/**
 * Motion: the floating-art prototype, the motion tokens behind it, and the
 * live state of the visitor's reduced-motion preference.
 */
export function MotionSection() {
  const prefersReducedMotion = useReducedMotion()
  const [variant, setVariant] = useState<FloatingVariant>('default')
  const [paused, setPaused] = useState(false)

  const works = useMemo(
    () =>
      PROTOTYPE_WORK_IDS.map((id) => getArtworkById(id)).filter(
        (artwork) => artwork !== undefined,
      ),
    [],
  )

  return (
    <>
      <PreviewBlock
        id="ds-floating"
        title="Floating-art prototype"
        description="The signature ArtVerse composition, running live in the homepage hero: one dominant work with smaller pieces around it, drifting slowly left to right inside its own stage. This is the same component the homepage renders, with no animation library behind it — two very slow CSS keyframe loops per work, composited on transform and translate."
      >
        <div className={styles.prototypeStage}>
          <FloatingArtwork works={works} variant={variant} paused={paused} />
        </div>

        <div className={styles.motionLayout}>
          <div className={styles.explainer}>
            <p>
              <strong>Positioning.</strong> The stage is a 1:1 canvas with percentage-placed works
              inside an overflow-hidden wrapper, so the composition can never widen the page and
              never sits over the headline or the buttons.
            </p>
            <p>
              <strong>Motion.</strong> Every work carries its own drift distance, duration and
              delay — 30 to 46 seconds horizontally, 26 to 39 seconds vertically — and each loop
              eases into its turnaround rather than stopping dead. Negative delays stagger the
              works, so the first paint already looks settled and nothing restarts in unison.
            </p>
            <p>
              <strong>Weight.</strong> Only transform and translate animate, with four images,
              three orbit lines and a warm wash in total — no canvas, no JavaScript per frame and no
              layout work while it runs, which keeps mid-range Android devices comfortable. Phones
              drop to three works with shorter travel.
            </p>
          </div>

          <div className={styles.controls}>
            <div className={styles.controlGroup}>
              <span className={styles.controlLabel} id="floating-variant-label">
                Composition
              </span>
              <div
                className={styles.controlRow}
                role="group"
                aria-labelledby="floating-variant-label"
              >
                <Button
                  size="sm"
                  variant={variant === 'default' ? 'primary' : 'secondary'}
                  aria-pressed={variant === 'default'}
                  onClick={() => setVariant('default')}
                >
                  Full (4 works)
                </Button>
                <Button
                  size="sm"
                  variant={variant === 'compact' ? 'primary' : 'secondary'}
                  aria-pressed={variant === 'compact'}
                  onClick={() => setVariant('compact')}
                >
                  Compact (2 works)
                </Button>
              </div>
            </div>

            <div className={styles.controlGroup}>
              <span className={styles.controlLabel} id="floating-state-label">
                Drift
              </span>
              <div
                className={styles.controlRow}
                role="group"
                aria-labelledby="floating-state-label"
              >
                <Button
                  size="sm"
                  variant={paused ? 'secondary' : 'primary'}
                  aria-pressed={!paused}
                  onClick={() => setPaused(false)}
                >
                  Moving
                </Button>
                <Button
                  size="sm"
                  variant={paused ? 'primary' : 'secondary'}
                  aria-pressed={paused}
                  onClick={() => setPaused(true)}
                >
                  Frozen
                </Button>
              </div>
              <p className={styles.statusText}>
                Freezing pauses the animation without removing the composition, which is exactly
                what reduced-motion visitors get — parked in a deliberate arrangement.
              </p>
            </div>
          </div>
        </div>

        <div className={styles.status} role="status" aria-live="polite">
          <span className={styles.statusRow}>
            <span className={styles.statusDot} aria-hidden="true" />
            <strong>
              {prefersReducedMotion
                ? 'Reduced motion is requested on this device.'
                : 'No reduced-motion preference detected.'}
            </strong>
          </span>
          <span className={styles.statusText}>
            {prefersReducedMotion
              ? 'The floating drift is off, hover lifts are removed and transitions collapse. Nothing on the page depends on movement to be understood.'
              : 'Set your operating system to reduce motion and this prototype will stop drifting on its own — no toggle required.'}
          </span>
        </div>

        <div className={cn(table.wrapper, styles.motionTokens)}>
          <table className={table.table}>
            <caption>Motion tokens — the only values components may use.</caption>
            <thead>
              <tr>
                <th scope="col">Token</th>
                <th scope="col">Value</th>
                <th scope="col">Used for</th>
              </tr>
            </thead>
            <tbody>
              {MOTION_TOKENS.map((token) => (
                <tr key={token.token}>
                  <td className={table.mono}>{token.token}</td>
                  <td className={table.mono}>{token.value}</td>
                  <td className={table.muted}>{token.usage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PreviewBlock>
    </>
  )
}
