/**
 * The verification and trust model.
 *
 * Verification is the place where a marketplace is most tempted to lie, because
 * a badge costs nothing to draw. This module therefore separates three things
 * that are usually blurred into one, and the page that reads it keeps them
 * apart:
 *
 * 1. **The workflow, as a definition.** `VERIFICATION_STAGES` says what each
 *    state will *mean* — what it will be granted for and what moves a seller on
 *    from it. None of them is a claim about anybody.
 * 2. **What is currently true.** `sellerVerification()` derives a seller's state
 *    from the sample data, and the answer is the same for all five studios: no
 *    application, no reviewer, no record — verification has not started, because
 *    nothing has been submitted and there is nowhere to submit it. `isVerified()`
 *    is the only way to ask whether a seller is verified, and it answers false.
 * 3. **What is not connected.** `NOT_CONNECTED` lists the pieces a real status
 *    would need: document checks, an identity provider, a reviewer, timestamps,
 *    a public verification endpoint and an issued certificate.
 *
 * There is no score, no rating, no tier and no badge anywhere in it. Nothing in
 * this build can mark a seller verified, and nothing here invents a date, a
 * reviewer or an approval.
 */
import type { Creator } from '@/types'
import { SAMPLE_CREATORS } from '@/data'
import { countLabel } from '@/utils/text'

export type VerificationStageId =
  | 'not-started'
  | 'information-needed'
  | 'under-review'
  | 'verified'
  | 'action-required'

export interface VerificationStage {
  id: VerificationStageId
  /** The word a seller would see on their own record. */
  label: string
  /** Tone for the status marker. Decoration on top of the words, never instead of them. */
  tone: 'accent' | 'neutral' | 'quiet'
  /** What the state would mean. */
  meaning: string
  /** What would move a seller on from it. */
  next: string
}

/**
 * The five states, described as definitions rather than as anybody's status.
 *
 * `verified` is in the list because the workflow needs the word defined — and
 * because leaving it out would make the page look like it was hiding the
 * destination. The page states in as many words that no seller in this build is
 * in that state.
 */
export const VERIFICATION_STAGES: VerificationStage[] = [
  {
    id: 'not-started',
    label: 'Not started',
    tone: 'quiet',
    meaning: 'No application has been submitted for this studio, so there is nothing to review.',
    next: 'An application, once there is a system to receive one.',
  },
  {
    id: 'information-needed',
    label: 'Information needed',
    tone: 'neutral',
    meaning:
      'An application exists but is incomplete, or a question has been asked about something in it.',
    next: 'The missing information, supplied by the seller and readable by a reviewer.',
  },
  {
    id: 'under-review',
    label: 'Under review',
    tone: 'neutral',
    meaning:
      'The application is complete and a named reviewer is looking at it — which means a review queue and a reviewer, neither of which exists here.',
    next: 'A decision from that reviewer, recorded against the application.',
  },
  {
    id: 'verified',
    label: 'Verified',
    tone: 'accent',
    meaning:
      'A completed check with a recorded outcome and a date. It is a statement about the checks that were run, never about the quality of the work.',
    next: 'Kept current: a verification that is never rechecked is a claim about the past.',
  },
  {
    id: 'action-required',
    label: 'Action required',
    tone: 'accent',
    meaning:
      'Something needs the seller’s attention — an expired document, a question waiting on them, a detail that no longer matches.',
    next: 'The seller’s answer, after which the state returns to review.',
  },
]

export function verificationStage(id: VerificationStageId): VerificationStage {
  return VERIFICATION_STAGES.find((stage) => stage.id === id) ?? VERIFICATION_STAGES[0]
}

/** The state every studio in this build is in, and why. */
export interface SellerVerification {
  creatorId: string
  /** The stage as it stands today — derived, never assigned. */
  stage: VerificationStage
  /** Where that answer came from, in plain language. */
  basis: string
  /** Whether a real verification exists for this seller. Always false here. */
  verified: boolean
}

/**
 * What is true of a studio's verification today.
 *
 * Derived rather than stored: the sample data holds no application, no review
 * and no outcome, so the only accurate answer is that verification has not
 * started. If a record ever carries a real verification, this is the one function
 * that would read it — and the place a fabricated status would have to be added
 * on purpose, in the open.
 */
export function sellerVerification(creatorId: string): SellerVerification {
  const creator = SAMPLE_CREATORS.find((entry) => entry.id === creatorId)

  return {
    creatorId,
    stage: verificationStage('not-started'),
    basis: creator
      ? `${creator.name} has no application, no review and no outcome recorded anywhere in this build, because there is no application system and no reviewer.`
      : 'This studio id is not in the sample data, so there is nothing to describe and no verification of any kind.',
    verified: false,
  }
}

/**
 * The studios this build holds a verification record for.
 *
 * Empty, and deliberately a list rather than a hard-coded `false`: a verification
 * is a fact about a record, so if one ever existed it would have to be written
 * here — in the open, next to this comment — rather than inferred from a score or
 * a flag. Nothing infers one today.
 */
const VERIFIED_CREATOR_IDS: ReadonlySet<string> = new Set<string>()

/**
 * Whether a seller is verified.
 *
 * The only exported way to ask the question. It reads the record above, which is
 * empty, so it answers false for every seller in this build — and it would take
 * an edit to this file, not a change in a page, for that to become anything else.
 */
export function isVerified(creator: Creator): boolean {
  return VERIFIED_CREATOR_IDS.has(creator.id)
}

export const VERIFICATION_HEADLINE = 'Verification has not started'

export const VERIFICATION_STATUS_NOTE =
  'No studio in ArtVerse is verified, and none can be: there is no application system, no reviewer, no document check and no record of an outcome. The words below describe what each state will mean; they are definitions, not statuses.'

export const VERIFICATION_NO_BADGE =
  'No badge, score, tier, star or rating appears anywhere on ArtVerse. A verification will say what was checked and when — it will never be a measure of how good the work is, or of how many works sold.'

/** The three kinds of statement this page keeps apart, stated as they are. */
export interface TrustDistinction {
  id: 'illustrative' | 'actual' | 'absent'
  title: string
  /** What belongs in this group. */
  text: string
  /** The items that group covers. */
  items: string[]
}

export const TRUST_DISTINCTIONS: TrustDistinction[] = [
  {
    id: 'illustrative',
    title: 'Illustrative — the workflow',
    text: 'Wording and states that exist so the flow can be reviewed. None of them is a claim about a studio.',
    items: [
      'The five verification states and what each one will mean.',
      'The steps a seller would move through, and what each step waits on.',
      'The certificate design at its own route, which says “Preview — Not Issued” on its face.',
    ],
  },
  {
    id: 'actual',
    title: 'Actual — what the data says',
    text: 'Every statement here is derived from the sample records in this build, and each one can be checked against them.',
    items: [
      'Every studio’s state: no application submitted, so verification has not started.',
      'The fields each sample record carries, counted on the workspace overview.',
      'Which studio a work is attributed to, and which collection holds it.',
    ],
  },
  {
    id: 'absent',
    title: 'Not connected — what a real status needs',
    text: 'Anything on this list would have to come from a system that does not exist. Nothing on this page stands in for it.',
    items: [
      'Document and identity checks, with a provider and a retention rule behind them.',
      'A review queue, a named reviewer and a stated turnaround.',
      'Recorded outcomes with real timestamps — no date appears on this page.',
      'A public verification endpoint, and a certificate that can actually be issued.',
      'A way to recheck a verification, and to withdraw one that no longer holds.',
    ],
  },
]

/** The single sentence that keeps certificate design and issued certificates apart. */
export const CERTIFICATE_DESIGN_VS_ISSUED =
  'The certificate at its own route is a design preview: it shows the wording and the layout a verified seller would eventually receive, with its status fixed at “Preview — Not Issued”, its identifier and issue date left as bracketed placeholders, and an empty frame where a verification code would go. An issued certificate would be the same document carrying a real identifier, a real date and a code that resolves to a real record — none of which exists, and none of which this build pretends to have.'

export const VERIFICATION_NOT_CONNECTED_HEADING =
  'What has to exist before a status can be trusted'

/**
 * The count of verified studios, in the workspace's own voice.
 *
 * A count of real fields, like every other figure in this build: it walks the
 * sample creators through `isVerified`, so it cannot report a verification that
 * does not exist.
 */
export function verificationSummaryLine(): string {
  const verified = SAMPLE_CREATORS.filter((creator) => isVerified(creator)).length
  const studios = countLabel(SAMPLE_CREATORS.length, 'illustrative studio')

  return verified === 0
    ? `None of the ${studios} in this build has a verification record: there is no application system and no reviewer, so there is nothing to report.`
    : `${countLabel(verified, 'studio')} of the ${studios} carry a verification record.`
}
