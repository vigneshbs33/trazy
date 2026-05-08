import { test, expect } from '@playwright/test';

const MOCK_SOLO_RESPONSE = {
  intent: {
    mode: 'solo',
    destination: 'Whitefield',
    city: 'Bengaluru, India',
    travelers: [{ name: 'You', location: 'Koramangala', hasCar: false }],
    inferredPriority: 'balanced',
  },
  routes: [
    {
      type: 'public', name: 'Full Public',
      segments: [{ mode: 'bus', description: 'Bus 500C to Silk Board', from: 'Koramangala', to: 'Silk Board', duration: 90, cost: 25 }],
      switchPoint: null, switchReason: null, firstMileSuggestion: null,
      totalTime: 90, totalCost: 25, comfort: 2, co2Grams: 700, recommended: false,
      insight: 'Cheapest option.',
    },
    {
      type: 'hybrid', name: 'Trazy Hybrid',
      segments: [
        { mode: 'bus',  description: 'Bus 500C to Marathahalli', from: 'Koramangala', to: 'Marathahalli', duration: 32, cost: 25 },
        { mode: 'auto', description: 'Auto to Whitefield',        from: 'Marathahalli', to: 'Whitefield',   duration: 16, cost: 95 },
      ],
      switchPoint: 'Marathahalli Bridge', switchReason: 'Avoid KR Puram traffic.',
      firstMileSuggestion: null,
      totalTime: 48, totalCost: 120, comfort: 4, co2Grams: 420, recommended: true,
      insight: 'Best balance of cost and time.',
    },
    {
      type: 'private', name: 'Full Private',
      segments: [{ mode: 'uber', description: 'Uber via ORR', from: 'Koramangala', to: 'Whitefield', duration: 55, cost: 380 }],
      switchPoint: null, switchReason: null, firstMileSuggestion: null,
      totalTime: 55, totalCost: 380, comfort: 5, co2Grams: 1300, recommended: false,
      insight: 'Most comfortable.',
    },
  ],
  globalInsight: 'Hybrid routes save 40 mins vs public and 60% of private cost.',
};

test.describe('Trazy Solo Flow', () => {
  test('full solo flow: input → confirm → results with 3 cards', async ({ page }) => {
    // Intercept the API call — no real backend needed
    await page.route('**/api/plan-route', (route) =>
      route.fulfill({ contentType: 'application/json', body: JSON.stringify(MOCK_SOLO_RESPONSE) })
    );

    await page.goto('/');

    // ── Landing screen ────────────────────────────────────────────────────
    await expect(page.locator('h1', { hasText: 'TRAZY' })).toBeVisible();
    await expect(page.getByText("Your City's Transport Brain")).toBeVisible();

    // ── Type query and submit ─────────────────────────────────────────────
    const input = page.locator('input[type="text"]');
    await input.fill('Koramangala to Whitefield balanced');
    await input.press('Enter');

    // ── Confirmation modal ────────────────────────────────────────────────
    await expect(page.getByText('Trazy understood this:')).toBeVisible();
    await expect(page.getByText('Confirm & Optimize')).toBeVisible();
    await expect(page.getByText('Whitefield')).toBeVisible();

    await page.getByTestId('confirm-button').click();

    // ── Results: map present ──────────────────────────────────────────────
    await expect(page.getByTestId('map-container')).toBeVisible();

    // ── Results: 3 route cards ────────────────────────────────────────────
    await expect(page.getByTestId('route-card-public')).toBeVisible();
    await expect(page.getByTestId('route-card-hybrid')).toBeVisible();
    await expect(page.getByTestId('route-card-private')).toBeVisible();

    // ── Trazy Pick badge on hybrid ────────────────────────────────────────
    await expect(page.getByTestId('trazy-pick-badge')).toBeVisible();

    // ── Switch point in hybrid card ───────────────────────────────────────
    await expect(page.getByTestId('switch-point')).toBeVisible();
    await expect(page.getByTestId('switch-point')).toContainText('Marathahalli Bridge');

    // ── Accessibility: listen button ──────────────────────────────────────
    await expect(page.locator('button[aria-label="Listen to route description"]')).toBeVisible();

    // ── Green badge ───────────────────────────────────────────────────────
    await expect(page.locator('[role="status"]').filter({ hasText: /CO₂/ })).toBeVisible();

    // ── Global insight ────────────────────────────────────────────────────
    await expect(page.getByText(/Hybrid routes save/)).toBeVisible();
  });

  test('clicking an example chip populates input and triggers flow', async ({ page }) => {
    await page.route('**/api/plan-route', (route) =>
      route.fulfill({ contentType: 'application/json', body: JSON.stringify(MOCK_SOLO_RESPONSE) })
    );

    await page.goto('/');
    await page.getByText('Solo: Koramangala → Whitefield').click();
    await expect(page.getByText('Trazy understood this:')).toBeVisible({ timeout: 10000 });
  });
});
