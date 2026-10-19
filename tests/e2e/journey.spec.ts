import { test, expect, type Page } from '@playwright/test';
async function settleImages(page: Page) {
  for (const image of await page.locator('main img').all()) {
    await image.scrollIntoViewIfNeeded();
    await expect
      .poll(() => image.evaluate((node) => (node as HTMLImageElement).naturalWidth))
      .toBeGreaterThan(0);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
}

test.beforeEach(async ({ page }, testInfo) => {
  await page.setExtraHTTPHeaders({ 'x-intercity-test-client': `browser-${testInfo.testId}` });
});
test('all pages and aliases render with one heading and no horizontal overflow', async ({
  page,
}) => {
  for (const path of [
    '/',
    '/about-us',
    '/about',
    '/services',
    '/service-routes',
    '/routes',
    '/service-areas',
    '/tariff',
    '/airport-transfers',
    '/contact-us',
    '/contact',
    '/privacy',
    '/booking',
    '/estimate',
  ]) {
    const response = await page.goto(path);
    expect(response?.status(), path).toBe(200);
    await expect(page.locator('main h1')).toHaveCount(1);
    await expect(
      page.getByRole('link', { name: 'Intercity Riders home', exact: true }).first(),
    ).toBeVisible();
    expect(
      await page.locator('body').evaluate((el) => el.scrollWidth <= window.innerWidth),
      path,
    ).toBeTruthy();
  }
  expect((await page.goto('/a-route-that-does-not-exist'))?.status()).toBe(404);
});
test('homepage carousel, full booking form, fleet, FAQ and desktop layout', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Your city\. Your pickup/ })).toBeVisible();
  await page.getByRole('button', { name: 'Next slide' }).click();
  await expect(page.locator('.home-carousel-slide[aria-hidden="false"] h2')).toContainText(
    'One city to the next.',
  );
  await expect(page.locator('.classic-fleet-card')).toHaveCount(4);
  await expect(page.getByRole('heading', { name: 'Prime SUV', exact: true })).toBeVisible();
  await page.locator('summary').filter({ hasText: 'Does submitting reserve a car?' }).click();
  await expect(
    page.getByText('Your request is sent to our booking team.', { exact: false }),
  ).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Pickup location', exact: true })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Drop location', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Get my fare estimate' })).toBeVisible();
});
test('airport direction preserves endpoints when swapped', async ({ page }) => {
  await page.goto('/booking?trip=airport');
  await page.getByRole('button', { name: 'From the airport' }).click();
  await page.getByRole('button', { name: 'To the airport' }).click();
  await page.locator('#drop').selectOption({ label: 'Chennai International Airport (MAA)' });
  await expect(page.locator('#drop')).toHaveValue('Chennai International Airport (MAA)');
  await page.locator('#pickup').fill('Chennai Central');
  await expect(page.locator('#pickup')).toHaveValue('Chennai Central');
  await page.getByRole('button', { name: 'From the airport' }).click();
  await expect(page.locator('#pickup')).toHaveValue('Chennai International Airport (MAA)');
  await expect(page.locator('#drop')).toHaveValue('Chennai Central');
  await page.getByRole('button', { name: 'To the airport' }).click();
  await expect(page.locator('#drop')).toHaveValue('Chennai International Airport (MAA)');
});
test('enquiry retries keep an ID, confirmation shows the fare and clears personal draft', async ({
  page,
}) => {
  const ids: string[] = [];
  await page.route('**/api/enquiry', async (route) => {
    const data = route.request().postDataJSON();
    if (data.event === 'enquiry') {
      ids.push(data.requestId);
      if (ids.length === 1) {
        await route.fulfill({
          status: 502,
          json: { error: 'Isolated retry test. Please try again.' },
        });
        return;
      }
    }
    await route.continue();
  });
  await page.goto('/booking?pickup=Coimbatore&drop=Chennai');
  await page.locator('#pickupDate').fill('2099-01-10');
  await page.locator('#pickupTime').fill('10:30');
  await page.locator('#customerName').fill('Browser Test Traveller');
  await page.locator('#mobile').fill('9876543210');
  await page.locator('#email').fill('traveller@example.com');
  await page.getByText('Sedan', { exact: true }).click();
  await page.getByRole('checkbox', { name: 'Travelling with an infant' }).check();
  await page.getByRole('checkbox', { name: 'Extra luggage' }).check();
  await page.getByRole('button', { name: 'Get my fare estimate' }).click();
  await expect(page.locator('main').getByRole('alert')).toContainText('Isolated retry test');
  await page.getByRole('button', { name: 'Get my fare estimate' }).click();
  await expect(page).toHaveURL(/\/estimate$/);
  expect(ids).toHaveLength(2);
  expect(ids[0]).toBe(ids[1]);
  await expect(page.getByText('₹3,400', { exact: true })).toBeVisible();
  await expect(page.locator('main h1')).toHaveCount(1);
  await expect(
    page.getByText('Travelling with an infant · Extra luggage', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Confirm my request' }).click();
  await expect(page.locator('main h1')).toContainText('Safely received.');
  const record = await page.evaluate(() =>
    JSON.parse(sessionStorage.getItem('intercity-riders-new-booking-v1') || 'null'),
  );
  expect(record.form).toBeUndefined();
  expect(record.receipt.reference).toMatch(/^IR-/);
  expect(JSON.stringify(record)).not.toContain('Browser Test Traveller');
  await page.reload();
  await expect(page.locator('main h1')).toContainText('Safely received.');
  await expect(page.getByRole('link', { name: 'Share reference on WhatsApp' })).toHaveAttribute(
    'href',
    /https:\/\/wa.me\//,
  );
});
test('contact validation and mocked delivery', async ({ page }) => {
  await page.goto('/contact-us');
  await page.getByRole('textbox', { name: 'Your name', exact: true }).fill('Browser Contact');
  await page.getByRole('textbox', { name: 'Mobile number', exact: true }).fill('9876543210');
  await page
    .getByRole('textbox', { name: 'Your message', exact: true })
    .fill('Please help me plan an isolated test journey.');
  await page.getByRole('button', { name: 'Send your message' }).click();
  await expect(page.getByRole('heading', { name: 'Message received.' })).toBeVisible();
});
test('mobile navigation, no horizontal overflow and reduced-motion layout', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Your city\. Your pickup/ })).toBeVisible();
  expect(
    await page.locator('body').evaluate((el) => el.scrollWidth <= window.innerWidth),
  ).toBeTruthy();
  await settleImages(page);
  await page.screenshot({ path: 'qa/home-mobile.png', fullPage: true, animations: 'disabled' });
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await expect(page.getByRole('dialog', { name: 'Site navigation' })).toBeVisible();
  await page.getByRole('dialog').getByRole('link', { name: 'SERVICES', exact: true }).click();
  await expect(page).toHaveURL(/\/services$/);
  await expect(page.getByRole('dialog')).not.toBeVisible();
  for (const path of ['/booking', '/tariff', '/contact-us']) {
    await page.goto(path);
    expect(
      await page.locator('body').evaluate((el) => el.scrollWidth <= window.innerWidth),
      path,
    ).toBeTruthy();
  }
  await page.goto('/booking');
  await page.getByRole('button', { name: 'Get my fare estimate' }).click();
  await expect(page.locator('#pickup-error')).toBeVisible();
  await settleImages(page);
  await page.screenshot({ path: 'qa/booking-mobile.png', fullPage: true, animations: 'disabled' });
});
test('desktop screenshots and client runtime', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await settleImages(page);
  await page.screenshot({ path: 'qa/home-cover.png', animations: 'disabled' });
  await page.screenshot({ path: 'qa/home-desktop.png', fullPage: true, animations: 'disabled' });
  await page.goto('/booking');
  await settleImages(page);
  await page.screenshot({ path: 'qa/booking-desktop.png', fullPage: true, animations: 'disabled' });
  expect(errors).toEqual([]);
});
