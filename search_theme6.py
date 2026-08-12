from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.goto('http://localhost:8080')
    page.wait_for_selector('button:has(svg.lucide-search)')
    page.locator('button:has(svg.lucide-search)').first.click()
    page.wait_for_selector('[cmdk-input]')
    # Type something to filter to Theme
    page.locator('[cmdk-input]').fill('Theme')
    page.wait_for_timeout(1000)
    page.screenshot(path='theme_search6.png')

    # Also clear and scroll down to the bottom
    page.locator('[cmdk-input]').fill('')
    page.wait_for_timeout(500)
    # Scroll down the list
    page.mouse.wheel(0, 500)
    page.wait_for_timeout(500)
    page.screenshot(path='theme_search7.png')

    browser.close()
