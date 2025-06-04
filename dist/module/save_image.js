import { chromium } from "playwright-extra";
import stealth from "puppeteer-extra-plugin-stealth";
chromium.use(stealth());
import fs from "fs";
import path from "path";
export async function openWithCookies(url, cookiesFile = path.resolve(process.cwd(), "cookies.json"), screenshotPath = path.resolve(process.cwd(), "foto", "screenshot.png")) {
    if (!fs.existsSync(cookiesFile)) {
        console.error(`❌ File cookies tidak ditemukan: ${cookiesFile}`);
        return;
    }
    const cookies = JSON.parse(fs.readFileSync(cookiesFile, "utf-8"));
    if (!Array.isArray(cookies) || cookies.length === 0) {
        console.error("❌ Cookie list kosong atau tidak valid.");
        return;
    }
    const folder = path.dirname(screenshotPath);
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true });
    }
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
    });
    await context.addCookies(cookies);
    const page = await context.newPage();
    try {
        await page.goto(url, { waitUntil: "load", timeout: 60000 });
        await page.waitForTimeout(5000);
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`✅ Screenshot tersimpan di ${screenshotPath}`);
    }
    catch (err) {
        console.error("❌ Gagal buka halaman:", err);
    }
    finally {
        await browser.close();
    }
}
