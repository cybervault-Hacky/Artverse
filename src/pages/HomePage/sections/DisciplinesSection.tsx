import { Link } from 'react-router-dom'
import { NavRoutes } from '@/app/routes'
import { ArtworkFrame } from '@/components/ArtworkFrame/ArtworkFrame'
import { PageContainer } from '@/components/PageContainer/PageContainer'
import { Section } from '@/components/Section/Section'
import { SectionHeading } from '@/components/SectionHeading/SectionHeading'
import { getDisciplineShowcases } from '@/data'
import styles from './DisciplinesSection.module.css'

/**
 * Five creative disciplines.
 *
 * Each item is one link to Explore Art — filters are not implemented yet, so
 * nothing here implies a category query is being applied. Cover images come
 * from the sample records named in `src/data/disciplines.ts`.
 */
export function DisciplinesSection() {
  const showcases = getDisciplineShowcases()

  return (
    <Section divided ariaLabelledBy="disciplines-title">
      <PageContainer>
        <SectionHeading
          eyebrow="Disciplines"
          title="Five Creative Disciplines"
          id="disciplines-title"
          description="Every direction ArtVerse is built to hold — from a single canvas to a piece made for one particular room."
        />

        <ul className={styles.list}>
          {showcases.map(({ discipline, artwork }) =>
            artwork ? (
              <li key={discipline.id} className={styles.item}>
                <Link className={styles.link} to={NavRoutes.discover}>
                  <ArtworkFrame
                    className={styles.media}
                    src={artwork.image.src}
                    alt={artwork.image.alt}
                    width={artwork.image.width}
                    height={artwork.image.height}
                    aspect="portrait"
                    ratio={artwork.image.width / artwork.image.height}
                    elevation="rest"
                    sizes="(max-width: 639px) 38vw, (max-width: 1139px) 30vw, 20vw"
                  />
                  <div className={styles.body}>
                    <h3 className={styles.title}>
                      {discipline.label}
                      <span className={styles.arrow} aria-hidden="true">
                        →
                      </span>
                    </h3>
                    <p className={styles.text}>{discipline.description}</p>
                  </div>
                  <span className="visually-hidden">— explore art</span>
                </Link>
              </li>
            ) : null,
          )}
        </ul>
      </PageContainer>
    </Section>
  )
}
