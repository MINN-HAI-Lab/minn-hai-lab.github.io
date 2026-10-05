import { expect, test } from '@playwright/test';

/**
 * The site is five pages, each the design canvas's own markup for that
 * span of content, sharing one header and footer (src/layouts/Layout.astro).
 * What is checked: the hero's 3D frame and fields on the home page, that
 * each page exists with its own content, the nav routes between them, the
 * learning links, nothing pushing any page sideways at a phone width, and
 * the light/dark theme toggle (D-052) — including the 3D scene and mh-bg
 * fields, which each need to hear about a theme change by a different
 * route (D-053, D-054).
 */
test('home has the hero and Signal Plane', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('iframe[data-mh-scene]')).toHaveCount(1);
  await expect(page.locator('h1')).toHaveText('The gap is the whole discipline.');
  expect(await page.locator('mh-bg').count()).toBe(1);
  for (const id of ['top', 'signal-plane']) {
    await expect(page.locator(`#${id}`)).toHaveCount(1);
  }
});

test('research, learning, members and partner are their own pages', async ({ page }) => {
  await page.goto('/research');
  await expect(page.locator('#research')).toHaveCount(1);
  await expect(page.locator('h2')).toHaveText('Research');
  for (const mode of ['bayes', 'blanket', 'generate']) {
    await expect(page.locator(`mh-bg[mode="${mode}"]`)).toHaveCount(1);
  }

  await page.goto('/learning');
  await expect(page.locator('#learning')).toHaveCount(1);

  await page.goto('/members');
  await expect(page.locator('#members')).toHaveCount(1);

  await page.goto('/partner');
  await expect(page.locator('#funding')).toHaveCount(1);
  await expect(page.locator('#join')).toHaveCount(1);
});

test('the header nav goes to each page', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.mh-name')).toHaveAttribute('href', '/');
  await page.locator('.mh-hero-nav a:has-text("Research")').click();
  await expect(page).toHaveURL(/\/research\/?$/);
  await page.locator('.mh-hero-nav a:has-text("Learning")').click();
  await expect(page).toHaveURL(/\/learning\/?$/);
  await page.locator('.mh-hero-nav a:has-text("Members")').click();
  await expect(page).toHaveURL(/\/members\/?$/);
  await page.locator('.mh-hero-nav a:has-text("Collaborations")').click();
  await expect(page).toHaveURL(/\/partner\/?$/);
  await page.locator('.mh-hero-nav a:has-text("Join the Lab")').click();
  await expect(page).toHaveURL(/\/join\/?$/);
  // the form itself is off-site, so check the link rather than follow it
  const form = page.locator('#join a:has-text("Expression of Interest Form")');
  await expect(form).toHaveAttribute('href', 'https://forms.gle/UQpNsfC2UsKvSPwh6');
  await expect(form).toHaveAttribute('target', '_blank');
});

test('learning links out to StatLab and its source', async ({ page }) => {
  await page.goto('/learning');
  await expect(page.locator('#learning a:has-text("Open StatLab")')).toHaveAttribute('href', 'https://minn-hai-lab.github.io/statLab/');
  await expect(page.locator('#learning a:has-text("Source code")')).toHaveAttribute('href', 'https://github.com/MINN-HAI-Lab/statLab_Codes');
  await expect(page.locator('[data-mh-tab]')).toHaveCount(0);
});

test('nothing overflows at 360px, on any page', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  for (const path of ['/', '/research', '/learning', '/members', '/partner']) {
    await page.goto(path);
    const o = await page.evaluate(() => ({ s: document.documentElement.scrollWidth, c: document.documentElement.clientWidth }));
    expect(o.s, `${path} overflows`).toBeLessThanOrEqual(o.c);
  }
});

test('theme: light by default, dark toggles and persists across pages', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).not.toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('#mh-theme-toggle')).toHaveAttribute('aria-label', 'Switch to dark theme');
  await expect(page.locator('#mh-theme-toggle [data-icon="moon"]')).toBeVisible();
  await expect(page.locator('#mh-theme-toggle [data-icon="sun"]')).toBeHidden();

  await page.locator('#mh-theme-toggle').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('#mh-theme-toggle')).toHaveAttribute('aria-label', 'Switch to light theme');
  await expect(page.locator('#mh-theme-toggle [data-icon="sun"]')).toBeVisible();

  await page.goto('/research');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('#mh-theme-toggle')).toHaveAttribute('aria-label', 'Switch to light theme');

  await page.locator('#mh-theme-toggle').click();
  await expect(page.locator('html')).not.toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(page.locator('html')).not.toHaveAttribute('data-theme', 'dark');
});

test('theme: the 3D scene hears about it too', async ({ page }) => {
  // The scene runs in an iframe with its own document — this exercises the
  // postMessage handshake (D-053), not just the parent page's own CSS.
  await page.goto('/');
  const scene = page.frameLocator('iframe[data-mh-scene]');
  await expect.poll(() => scene.locator('canvas').isVisible()).toBe(true);
  await page.waitForTimeout(500); // scene fetches three.js from a CDN before it can answer the ready handshake
  const frame = page.frames().find(f => f.url().includes('hands-scene'));
  if (!frame) throw new Error('hands-scene.html iframe not found');
  const wireHex = () => frame.evaluate(() => (window as any).__wireHex?.() ?? null);
  const light = await wireHex();
  await page.click('#mh-theme-toggle');
  await page.waitForTimeout(300);
  const dark = await wireHex();
  expect(light).not.toBeNull();
  expect(dark).not.toBeNull();
  expect(light).not.toBe(dark);
});

test('theme: mh-bg fields switch too', async ({ page }) => {
  // mh-bg shares the page's own document (D-054), so this checks its
  // internal .dark flag directly, the same white-box approach as the 3D
  // scene's __wireHex() above, rather than trying to sample canvas pixels.
  await page.goto('/');
  await page.locator('#signal-plane mh-bg').scrollIntoViewIfNeeded();
  const isDark = () => page.evaluate(() => (document.querySelector('#signal-plane mh-bg') as any)?.dark);
  expect(await isDark()).toBe(false);
  await page.click('#mh-theme-toggle');
  await page.waitForTimeout(200);
  expect(await isDark()).toBe(true);
});
