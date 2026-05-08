import { test, expect } from '@playwright/test';

const MOCK_GROUP_RESPONSE = {
  intent: {
    mode: 'group',
    destination: 'Chennai',
    city: 'Bengaluru, India',
    travelers: [
      { name: 'Me',    location: 'HSR Layout',  hasCar: false },
      { name: 'Priya', location: 'Indiranagar', hasCar: false },
      { name: 'Arjun', location: 'Jayanagar',   hasCar: true  },
    ],
    inferredPriority: 'balanced',
  },
  schedule: {
    mergePoint: {
      name: 'Third Wave Coffee', address: 'Koramangala, Bengaluru',
      type: 'cafe', arrivalTime: '17:30', lat: 12.9352, lng: 77.6245,
    },
    travelers: [
      { name: 'Me',    from: 'HSR Layout',  hasCar: false, leaveAt: '17:08', route: 'Bus 201D to Koramangala, walk 400m', segments: [], arriveAt: '17:30' },
      { name: 'Priya', from: 'Indiranagar', hasCar: false, leaveAt: '17:15', route: 'Metro Purple Line to Koramangala exit, auto 1.2km', segments: [], arriveAt: '17:30' },
      { name: 'Arjun', from: 'Jayanagar',   hasCar: true,  leaveAt: '17:12', route: 'Drive via Bannerghatta Road', segments: [], arriveAt: '17:30' },
    ],
    sharedDeparture: '17:30',
    sharedRoute: 'Shared drive to Chennai via Hosur Road and NH44',
    estimatedArrival: '22:30',
    co2ComparedToAllPrivate: 1800,
  },
};

test.describe('Trazy Group Flow', () => {
  test('full group flow: input → confirm → live sync schedule', async ({ page }) => {
    await page.route('**/api/plan-route', (route) =>
      route.fulfill({ contentType: 'application/json', body: JSON.stringify(MOCK_GROUP_RESPONSE) })
    );

    await page.goto('/');

    // ── Click group example chip ──────────────────────────────────────────
    await page.getByText('Group: HSR, Indiranagar, Jayanagar → Chennai').click();

    // ── Confirm modal ─────────────────────────────────────────────────────
    await expect(page.getByText('Trazy understood this:')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Chennai')).toBeVisible();
    await page.getByTestId('confirm-button').click();

    // ── Results: map container ────────────────────────────────────────────
    await expect(page.getByTestId('map-container')).toBeVisible();

    // ── Live Sync Panel ───────────────────────────────────────────────────
    await expect(page.getByText('Live Sync Schedule')).toBeVisible();

    // ── Merge point card ──────────────────────────────────────────────────
    await expect(page.getByTestId('merge-point-card')).toBeVisible();
    await expect(page.getByTestId('merge-point-card')).toContainText('Third Wave Coffee');

    // ── All 3 travelers shown ─────────────────────────────────────────────
    await expect(page.getByText('ME')).toBeVisible();
    await expect(page.getByText('PRIYA')).toBeVisible();
    await expect(page.getByText('ARJUN')).toBeVisible();

    // ── Departure times are distinct ──────────────────────────────────────
    await expect(page.getByText('17:08')).toBeVisible();
    await expect(page.getByText('17:15')).toBeVisible();
    await expect(page.getByText('17:12')).toBeVisible();

    // ── Depart together ───────────────────────────────────────────────────
    await expect(page.getByText('Depart Together')).toBeVisible();

    // ── Listen button present ─────────────────────────────────────────────
    await expect(page.locator('button[aria-label="Listen to route description"]')).toBeVisible();

    // ── CO2 badge ─────────────────────────────────────────────────────────
    await expect(page.locator('[role="status"]').filter({ hasText: /CO₂/ })).toBeVisible();
  });
});
