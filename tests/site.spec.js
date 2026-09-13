const { test, expect } = require("@playwright/test");
const AxeBuilder = require("@axe-core/playwright").default;

test("event details, local assets and internal links work", async ({
  page,
  request,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("response", (response) => {
    if (response.status() >= 400)
      errors.push(`${response.status()} ${response.url()}`);
  });
  await page.goto("/");
  await expect(page).toHaveTitle(/The Overgrowth/);
  await expect(page.locator("h1")).toHaveText("TheOvergrowth.");
  await expect(page.locator(".invitation-card time")).toHaveAttribute(
    "datetime",
    "2026-10-31T16:00:00+02:00",
  );
  await expect(page.locator(".invitation-card address")).toContainText(
    "255B Swallow Road",
  );
  const anchors = await page
    .locator('a[href^="#"]')
    .evaluateAll((links) => links.map((link) => link.getAttribute("href")));
  for (const href of anchors) await expect(page.locator(href)).toHaveCount(1);
  for (const img of await page.locator("img").all()) {
    await img.scrollIntoViewIfNeeded();
    await expect
      .poll(() => img.evaluate((el) => el.complete && el.naturalWidth > 0))
      .toBeTruthy();
  }
  const assets = await page
    .locator('[src], link[rel="stylesheet"], link[rel="icon"], a[download]')
    .evaluateAll((els) => [
      ...new Set(
        els
          .map((el) => el.getAttribute("src") || el.getAttribute("href"))
          .filter((url) => url?.startsWith("./")),
      ),
    ]);
  for (const asset of assets) {
    const response = await request.get(asset);
    expect(response.ok(), asset).toBeTruthy();
    expect(response.headers()["content-type"], asset).not.toContain(
      "text/html",
    );
  }
  expect(errors).toEqual([]);
});

test("calendar download has the correct South African start time", async ({
  page,
  request,
}) => {
  await page.goto("/");
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("link", { name: "Add to calendar" }).click(),
  ]);
  expect(download.suggestedFilename()).toBe("plutos-halloween-2026.ics");
  const response = await request.get("/assets/plutos-halloween-2026.ics");
  const calendar = await response.text();
  expect(calendar).toContain("DTSTART:20261031T140000Z\r\n");
  expect(calendar).toContain(
    "LOCATION:255B Swallow Road\\, Benoni\\, South Africa",
  );
  expect(calendar).toContain("END:VCALENDAR\r\n");
});

test("phone navigation supports touch, escape and destination focus", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const toggle = page.getByRole("button", { name: "Menu" });
  await expect(toggle).toBeVisible();
  await expect(page.getByRole("navigation")).toBeHidden();
  await toggle.click();
  await expect(page.getByRole("navigation")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await toggle.click();
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Our little corner" })
    .click();
  await expect(page).toHaveURL(/#about$/);
  await expect(page.getByRole("navigation")).toBeHidden();
  await expect(page.locator("#about")).toBeFocused();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(page.getByRole("navigation")).toBeVisible();
  await expect(toggle).toBeHidden();
});

test("layouts fit narrow phones, tablets and desktop screens", async ({
  page,
}) => {
  await page.goto("/");
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(() => document.fonts.ready);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    );
    expect(overflow, `horizontal overflow at ${width}px`).toBe(false);
    const heading = await page.locator("h1").boundingBox();
    expect(heading.x).toBeGreaterThanOrEqual(0);
    expect(heading.x + heading.width).toBeLessThanOrEqual(width);
  }
});

test("film loads only on request and pauses when closed", async ({ page }) => {
  const videoRequests = [];
  page.on("request", (request) => {
    if (request.url().endsWith("/plutos-halloween-2026.mp4"))
      videoRequests.push(request.url());
  });
  await page.goto("/");
  const video = page.locator(".invitation-film video");
  await expect(video).toHaveAttribute("preload", "none");
  expect(await video.evaluate((el) => el.autoplay)).toBe(false);
  expect(videoRequests).toEqual([]);
  await page
    .getByRole("link", { name: "Watch the invitation", exact: true })
    .click();
  await expect(video).toBeVisible();
  await expect
    .poll(() => video.evaluate((el) => el.readyState))
    .toBeGreaterThanOrEqual(1);
  await video.evaluate((el) => el.play());
  await expect.poll(() => video.evaluate((el) => el.paused)).toBe(false);
  await page.locator("summary").click();
  await expect.poll(() => video.evaluate((el) => el.paused)).toBe(true);
});

test("page and navigation remain usable without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto(process.env.SITE_URL || "http://127.0.0.1:4175");
  await expect(page.getByRole("navigation")).toBeVisible();
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "The regulars" })
    .click();
  await expect(page).toHaveURL(/#residents$/);
  await expect(page.locator("#residents")).toBeVisible();
  await page.locator("summary").click();
  await expect(
    page.getByRole("link", { name: "Watch or download the invitation film" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Watch or download the invitation film" }),
  ).toHaveAttribute("href", "./assets/plutos-halloween-2026.mp4");
  await context.close();
});

test("page passes automated accessibility checks with reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  expect(
    await page.evaluate(
      () => getComputedStyle(document.documentElement).scrollBehavior,
    ),
  ).toBe("auto");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
  await page.locator("summary").click();
  const expanded = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(expanded.violations).toEqual([]);
});

test("background plays silently with autoplay fallback, pause and tab visibility", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const background = page.locator("#background-video");
  await expect
    .poll(() => background.evaluate((video) => video.readyState))
    .toBeGreaterThanOrEqual(2);
  // Safari and device power policies may require a gesture, even for muted video.
  if (await background.evaluate((video) => video.paused)) {
    await page.getByRole("button", { name: "Play effects" }).click();
  }
  await expect
    .poll(() =>
      background.evaluate((video) => !video.paused && video.currentTime > 0),
    )
    .toBe(true);
  expect(
    await background.evaluate(
      (video) => video.muted && video.loop && video.hasAttribute("playsinline"),
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Pause effects" }).click();
  expect(await background.evaluate((video) => video.paused)).toBe(true);
  await page.getByRole("button", { name: "Play effects" }).click();
  await expect
    .poll(() => background.evaluate((video) => video.paused))
    .toBe(false);
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect
    .poll(() => background.evaluate((video) => video.paused))
    .toBe(true);
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: false,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect
    .poll(() => background.evaluate((video) => video.paused))
    .toBe(false);
});

test("reduced motion uses a still until the visitor chooses to play", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const requests = [];
  page.on("request", (request) => {
    if (request.url().endsWith(".mp4")) requests.push(request.url());
  });
  await page.goto("/");
  const background = page.locator("#background-video");
  await expect(background).not.toHaveAttribute("src");
  expect(requests).toEqual([]);
  await page.getByRole("button", { name: "Play effects" }).click();
  await expect
    .poll(() => background.evaluate((video) => video.paused))
    .toBe(false);
  await page.getByRole("button", { name: "Pause effects" }).click();
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect
    .poll(() => background.evaluate((video) => video.paused))
    .toBe(false);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect
    .poll(() => background.evaluate((video) => video.paused))
    .toBe(true);
});

test("data saver and failed playback retain a usable still background", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const connection = new EventTarget();
    connection.saveData = true;
    Object.defineProperty(navigator, "connection", {
      configurable: true,
      value: connection,
    });
  });
  await page.goto("/");
  const background = page.locator("#background-video");
  await expect(background).not.toHaveAttribute("src");
  await expect(
    page.getByRole("button", { name: "Play effects" }),
  ).toBeVisible();
  await page.route("**/greenhouse-loop.mp4", (route) => route.abort());
  await page.getByRole("button", { name: "Play effects" }).click();
  await expect(
    page.getByRole("button", { name: "Play effects" }),
  ).toBeVisible();
  await expect(background).toHaveAttribute(
    "poster",
    "./assets/greenhouse-night.webp",
  );
  await expect(
    page.getByRole("link", { name: "Enter the overgrowth" }),
  ).toBeVisible();
});

test("fog and canvas effects pause together with the background", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const background = page.locator("#background-video");
  await expect
    .poll(() => background.evaluate((video) => video.readyState))
    .toBeGreaterThanOrEqual(2);
  if (await background.evaluate((video) => video.paused))
    await page.getByRole("button", { name: "Play effects" }).click();
  await expect(page.locator("html")).toHaveClass(/motion-running/);
  expect(
    await page
      .locator(".fog-near")
      .evaluate((el) => getComputedStyle(el).animationPlayState),
  ).toBe("running");
  const canvas = page.locator("#spore-field");
  const moving = await canvas.evaluate((el) => el.toDataURL());
  await expect
    .poll(() => canvas.evaluate((el) => el.toDataURL()))
    .not.toBe(moving);
  await page.getByRole("button", { name: "Pause effects" }).click();
  await expect(page.locator("html")).not.toHaveClass(/motion-running/);
  expect(
    await page
      .locator(".fog-near")
      .evaluate((el) => getComputedStyle(el).animationPlayState),
  ).toBe("paused");
  const still = await canvas.evaluate((el) => el.toDataURL());
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
  expect(await canvas.evaluate((el) => el.toDataURL())).toBe(still);
});
