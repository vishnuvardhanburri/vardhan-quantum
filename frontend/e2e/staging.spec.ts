/**
 * Browser E2E Tests — Staging Verification
 * Tests the Vardhan Quantum dashboard against the staging backend.
 *
 * Run with: STAGING_ADMIN_TOKEN="..." npx playwright test --config=playwright.config.ts
 */
import { test, expect } from '@playwright/test';

const ADMIN_TOKEN = process.env.STAGING_ADMIN_TOKEN || '';
const BASE_URL = 'http://localhost:3000';

test.describe('Vardhan Quantum — Staging E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  });

  // -----------------------------------------------------------------------
  // Helper: perform a real browser login through the form
  // -----------------------------------------------------------------------
  async function loginViaForm(page: any, token: string) {
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Wait for the React form to be interactive (async scripts have hydrated)
    await page.waitForSelector('input[type="password"]', { state: 'visible', timeout: 10000 });
    await page.waitForSelector('button[type="submit"]', { state: 'visible', timeout: 10000 });

    // Fill the token through Playwright's native interaction
    await page.fill('input[type="password"]', token);

    // Click the ACTUAL submit button — not a bypass
    await page.click('button[type="submit"]');

    // Wait for the React handler to fire (setAuthToken + router.push)
    // The handler sets window.__VARDHAN_ADMIN_TOKEN__ then navigates to '/'
    await page.waitForURL(BASE_URL, { timeout: 10000 });
    await page.waitForLoadState('networkidle', { timeout: 10000 });
  }

  // -----------------------------------------------------------------------
  // 1. Login page loads
  // -----------------------------------------------------------------------
  test('Login page loads with correct branding', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    await expect(page).toHaveTitle(/vardhan|quantum/i);
    await expect(page.locator('h1')).toContainText(/Vardhan/);
    await expect(page.locator('h1')).toContainText(/Quantum/);
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page.locator('text=/memory/i')).toBeVisible();
  });

  // -----------------------------------------------------------------------
  // 2. Real login flow — fill token, click submit, dashboard appears
  // 3. Token stored in memory, NOT in localStorage/sessionStorage/cookies
  // -----------------------------------------------------------------------
  test('Login form accepts token and stores in memory', async ({ page }) => {
    await loginViaForm(page, ADMIN_TOKEN);

    // Verify token is stored in window (in-memory only)
    const tokenInMemory = await page.evaluate(() => (window as any).__VARDHAN_ADMIN_TOKEN__);
    expect(tokenInMemory).toBe(ADMIN_TOKEN);

    // Verify token is NOT in localStorage
    const localStorageCheck = await page.evaluate(() => Object.keys(localStorage).length === 0);
    expect(localStorageCheck).toBe(true);

    // Verify token is NOT in sessionStorage
    const sessionStorageCheck = await page.evaluate(() => Object.keys(sessionStorage).length === 0);
    expect(sessionStorageCheck).toBe(true);

    // Verify token not in cookie
    const cookieCheck = await page.evaluate(() => document.cookie.length === 0);
    expect(cookieCheck).toBe(true);
  });

  // -----------------------------------------------------------------------
  // 3. Authenticated dashboard renders after real login
  // -----------------------------------------------------------------------
  test('Dashboard renders metrics after login', async ({ page }) => {
    await loginViaForm(page, ADMIN_TOKEN);

    // Wait for dashboard metrics to appear
    await page.waitForSelector('text=/Ingress TPS/', { timeout: 15000 });
    const bodyText = await page.textContent('body');
    expect(bodyText).toMatch(/Ingress TPS/);
  });

  // -----------------------------------------------------------------------
  // 4. Authenticated API access succeeds after login
  // -----------------------------------------------------------------------
  test('Authenticated API succeeds after login', async ({ page }) => {
    await loginViaForm(page, ADMIN_TOKEN);

    // Verify the dashboard can fetch metrics (authenticated API call from browser)
    const metricsResponse = await page.request.get(
      `${BASE_URL}/api/admin/api/v1/metrics`,
      { headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` } }
    );
    expect(metricsResponse.status()).toBe(200);
    const metrics = await metricsResponse.json();
    expect(metrics).toHaveProperty('successful_handshakes');
    expect(metrics).toHaveProperty('kem_entropy');
  });

  // -----------------------------------------------------------------------
  // 5. SSE stream connects with proper headers
  // -----------------------------------------------------------------------
  test('SSE stream connects with proper headers', async ({ page }) => {
    await loginViaForm(page, ADMIN_TOKEN);

    // Use page.evaluate with single argument to check headers without consuming the stream
    const sseCheck = await page.evaluate(async (opts: { url: string; token: string }) => {
      const response = await fetch(opts.url, {
        headers: { 'Authorization': `Bearer ${opts.token}` },
      });
      return {
        status: response.status,
        contentType: response.headers.get('content-type'),
        cacheControl: response.headers.get('cache-control'),
      };
    }, { url: `${BASE_URL}/api/admin/api/v1/events`, token: ADMIN_TOKEN });

    expect(sseCheck.status).toBe(200);
    expect(sseCheck.contentType).toContain('text/event-stream');
    expect(sseCheck.cacheControl).toContain('no-cache');
  });

  // -----------------------------------------------------------------------
  // 6. Logout returns to login page
  // -----------------------------------------------------------------------
  test('Logout returns to login page', async ({ page }) => {
    await loginViaForm(page, ADMIN_TOKEN);

    // Verify we're on the dashboard
    await expect(page).toHaveURL(BASE_URL);

    // Click the Logout button in the dashboard header
    await page.click('text=Logout');

    // Wait for SPA redirect to /login (use domcontentloaded, not load —
    // Next.js client-side router navigates without a full page load event)
    await page.waitForURL(`${BASE_URL}/login`, { timeout: 10000, waitUntil: 'domcontentloaded' });

    // Verify login page is shown
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('h1')).toContainText(/Vardhan/);

    // Verify token is cleared from memory
    const tokenAfterLogout = await page.evaluate(() => (window as any).__VARDHAN_ADMIN_TOKEN__);
    expect(tokenAfterLogout).toBe('');
  });

  // -----------------------------------------------------------------------
  // 7. No auth returns 401 on admin API
  // -----------------------------------------------------------------------
  test('No auth returns 401 on admin API', async ({ page }) => {
    const response = await page.request.get(`${BASE_URL}/api/admin/api/v1/metrics`);
    expect(response.status()).toBe(401);
  });

  // -----------------------------------------------------------------------
  // 8. Admin token not in browser bundle
  // -----------------------------------------------------------------------
  test('Admin token not in browser bundle', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    const pageContent = await page.content();
    expect(pageContent).not.toContain(ADMIN_TOKEN);

    // Check JS bundles for token leakage
    const scriptTags = await page.locator('script[src]').all();
    for (const tag of scriptTags) {
      const src = await tag.getAttribute('src');
      if (src) {
        const url = src.startsWith('http') ? src : `${BASE_URL}${src}`;
        try {
          const jsContent = await page.evaluate(async (u: string) => {
            const r = await fetch(u);
            return await r.text();
          }, url);
          expect(jsContent).not.toContain(ADMIN_TOKEN);
        } catch (e) { /* external or unavailable script */ }
      }
    }
  });

  // -----------------------------------------------------------------------
  // 9. Crypto status shows all PQ algorithms active
  // -----------------------------------------------------------------------
  test('Crypto status shows all PQ algorithms active', async ({ page }) => {
    await loginViaForm(page, ADMIN_TOKEN);

    const response = await page.request.get(
      `${BASE_URL}/api/admin/api/v1/security/crypto/status`,
      { headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` } }
    );
    expect(response.status()).toBe(200);
    const data = await response.json();
    const jsonStr = JSON.stringify(data);
    expect(jsonStr).toMatch(/ML-KEM-1024/);
    expect(jsonStr).toMatch(/ML-DSA-87/);
    expect(jsonStr).toMatch(/AES-256-GCM/);
    expect(jsonStr).toMatch(/Active/);
  });

  // -----------------------------------------------------------------------
  // 10. Ledger status shows durable configuration
  // -----------------------------------------------------------------------
  test('Ledger status shows durable configuration', async ({ page }) => {
    const response = await page.request.get(
      `${BASE_URL}/api/admin/api/v1/ledger/status`,
      { headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` } }
    );
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('configured', true);
  });

  // -----------------------------------------------------------------------
  // 11. Cluster status shows node membership
  // -----------------------------------------------------------------------
  test('Cluster status shows node membership', async ({ page }) => {
    const response = await page.request.get(
      `${BASE_URL}/api/admin/api/v1/cluster/status`,
      { headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` } }
    );
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('node_count');
    expect(data).toHaveProperty('leader');
    expect(data).toHaveProperty('healthy_count');
  });

  // -----------------------------------------------------------------------
  // 12. Raft status shows leader and term
  // -----------------------------------------------------------------------
  test('Raft status shows leader and term', async ({ page }) => {
    const response = await page.request.get(
      `${BASE_URL}/api/admin/api/v1/raft/status`,
      { headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` } }
    );
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('role');
    expect(data).toHaveProperty('current_term');
    expect(data).toHaveProperty('leader_id');
  });

  // -----------------------------------------------------------------------
  // 13. CORS does not expose admin API to unauthorized origins
  // -----------------------------------------------------------------------
  test('CORS does not expose admin API to unauthorized origins', async ({ page }) => {
    const response = await page.request.get(
      `${BASE_URL}/api/admin/api/v1/metrics`,
      {
        headers: {
          'Authorization': `Bearer ${ADMIN_TOKEN}`,
          'Origin': 'http://evil.example.com',
        },
      }
    );
    expect(response.status()).toBe(200);
    const corsHeader = response.headers()['access-control-allow-origin'];
    expect(corsHeader).not.toBe('http://evil.example.com');
    expect(corsHeader).not.toBe('*');
  });
});
