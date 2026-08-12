from playwright.sync_api import sync_playwright
import time

def verify_theme_search():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto('http://localhost:8080')
        page.wait_for_load_state('networkidle')

        # Dispatch Cmd+K to open palette directly
        page.keyboard.press('Control+K')
        time.sleep(1)

        # Scroll down by pressing down arrow a few times
        for _ in range(10):
            page.keyboard.press('ArrowDown')
            time.sleep(0.1)

        page.screenshot(path='theme_search.png')
        browser.close()

if __name__ == "__main__":
    verify_theme_search()
