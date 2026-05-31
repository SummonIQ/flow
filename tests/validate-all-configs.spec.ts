import { expect, test } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const screenshotsDir = path.join(__dirname, '../screenshots/validation');

test.describe('Complete Configuration Validation', () => {
  test.beforeAll(() => {
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
  });

  test('validate all 32 configs exist in database and UI', async ({ page }) => {
    await page.goto('http://localhost:30140/configuration');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Screenshot initial page
    await page.screenshot({
      path: path.join(screenshotsDir, '01-initial.png'),
      fullPage: true,
    });
    console.log('✓ Initial page loaded');

    const appTypes = [
      { name: 'Web Application', key: 'web-app' },
      { name: 'Desktop Application', key: 'desktop' },
      { name: 'Mobile Application', key: 'mobile' },
      { name: 'API / Backend', key: 'api' },
    ];

    const configTypes = [
      'ESLint',
      'Next.js Config',
      'TypeScript',
      'Tailwind CSS',
      'Prettier',
      'package.json',
      'Windsurf Rules',
      'AGENTS.md',
    ];

    let configCount = 0;

    for (const appType of appTypes) {
      console.log(`\n📱 Testing ${appType.name}...`);

      // Click app type
      await page.getByText(appType.name).click();
      await page.waitForTimeout(1000);
      await page.screenshot({
        path: path.join(screenshotsDir, `02-${appType.key}-selected.png`),
        fullPage: true,
      });
      console.log(`  ✓ ${appType.name} selected`);

      // Check each config type
      for (const configType of configTypes) {
        await page.getByText(configType, { exact: false }).first().click();
        await page.waitForTimeout(500);

        const configName = `${configType} - ${appType.name.replace(' Application', '').replace('API / Backend', 'API')}`;
        const configElement = page.locator(`text=${configName}`).first();

        try {
          await expect(configElement).toBeVisible({ timeout: 2000 });
          console.log(`  ✓ ${configName}`);
          configCount++;
        } catch (e) {
          console.log(`  ✗ ${configName} NOT FOUND`);
          await page.screenshot({
            path: path.join(
              screenshotsDir,
              `error-${appType.key}-${configType.replace(/\s+/g, '-')}.png`,
            ),
            fullPage: true,
          });
        }

        // Go back to config types
        await page.goBack();
        await page.waitForTimeout(300);
      }

      // Go back to app types
      await page.goBack();
      await page.waitForTimeout(500);
    }

    console.log(`\n📊 TOTAL CONFIGS FOUND: ${configCount}/32`);

    // Final screenshot
    await page.screenshot({
      path: path.join(screenshotsDir, '99-final.png'),
      fullPage: true,
    });

    // Assert all 32 configs were found
    expect(configCount).toBe(32);
  });
});
