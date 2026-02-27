import { chromium } from 'playwright';

(async () => {
    console.log("Launching browser...");
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    // Log all page errors
    page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));
    page.on('console', msg => {
        if (msg.type() === 'error') console.log('CONSOLE ERROR:', msg.text());
        else console.log('CONSOLE:', msg.text());
    });

    console.log("Navigating to app...");
    await page.goto('http://localhost:5173');

    // Switch to Karthik Pai using the switcher UI
    console.log("Switching user...");
    // Find the current user name / role dropdown button in topbar
    await page.click('button:has-text("Manager")').catch(() => page.click('button.relative.flex.items-center.gap-3.p-2'));
    await page.waitForTimeout(500);

    // Find Karthik Pai in the dropdown and click it
    const karthikButton = await page.locator('button:has-text("Karthik Pai")');
    if (await karthikButton.count() > 0) {
        await karthikButton.first().click();
        console.log("Clicked Karthik Pai.");
        await page.waitForTimeout(2000);
    } else {
        console.log("Could not find Karthik Pai in dropdown. Attempting local storage.");
        await page.evaluate(() => { localStorage.setItem('currentUserId', '7'); });
        await page.reload();
        await page.waitForTimeout(2000);
    }

    // Click the "Requests" link on the sidebar
    console.log("Clicking Requests sidebar link...");
    const reqLink = await page.locator('a[href="/allocation-requests"]');
    if (await reqLink.count() > 0) {
        await reqLink.first().click();
        console.log("Clicked Requests. Waiting 5 seconds for page load or error...");
        await page.waitForTimeout(5000);
    } else {
        console.log("Could not find Requests sidebar link.");
    }

    // Take full page screenshot
    await page.screenshot({ path: 'debug_karthik.png', fullPage: true });

    console.log("Done.");
    await browser.close();
})();
