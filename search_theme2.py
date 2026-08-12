import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        await page.goto('http://localhost:8080')
        await page.wait_for_load_state('networkidle')

        # Click the search button in header
        await page.locator('button').filter(has=page.locator('svg.lucide-search')).click()
        await page.wait_for_timeout(1000) # wait for animation

        # Type 'Theme' just to show it, or scroll down
        await page.keyboard.type('th')
        await page.wait_for_timeout(1000)

        await page.screenshot(path='theme_search2.png')
        await browser.close()

asyncio.run(main())
