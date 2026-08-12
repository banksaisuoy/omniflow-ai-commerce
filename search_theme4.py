from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.goto('http://localhost:8080')
    page.wait_for_selector('button:has(svg.lucide-search)')
    page.locator('button:has(svg.lucide-search)').first.click()
    page.wait_for_selector('[cmdk-dialog]')
    # Just wait a moment for the dialog and animation to settle
    page.wait_for_timeout(1000)
    page.screenshot(path='theme_search4.png')
    browser.close()
