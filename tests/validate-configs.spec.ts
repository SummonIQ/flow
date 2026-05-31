import { expect, test } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const screenshotsDir = path.join(__dirname, '../screenshots');

test.describe('Configuration Page Validation', () => {
  test.beforeAll(() => {
    // Create screenshots directory
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
  });

  test('validate all configs exist and are accessible', async ({ page }) => {
    // Navigate to configuration page
    await page.goto('http://localhost:30140/configuration');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Screenshot 1: Initial page
    await page.screenshot({
      path: path.join(screenshotsDir, '01-initial-page.png'),
      fullPage: true,
    });
    console.log('✓ Screenshot 1: Initial configuration page');

    // Test Web App
    await page.getByText('Web App').click();
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: path.join(screenshotsDir, '02-web-app-selected.png'),
      fullPage: true,
    });
    console.log('✓ Screenshot 2: Web App selected');

    // Check for TypeScript config type
    await page.getByText('TypeScript', { exact: false }).first().click();
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: path.join(screenshotsDir, '03-typescript-config-type.png'),
      fullPage: true,
    });
    console.log('✓ Screenshot 3: TypeScript config type');

    // Check for TypeScript - Web App config in the left panel
    const tsConfig = page.locator('text=TypeScript - Web App').first();
    await expect(tsConfig).toBeVisible();
    await page.screenshot({
      path: path.join(screenshotsDir, '04-typescript-config-visible.png'),
      fullPage: true,
    });
    console.log('✓ Screenshot 4: TypeScript - Web App config visible');

    await tsConfig.click();
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: path.join(screenshotsDir, '05-typescript-config-opened.png'),
      fullPage: true,
    });
    console.log('✓ Screenshot 5: TypeScript - Web App config opened');

    // Verify config content is visible
    const configContent = page
      .locator('pre, code, textarea, .monaco-editor')
      .first();
    await expect(configContent).toBeVisible();
    await page.screenshot({
      path: path.join(screenshotsDir, '05-typescript-config-content.png'),
      fullPage: true,
    });
    console.log('✓ Screenshot 5: TypeScript config content visible');

    // Go back and test all config types for Web App
    await page.goBack();
    await page.waitForTimeout(500);

    const configTypes = [
      'ESLint',
      'Next.js Config',
      'Tailwind CSS',
      'Prettier',
      'package.json',
      'Windsurf Rules',
      'AGENTS.md',
    ];

    for (const configType of configTypes) {
      await page.getByText(configType, { exact: false }).first().click();
      await page.waitForTimeout(500);
      const configName = page.getByText(`${configType} - Web App`, {
        exact: false,
      });
      await expect(configName).toBeVisible();
      console.log(`✓ Found: ${configType} - Web App`);
    }

    await page.screenshot({
      path: path.join(screenshotsDir, '06-all-web-app-configs-validated.png'),
      fullPage: true,
    });
    console.log('✓ Screenshot 6: All Web App configs validated');

    // Test Desktop
    await page.goBack();
    await page.waitForTimeout(500);
    await page.getByText('Desktop').click();
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: path.join(screenshotsDir, '07-desktop-app-selected.png'),
      fullPage: true,
    });
    console.log('✓ Screenshot 7: Desktop app selected');

    // Test Mobile
    await page.goBack();
    await page.waitForTimeout(500);
    await page.getByText('Mobile').click();
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: path.join(screenshotsDir, '08-mobile-app-selected.png'),
      fullPage: true,
    });
    console.log('✓ Screenshot 8: Mobile app selected');

    // Test API
    await page.goBack();
    await page.waitForTimeout(500);
    await page.getByText('API', { exact: true }).click();
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: path.join(screenshotsDir, '09-api-app-selected.png'),
      fullPage: true,
    });
    console.log('✓ Screenshot 9: API app selected');

    console.log('\n✅ All validation screenshots saved to:', screenshotsDir);
  });
});
