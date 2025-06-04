import { chromium } from "playwright-extra";
import stealth from "puppeteer-extra-plugin-stealth";
chromium.use(stealth());
(async () => {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
    });
    // Masukkan cookie cf_clearance dari browser
    // await context.addCookies([
    //   {
    //     name: "cf_clearance",
    //     value: "rvprT8Mc8IihFokTDw8X89ivQp0gb3PAUG.VhOfBNsI-1748839457-1.2.1.1-bStTIP6sSSmzSeLCHl8uO.2_sBgi1wq9A6i6ib0zJuf99cKTIvOBilc.7nanbBRNOlZemVMzAv5Sz2XZR.gmjUEWS6nbCzCKWqhNQ8uaOejGS7SgmQ1DxumuXmTPB83xlD0kRjHCi7qg7nWNXDBJz8sCZf0h_av0jpuraLIWHslBGmCrDFOWucPFmwWEMLR6qQXgheTtnPn1DjgjAsru6Wiq7FVfXc9IJMOOq2a7LsCODHKEzhkputYnQdylwK95d6I9uU48mcFOcCvDQhS4Rv3aHtjbviOEX5EdZptf4A2Kkddzrr60lKdLlhMR0CMPxPMiPjp6N2enDJLGH1ireFMJgIBwmEDkPF_d73iAa47DA2_y5eiWoC9NhLQQHOdO",
    //     domain: "tradersfamily.id",
    //     path: "/",
    //     httpOnly: true,
    //     secure: true,
    //     sameSite: "Lax",
    //   },
    // ]);
    const page = await context.newPage();
    try {
        await page.goto("https://tradersfamily.id", {
            waitUntil: "load",
            timeout: 60000,
        });
        await page.waitForTimeout(60000); // tunggu halaman stabil
        await page.screenshot({ path: "tradersfamily.png", fullPage: true });
        console.log("✅ Bypass berhasil, screenshot disimpan.");
    }
    catch (err) {
        console.error("❌ Gagal buka halaman:", err);
    }
    finally {
        await browser.close();
    }
})();
