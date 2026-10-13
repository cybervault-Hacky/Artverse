import { PreviewBlock } from './PreviewBlock'
import {
  COLOR_GROUPS,
  RADIUS_SCALE,
  SECTION_SPACING,
  SHADOW_SCALE,
  SPACE_SCALE,
  TYPE_SCALE,
} from '@/data/designSystemDocs'
import styles from './FoundationSections.module.css'

const TYPE_SIZE_STYLES: Record<string, string> = {
  '--text-display': 'var(--text-display)',
  '--text-title': 'var(--text-title)',
  '--text-section': 'var(--text-section)',
  '--text-heading': 'var(--text-heading)',
  '--text-lead': 'var(--text-lead)',
  '--text-body': 'var(--text-body)',
  '--text-small': 'var(--text-small)',
  '--text-meta': 'var(--text-meta)',
  '--text-label': 'var(--text-label)',
}

const SHADOW_STYLES: Record<string, string> = {
  '--shadow-soft': 'var(--shadow-soft)',
  '--shadow-frame': 'var(--shadow-frame)',
  '--shadow-lift': 'var(--shadow-lift)',
}

const RADIUS_STYLES: Record<string, string> = {
  '--radius-xs': 'var(--radius-xs)',
  '--radius-sm': 'var(--radius-sm)',
  '--radius-md': 'var(--radius-md)',
  '--radius-lg': 'var(--radius-lg)',
  '--radius-xl': 'var(--radius-xl)',
  '--radius-pill': 'var(--radius-pill)',
}

/**
 * Foundations: colour, typography, spacing, borders, radii and shadows, shown
 * with the custom property that carries each value.
 */
export function FoundationSections() {
  return (
    <>
      <PreviewBlock
        id="ds-colour"
        title="Colour palette"
        description="Six surface values, four text values, two hairlines, one accent and one contrast charcoal. The interface stays light; charcoal appears only where a section genuinely needs contrast."
      >
        {COLOR_GROUPS.map((group) => (
          <div key={group.title} className={styles.group}>
            <h4 className={styles.groupTitle}>{group.title}</h4>
            <ul className={styles.swatches}>
              {group.tokens.map((token) => (
                <li key={token.token} className={styles.swatch}>
                  <span
                    className={styles.chip}
                    style={{ backgroundColor: `var(${token.token})` }}
                    aria-hidden="true"
                  />
                  <span className={styles.chipName}>{token.token}</span>
                  <span className={styles.chipValue}>{token.value}</span>
                  <span className={styles.chipUsage}>{token.usage}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </PreviewBlock>

      <PreviewBlock
        id="ds-typography"
        title="Typography scale"
        description="Playfair Display Variable for headings, Inter Variable for everything else. Both are self-hosted, so the interface makes no third-party font requests."
      >
        <div className={styles.typeList}>
          {TYPE_SCALE.map((entry) => (
            <div key={entry.token} className={styles.typeRow}>
              <div className={styles.typeMeta}>
                <span className={styles.typeToken}>{entry.token}</span>
                <span>{entry.size}</span>
                <span>{entry.family === 'display' ? 'Playfair Display' : 'Inter'}</span>
              </div>
              <p
                className={[
                  styles.typeSample,
                  entry.family === 'display' ? styles.display : styles.sans,
                  entry.uppercase ? styles.uppercase : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                style={{ fontSize: TYPE_SIZE_STYLES[entry.token] }}
              >
                {entry.sample}
              </p>
              <p className={styles.typeMeta}>{entry.usage}</p>
            </div>
          ))}
        </div>
      </PreviewBlock>

      <PreviewBlock
        id="ds-spacing"
        title="Spacing scale"
        description="A 4px base scale. Sections use the two clamped tokens below so vertical rhythm tightens on phones without crowding."
      >
        <ul className={styles.spacingList}>
          {[...SPACE_SCALE, ...SECTION_SPACING].map((token) => {
            const pixels = Number.parseInt(token.px, 10)
            const width = Number.isNaN(pixels) ? 96 : Math.min(pixels, 240)

            return (
              <li key={token.token} className={styles.spacingRow}>
                <span className={styles.spacingToken}>{token.token}</span>
                <span className={styles.spacingBarTrack}>
                  <span
                    className={styles.spacingBar}
                    style={{ width: `${width}px` }}
                    aria-hidden="true"
                  />
                  <span className={styles.spacingValue}>
                    {token.value} · {token.px}
                  </span>
                </span>
              </li>
            )
          })}
        </ul>
      </PreviewBlock>

      <PreviewBlock
        id="ds-radii"
        title="Radii"
        description="Corner radii stay inside a small, coherent set: controls and inline details are almost square, media frames are gently rounded, and pills are reserved for markers."
      >
        <ul className={styles.radiiGrid}>
          {RADIUS_SCALE.map((token) => (
            <li key={token.token} className={styles.radiusSample}>
              <span
                className={styles.radiusBox}
                style={{ borderRadius: RADIUS_STYLES[token.token] }}
                aria-hidden="true"
              />
              <span className={styles.tokenName}>{token.token}</span>
              <span className={styles.tokenMeta}>
                {token.value} — {token.usage}
              </span>
            </li>
          ))}
        </ul>
      </PreviewBlock>

      <PreviewBlock
        id="ds-shadows"
        title="Borders and shadows"
        description="Elevation is soft and low contrast. Artwork frames carry a faint shelf shadow so a work reads as an object rather than a flat image."
      >
        <ul className={styles.shadowGrid}>
          {SHADOW_SCALE.map((token) => (
            <li key={token.token} className={styles.shadowSample}>
              <span
                className={styles.shadowBox}
                style={{ boxShadow: SHADOW_STYLES[token.token] }}
                aria-hidden="true"
              />
              <span className={styles.tokenName}>{token.token}</span>
              <span className={styles.tokenMeta}>
                {token.value} — {token.usage}
              </span>
            </li>
          ))}
        </ul>
      </PreviewBlock>
    </>
  )
}
