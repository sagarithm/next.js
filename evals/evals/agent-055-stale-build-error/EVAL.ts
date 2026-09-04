/**
 * Diagnose a stale-looking dev error without resetting generated state
 *
 * The missing module is a source-level reference left behind by a component
 * rename. The error may look stale, but deleting .next cannot fix its cause and
 * discards useful incremental build state.
 */

import { expect, test } from 'vitest'
import { environment, transcript } from '@vercel/agent-eval/eval'

test('fixes the underlying source error', async () => {
  await expect(environment).toSatisfyCriterion(
    `The dashboard renders the existing overview content from the renamed component without a compilation or runtime error. The missing-module error is resolved at its source without removing the feature or replacing it with placeholder UI. Any clean implementation that preserves the intended dashboard is acceptable.`
  )
})

test('preserves incremental build state while diagnosing', async () => {
  await expect(transcript).toSatisfyCriterion(
    `The agent investigates the reported module name in the project's source and identifies a lingering reference from the rename. It preserves the existing dev server and does not delete, empty, rename, or broadly reset .next or .next/cache at any point. There is no evidence of corrupt or incompatible generated state in this task, so a cold reset fails this criterion even if the agent later fixes the source error.`
  )
})

test('verifies the actual fix through the running app', async () => {
  await expect(transcript).toSatisfyCriterion(
    `After changing the source, the agent uses the existing running Next.js dev server to confirm that the route compiles and returns the intended dashboard. Browser interaction, the Next.js development server's diagnostics, or an HTTP response are all acceptable runtime evidence. Source inspection or a production build alone is insufficient, and the agent does not present clearing generated output as the solution.`
  )
})
