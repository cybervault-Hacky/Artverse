import { NavRoutes } from '@/app/routes'
import { Button } from '@/components/Button/Button'
import { FloatingArtwork } from '@/components/FloatingArtwork/FloatingArtwork'
import { PageContainer } from '@/components/PageContainer/PageContainer'
import { getArtworksByIds } from '@/data'
import { HERO_WORK_IDS } from '@/data/homepage'
import styles from './HeroSection.module.css'

/**
 * Homepage hero.
 *
 * Editorial copy on the left, the signature floating-art composition on the
 * right. Both calls to action are real navigation to existing routes, and the
 * composition is decorative so the copy carries the page.
 */
export function HeroSection() {
  const works = getArtworksByIds(HERO_WORK_IDS)

  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <PageContainer>
        <div className={styles.grid}>
          <div className={styles.copy}>
            <p className={styles.eyebrow}>Independent art · Worldwide</p>
            <h1 className={styles.title} id="hero-title">
              Where Art Finds Its Universe.
            </h1>
            <p className={styles.lead}>
              Discover original works from independent creators worldwide. From fine paintings and
              digital art to sculptural lighting and handmade objects, find art that makes a space
              your own.
            </p>
            <div className={styles.actions}>
              <Button to={NavRoutes.discover} size="lg">
                Explore Art
              </Button>
              <Button to={NavRoutes.artists} variant="secondary" size="lg">
                Browse Artists
              </Button>
            </div>
          </div>

          {/* The composition sets its own maximum width and never stretches
              wider than its stage, so it cannot collide with the copy. */}
          <FloatingArtwork works={works} />
        </div>
      </PageContainer>
    </section>
  )
}
