import { ROUTE_ARCHITECTURE } from '@/app/routes'
import { BREAKPOINTS } from '@/data/designSystemDocs'
import { cn } from '@/utils/cn'
import { PreviewBlock } from './PreviewBlock'
import table from './table.module.css'
import styles from './ArchitectureSection.module.css'

const CHECKS = [
  { command: 'npm run dev', result: 'Vite dev server serves the app and every route on refresh.' },
  { command: 'npm run typecheck', result: 'Strict TypeScript project references build with no errors.' },
  { command: 'npm run lint', result: 'ESLint flat config passes with no warnings.' },
  { command: 'npm run build', result: 'Production build completes and emits dist/.' },
  { command: 'npm run preview', result: 'Built output serves the same routes from dist/.' },
]

/**
 * Responsive behaviour, the route table and the checks that back this phase up.
 */
export function ArchitectureSection() {
  return (
    <>
      <PreviewBlock
        id="ds-responsive"
        title="Responsive behaviour"
        description="Layout is driven by content width rather than device names. These are the widths Phase 1 was designed and reviewed against."
      >
        <div className={cn(table.wrapper, styles.table)}>
          <table className={table.table}>
            <caption>Breakpoints and what changes at each one.</caption>
            <thead>
              <tr>
                <th scope="col">Width</th>
                <th scope="col">Target</th>
                <th scope="col">Change</th>
              </tr>
            </thead>
            <tbody>
              {BREAKPOINTS.map((breakpoint) => (
                <tr key={breakpoint.width}>
                  <td className={table.mono}>{breakpoint.width}</td>
                  <td className={table.muted}>{breakpoint.target}</td>
                  <td>{breakpoint.change}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PreviewBlock>

      <PreviewBlock
        id="ds-routes"
        title="Route architecture"
        description="Every destination is its own page component with its own URL. Nothing is simulated with tabs or in-page sections, so browser history, direct links and refresh all behave normally."
      >
        <div className={cn(table.wrapper, styles.table)}>
          <table className={table.table}>
            <caption>Routes registered in src/app/routes.ts and src/app/App.tsx.</caption>
            <thead>
              <tr>
                <th scope="col">Path</th>
                <th scope="col">Page component</th>
                <th scope="col">Status</th>
                <th scope="col">Purpose in Phase 1</th>
              </tr>
            </thead>
            <tbody>
              {ROUTE_ARCHITECTURE.map((route) => (
                <tr key={route.pattern}>
                  <td className={table.mono}>{route.pattern}</td>
                  <td className={table.mono}>{route.page}</td>
                  <td>
                    <span className={styles.status}>
                      <span
                        className={cn(
                          styles.dot,
                          route.status === 'foundation' && styles.dotEmpty,
                        )}
                        aria-hidden="true"
                      />
                      {route.status === 'implemented' ? 'Implemented' : 'Foundation'}
                    </span>
                  </td>
                  <td>{route.purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className={styles.note}>
          “Foundation” means the route, page shell, metadata and honest states are in place, while
          the destination&rsquo;s real feature set belongs to a later phase. Unknown paths, and
          unknown artwork, collection or artist ids, all resolve to the same not-found experience.
        </p>
      </PreviewBlock>

      <PreviewBlock
        id="ds-checks"
        title="Verification"
        description="Phase 1 was validated with these commands. Re-run them at any time — each one is part of the repository."
      >
        <div className={styles.checks}>
          {CHECKS.map((check) => (
            <div key={check.command} className={styles.check}>
              <span className={styles.checkCommand}>{check.command}</span>
              <span className={styles.checkResult}>{check.result}</span>
            </div>
          ))}
        </div>

        <p className={styles.note}>
          Layouts were designed against 360, 390, 430, 768, 1024 and 1440 pixel widths. Automated
          visual regression testing is not part of Phase 1, and no claim is made here about browser
          rendering that has not been checked directly.
        </p>
      </PreviewBlock>
    </>
  )
}
