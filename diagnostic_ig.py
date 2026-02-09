from playwright.sync_api import sync_playwright
import os

user_data_dir = os.path.abspath("browser_profile")
print(f"Opening browser with profile: {user_data_dir}")

with sync_playwright() as p:
    browser = p.chromium.launch_persistent_context(
        user_data_dir,
        headless=False,
        args=["--disable-blink-features=AutomationControlled"]
    )
    page = browser.new_page()
    page.goto("https://www.instagram.com/explore/tags/fryzjerkatowice/")
    page.wait_for_timeout(10000)
    page.screenshot(path="ig_diagnostic.png")
    print(f"Screenshot saved to ig_diagnostic.png. URL: {page.url}")
    browser.close()
