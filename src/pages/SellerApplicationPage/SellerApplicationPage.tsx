import { useReducer } from 'react'
import { NavRoutes } from '@/app/routes'
import { Button } from '@/components/Button/Button'
import { FormField } from '@/components/FormField/FormField'
import { PageContainer } from '@/components/PageContainer/PageContainer'
import { PageHeader } from '@/components/PageHeader/PageHeader'
import { PhaseNote } from '@/components/PhaseNote/PhaseNote'
import { PreviewNotice } from '@/components/PreviewNotice/PreviewNotice'
import { Section } from '@/components/Section/Section'
import { TextLink } from '@/components/TextLink/TextLink'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { ARTIST_WORKFLOW } from '@/utils/sellerStudio'
import {
  APPLICATION_ACKNOWLEDGEMENT,
  APPLICATION_BLOCKERS,
  APPLICATION_FIELDS,
  APPLICATION_NO_DOCUMENTS,
  APPLICATION_NO_SUBMISSION,
  APPLICATION_PREVIEW_LABEL,
  APPLICATION_PREVIEW_NOTICE,
  APPLICATION_REVIEW_NOTE,
  applicationDisciplines,
  applicationPreview,
  applicationReducer,
  initialApplicationState,
} from '@/utils/sellerApplication'
import styles from './SellerApplicationPage.module.css'

/**
 * The seller application, as a preview.
 *
 * The form is real — every field validates, the messages are written for a
 * person, and what was typed is read back for review — and the consequences are
 * not: nothing is submitted, nothing is received, and no reviewer exists. The
 * page says all three in the places where a seller would look for them:
 *
 * - above the form, in the preview notice;
 * - under the fields, where a “submit” button would sit;
 * - in the read-back, which is labelled as the form's own contents rather than a
 *   summary of an application;
 * - and in the closing block, which lists what a real application workflow needs.
 *
 * Two things it refuses to include: a document upload (there is nowhere safe to
 * put an identity document) and a guidelines checkbox that pretends guidelines
 * exist. The one acknowledgement it does ask for is that this form submits
 * nothing — the only thing that can honestly be agreed to here.
 */
export function SellerApplicationPage() {
  const [state, dispatch] = useReducer(applicationReducer, undefined, initialApplicationState)

  useDocumentTitle({
    title: 'Seller application preview',
    description:
      'A frontend preview of the ArtVerse seller application: the fields a studio application will carry, validated in the browser and submitted nowhere.',
  })

  const errorCount = Object.keys(state.errors).length
  const preview = applicationPreview(state.values)

  return (
    <>
      <PageHeader
        eyebrow="For Artists"
        title="Seller application preview"
        intro="What applying to sell on ArtVerse will look like: the details a studio applies with, checked here so the flow can be reviewed. Nothing is submitted, and no application is received."
        crumbs={[
          { label: 'Home', to: NavRoutes.home },
          { label: 'For Artists', to: NavRoutes.sell },
          { label: 'Application preview' },
        ]}
      />

      <PreviewNotice label="Preview">{APPLICATION_PREVIEW_NOTICE}</PreviewNotice>

      <Section spacing="tight" ariaLabelledBy="application-form">
        <PageContainer>
          <div className={styles.layout}>
            <div className={styles.formColumn}>
              <h2 className={styles.heading} id="application-form">
                The application
              </h2>
              <p className={styles.intro}>
                Six fields: five about the studio and one acknowledgement. Every rule below is real —
                the required fields, the length limits, the address and the discipline chosen from the
                five the catalogue is organised around.
              </p>

              <p className={styles.documentsNote}>{APPLICATION_NO_DOCUMENTS}</p>

              <form
                className={styles.form}
                noValidate
                onSubmit={(event) => {
                  event.preventDefault()
                  dispatch({ type: 'check' })
                }}
              >
                {APPLICATION_FIELDS.map((field) => {
                  const value = state.values[field.name]
                  const error = state.errors[field.name]
                  const fieldId = `application-${field.name}`

                  if (field.type === 'checkbox') {
                    return (
                      <FormField
                        key={field.name}
                        id={fieldId}
                        label={field.label}
                        hint={field.hint}
                        error={error}
                        required={field.required}
                        layout="inline"
                      >
                        <input
                          type="checkbox"
                          checked={value === 'yes'}
                          onChange={(event) =>
                            dispatch({
                              type: 'setField',
                              field: field.name,
                              value: event.target.checked ? 'yes' : '',
                            })
                          }
                        />
                      </FormField>
                    )
                  }

                  return (
                    <FormField
                      key={field.name}
                      id={fieldId}
                      label={field.label}
                      hint={field.hint}
                      error={error}
                      required={field.required}
                    >
                      {/*
                        One element, chosen in a single expression. `FormField`
                        injects the id and the ARIA wiring by cloning its child,
                        so a list of conditionally rendered controls would leave
                        the label pointing at nothing.
                      */}
                      {field.type === 'textarea' ? (
                        <textarea
                          value={value}
                          rows={field.rows}
                          placeholder={field.placeholder}
                          onChange={(event) =>
                            dispatch({
                              type: 'setField',
                              field: field.name,
                              value: event.target.value,
                            })
                          }
                        />
                      ) : field.type === 'select' ? (
                        <select
                          value={value}
                          onChange={(event) =>
                            dispatch({
                              type: 'setField',
                              field: field.name,
                              value: event.target.value,
                            })
                          }
                        >
                          <option value="">Choose a discipline</option>
                          {applicationDisciplines().map((discipline) => (
                            <option key={discipline.id} value={discipline.id}>
                              {discipline.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={field.type}
                          value={value}
                          placeholder={field.placeholder}
                          onChange={(event) =>
                            dispatch({
                              type: 'setField',
                              field: field.name,
                              value: event.target.value,
                            })
                          }
                        />
                      )}
                    </FormField>
                  )
                })}

                <div className={styles.actions}>
                  <Button type="submit">Check this application</Button>
                  <Button variant="quiet" onClick={() => dispatch({ type: 'clear' })}>
                    Clear the form
                  </Button>
                </div>

                <p className={styles.submitNote}>
                  {APPLICATION_NO_SUBMISSION} The button above checks the fields in your browser and
                  does nothing else.
                </p>
              </form>

              <div className={styles.outcome} role="status" aria-live="polite">
                {state.outcome === 'valid' ? (
                  <>
                    <p className={styles.outcomeLabel}>The check passed</p>
                    <p className={styles.outcomeText}>
                      Every field a real application would require is filled in and inside its limits.
                      Nothing was sent: the read-back beside this column is the form's own contents,
                      held in this tab and nowhere else.
                    </p>
                  </>
                ) : null}

                {state.outcome === 'invalid' ? (
                  <>
                    <p className={styles.outcomeLabel}>
                      {errorCount === 1
                        ? 'One field needs attention'
                        : `${errorCount} fields need attention`}
                    </p>
                    <p className={styles.outcomeText}>
                      Each message is beside its own field. Nothing was sent, and nothing will be —
                      there is no application system to send it to.
                    </p>
                  </>
                ) : null}
              </div>
            </div>

            <aside className={styles.previewColumn} aria-labelledby="application-readback">
              <h2 className={styles.previewTitle} id="application-readback">
                What you entered
              </h2>
              <p className={styles.previewLabel}>{APPLICATION_PREVIEW_LABEL}</p>

              <dl className={styles.previewRows}>
                {preview.map((row) => (
                  <div key={row.label} className={styles.previewRow}>
                    <dt className={styles.previewRowLabel}>{row.label}</dt>
                    <dd className={styles.previewRowValue}>
                      <span className={row.absent ? styles.previewAbsent : styles.previewValue}>
                        {row.value}
                      </span>
                    </dd>
                  </div>
                ))}
              </dl>

              <p className={styles.previewNote}>{APPLICATION_REVIEW_NOTE}</p>
              <TextLink to={NavRoutes.studioVerification}>
                See what verification would mean
              </TextLink>
            </aside>
          </div>
        </PageContainer>
      </Section>

      <Section divided spacing="tight" ariaLabelledBy="application-after">
        <PageContainer>
          <h2 className={styles.blockTitle} id="application-after">
            What happens after a real application
          </h2>
          <p className={styles.blockIntro}>
            The workflow the seller experience is built around, and where verification sits in it.
          </p>

          <ol className={styles.steps}>
            {ARTIST_WORKFLOW.map((step) => (
              <li className={styles.step} key={step.title}>
                <p className={styles.stepLabel}>{step.step}</p>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepText}>{step.text}</p>
              </li>
            ))}
          </ol>

          <PhaseNote
            phase="Phase 9"
            title="What a real application needs"
            description="Listed in full so the gap between this form and a working one is visible rather than guessed at."
            items={APPLICATION_BLOCKERS}
          />

          <p className={styles.ackNote}>{APPLICATION_ACKNOWLEDGEMENT.hint}</p>
        </PageContainer>
      </Section>
    </>
  )
}
