import { test, expect, Page } from '@playwright/test';

/**
 * ai-chat.spec.ts
 *
 * All network calls to /api/v1/ai/* are mocked with page.route so that no
 * real model or ai-service is ever called. The tests sign in using the
 * existing test account and navigate to a repo detail page.
 */

const BASE = 'http://localhost:5673';
const REPO_URL = `${BASE}/repos/1`;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function signIn(page: Page) {
  await page.goto(`${BASE}/login`);
  await page.locator('#login-email').fill('tester@flowmetrics.dev');
  await page.locator('#login-password').fill('DesignTester123!');
  await page.locator('button[type="submit"]').click();
  await page.waitForURL('**/dashboard', { timeout: 15_000 });
}

async function goToRepo(page: Page) {
  await page.goto(REPO_URL, { waitUntil: 'networkidle', timeout: 20_000 });
  // Wait for the AI panel heading to appear
  await page.waitForSelector('#ai-panel-heading', { timeout: 10_000 });
}

/** Mock HITL pending to return empty so the banner stays hidden */
async function mockEmptyPending(page: Page) {
  await page.route('**/api/v1/ai/hitl/pending**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ pending: [] }) })
  );
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

test.describe('AI Chat Panel', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
  });

  // --------------------------------------------------------------------------
  // 1. Happy path: running -> running -> complete
  // --------------------------------------------------------------------------
  test('complete flow: answer and Data used list appear', async ({ page }) => {
    let runCallCount = 0;
    await mockEmptyPending(page);

    await page.route('**/api/v1/ai/chat', (route) =>
      route.fulfill({
        status: 202,
        contentType: 'application/json',
        body: JSON.stringify({ runId: 'run-abc', status: 'running' }),
      })
    );

    await page.route('**/api/v1/ai/runs/run-abc', (route) => {
      runCallCount++;
      if (runCallCount <= 2) {
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'running' }) });
      } else {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 'complete',
            answer: 'Your **cycle time** is improving.',
            toolsCalled: ['get_cycle_time_trend', 'get_dora_metrics'],
          }),
        });
      }
    });

    await goToRepo(page);

    // Type and ask
    await page.locator('#ai-question-input').fill('How is our cycle time trending?');
    await page.locator('#ai-ask-button').click();

    // Skeleton should appear
    await expect(page.locator('text=Analyzing repository data')).toBeVisible({ timeout: 5_000 });

    // Wait for answer (poll completes on 3rd call)
    await expect(page.locator('text=Your')).toBeVisible({ timeout: 15_000 });

    // Data used toggle
    await page.locator('button:has-text("Data used")').click();
    await expect(page.locator('#ai-panel-transcript li', { hasText: 'Cycle time trend' })).toBeVisible();
    await expect(page.locator('#ai-panel-transcript li', { hasText: 'DORA metrics' })).toBeVisible();
  });

  // --------------------------------------------------------------------------
  // 2. Status failed: message shown, question preserved, Try again button
  // --------------------------------------------------------------------------
  test('failed status shows message and keeps typed question', async ({ page }) => {
    await mockEmptyPending(page);

    await page.route('**/api/v1/ai/chat', (route) =>
      route.fulfill({
        status: 202,
        contentType: 'application/json',
        body: JSON.stringify({ runId: 'run-fail', status: 'running' }),
      })
    );

    await page.route('**/api/v1/ai/runs/run-fail', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'failed', message: 'The model returned an error.' }),
      })
    );

    await goToRepo(page);
    await page.locator('#ai-question-input').fill('What is our DORA score?');
    await page.locator('#ai-ask-button').click();

    await expect(page.locator('text=The model returned an error.')).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('button:has-text("Try again")')).toBeVisible();
  });

  // --------------------------------------------------------------------------
  // 3. pending_approval: approval block shown; Approve calls endpoint and shows result
  // --------------------------------------------------------------------------
  test('pending_approval shows approval block and Approve calls endpoint', async ({ page }) => {
    await mockEmptyPending(page);

    await page.route('**/api/v1/ai/chat', (route) =>
      route.fulfill({
        status: 202,
        contentType: 'application/json',
        body: JSON.stringify({ runId: 'run-hitl', status: 'running' }),
      })
    );

    await page.route('**/api/v1/ai/runs/run-hitl', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'pending_approval',
          runId: 'run-hitl',
          proposedAction: { type: 'post_pr_comment', reasoning: 'The PR has been open for 14 days.' },
        }),
      })
    );

    let approveBody: unknown;
    await page.route('**/api/v1/ai/hitl/approve', async (route) => {
      approveBody = JSON.parse((await route.request().postData()) ?? '{}');
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'approved', finalAnswer: 'Comment posted.' }),
      });
    });

    await goToRepo(page);
    await page.locator('#ai-question-input').fill('Post a comment on the stale PR');
    await page.locator('#ai-ask-button').click();

    // Approval block
    await expect(page.locator('text=Proposed action')).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('text=post_pr_comment')).toBeVisible();
    await expect(page.locator('text=The PR has been open for 14 days.')).toBeVisible();

    // Approve
    await page.locator('button:has-text("Approve")').first().click();
    await expect(page.locator('text=Comment posted.')).toBeVisible({ timeout: 5_000 });
    expect((approveBody as { approved: boolean }).approved).toBe(true);
  });

  // --------------------------------------------------------------------------
  // 4. Approve -> Reject flow
  // --------------------------------------------------------------------------
  test('pending_approval Reject calls endpoint with approved=false', async ({ page }) => {
    await mockEmptyPending(page);

    await page.route('**/api/v1/ai/chat', (route) =>
      route.fulfill({ status: 202, contentType: 'application/json', body: JSON.stringify({ runId: 'run-hitl2', status: 'running' }) })
    );
    await page.route('**/api/v1/ai/runs/run-hitl2', (route) =>
      route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify({ status: 'pending_approval', runId: 'run-hitl2', proposedAction: { type: 'assign_reviewer', reasoning: 'No reviewers assigned.' } }),
      })
    );

    let rejectBody: unknown;
    await page.route('**/api/v1/ai/hitl/approve', async (route) => {
      rejectBody = JSON.parse((await route.request().postData()) ?? '{}');
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'rejected', finalAnswer: 'Rejected by user.' }) });
    });

    await goToRepo(page);
    await page.locator('#ai-question-input').fill('Assign reviewers to the open PR');
    await page.locator('#ai-ask-button').click();

    await expect(page.locator('text=Proposed action')).toBeVisible({ timeout: 10_000 });
    // Click Reject (first click shows reason field, second submits)
    await page.locator('button:has-text("Reject")').first().click();
    await page.locator('button:has-text("Confirm reject")').first().click();

    await expect(page.locator('text=Rejected by user.')).toBeVisible({ timeout: 5_000 });
    expect((rejectBody as { approved: boolean }).approved).toBe(false);
  });

  // --------------------------------------------------------------------------
  // 5. 403 on approve: owner-or-admin message, request stays in list
  // --------------------------------------------------------------------------
  test('403 on approve shows owner-or-admin message', async ({ page }) => {
    await mockEmptyPending(page);

    await page.route('**/api/v1/ai/chat', (route) =>
      route.fulfill({ status: 202, contentType: 'application/json', body: JSON.stringify({ runId: 'run-403', status: 'running' }) })
    );
    await page.route('**/api/v1/ai/runs/run-403', (route) =>
      route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify({ status: 'pending_approval', runId: 'run-403', proposedAction: { type: 'create_issue', reasoning: 'Anomaly detected.' } }),
      })
    );
    await page.route('**/api/v1/ai/hitl/approve', (route) =>
      route.fulfill({ status: 403, contentType: 'application/json', body: JSON.stringify({ detail: 'Forbidden' }) })
    );

    await goToRepo(page);
    await page.locator('#ai-question-input').fill('Create an issue for the anomaly');
    await page.locator('#ai-ask-button').click();

    await expect(page.locator('text=Proposed action')).toBeVisible({ timeout: 10_000 });
    await page.locator('button:has-text("Approve")').first().click();

    await expect(page.locator('text=Only an owner or admin')).toBeVisible({ timeout: 5_000 });
    // The block remains visible
    await expect(page.locator('text=Proposed action')).toBeVisible();
  });

  // --------------------------------------------------------------------------
  // 6. 429 on start: shows detail text
  // --------------------------------------------------------------------------
  test('429 on start shows rate-limit message', async ({ page }) => {
    await mockEmptyPending(page);

    await page.route('**/api/v1/ai/chat', (route) =>
      route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'A question is already running. Please wait.' }),
      })
    );

    await goToRepo(page);
    await page.locator('#ai-question-input').fill('Test question');
    await page.locator('#ai-ask-button').click();

    await expect(page.locator('text=A question is already running. Please wait.')).toBeVisible({ timeout: 5_000 });
  });

  // --------------------------------------------------------------------------
  // 7. 409 on approve: someone-already-decided message
  // --------------------------------------------------------------------------
  test('409 on approve shows already-decided message', async ({ page }) => {
    await mockEmptyPending(page);

    await page.route('**/api/v1/ai/chat', (route) =>
      route.fulfill({ status: 202, contentType: 'application/json', body: JSON.stringify({ runId: 'run-409', status: 'running' }) })
    );
    await page.route('**/api/v1/ai/runs/run-409', (route) =>
      route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify({ status: 'pending_approval', runId: 'run-409', proposedAction: { type: 'post_pr_comment', reasoning: 'PR stale.' } }),
      })
    );
    await page.route('**/api/v1/ai/hitl/approve', (route) =>
      route.fulfill({ status: 409, contentType: 'application/json', body: JSON.stringify({ detail: 'Already decided' }) })
    );

    await goToRepo(page);
    await page.locator('#ai-question-input').fill('Post a comment');
    await page.locator('#ai-ask-button').click();

    await expect(page.locator('text=Proposed action')).toBeVisible({ timeout: 10_000 });
    await page.locator('button:has-text("Approve")').first().click();

    await expect(page.locator('text=Someone already decided this request.')).toBeVisible({ timeout: 5_000 });
  });

  // --------------------------------------------------------------------------
  // 8. 503 with fallback:true on start: unavailable message; rest of page works
  // --------------------------------------------------------------------------
  test('503 fallback on start shows unavailable and rest of page stays', async ({ page }) => {
    await mockEmptyPending(page);

    await page.route('**/api/v1/ai/chat', (route) =>
      route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ fallback: true }),
      })
    );

    await goToRepo(page);
    await page.locator('#ai-question-input').fill('Any question');
    await page.locator('#ai-ask-button').click();

    await expect(page.locator('text=The AI analyst is unavailable right now')).toBeVisible({ timeout: 5_000 });

    // The rest of the dashboard metrics are still visible (DORA section label)
    await expect(page.locator('text=Dora metrics')).toBeVisible();
  });

  // --------------------------------------------------------------------------
  // 9. 401 triggers session-expired flow
  // --------------------------------------------------------------------------
  test('401 response triggers session-expired redirect', async ({ page }) => {
    await mockEmptyPending(page);

    await page.route('**/api/v1/ai/chat', (route) =>
      route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'Unauthorized' }) })
    );

    // Also stub /auth/refresh to fail so the 401 interceptor triggers the redirect
    await page.route('**/auth/refresh', (route) =>
      route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'Refresh failed' }) })
    );

    await goToRepo(page);
    await page.locator('#ai-question-input').fill('Trigger 401');
    await page.locator('#ai-ask-button').click();

    // The axios interceptor redirects to /login?error=session_expired
    await page.waitForURL(/.*login.*session_expired.*/, { timeout: 10_000 });
    expect(page.url()).toContain('session_expired');
  });

  // --------------------------------------------------------------------------
  // 10. Polling stops after component unmounts
  // --------------------------------------------------------------------------
  test('polling stops after navigating away (component unmounts)', async ({ page }) => {
    let pollCount = 0;
    await mockEmptyPending(page);

    await page.route('**/api/v1/ai/chat', (route) =>
      route.fulfill({ status: 202, contentType: 'application/json', body: JSON.stringify({ runId: 'run-unmount', status: 'running' }) })
    );
    await page.route('**/api/v1/ai/runs/run-unmount', (route) => {
      pollCount++
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'running' }) });
    });

    await goToRepo(page);
    await page.locator('#ai-question-input').fill('Long running question');
    await page.locator('#ai-ask-button').click();

    // Wait for at least one poll
    await expect(page.locator('text=Analyzing repository data')).toBeVisible({ timeout: 5_000 });

    const countBeforeNav = pollCount;

    // Navigate away -- component unmounts
    await page.goto(`${BASE}/dashboard`);

    // Wait 6 s (3 poll ticks if not stopped), then verify poll count did not grow much
    await page.waitForTimeout(6_000);
    expect(pollCount - countBeforeNav).toBeLessThanOrEqual(1); // at most one in-flight
  });
});
