from playwright.sync_api import Page, expect

def test_ui_verification(page: Page):
    """
    This test verifies the UI changes to the Landing and Dashboard pages at different viewport sizes.
    """
    # 1. Arrange: Go to the Landing page.
    page.goto("http://localhost:5173")

    # 2. Act: Test mobile viewport.
    page.set_viewport_size({"width": 375, "height": 667})
    page.screenshot(path="jules-scratch/verification/landing_page_mobile.png")

    # 3. Act: Test tablet viewport.
    page.set_viewport_size({"width": 768, "height": 1024})
    page.screenshot(path="jules-scratch/verification/landing_page_tablet.png")

    # 4. Act: Test desktop viewport.
    page.set_viewport_size({"width": 1920, "height": 1080})
    page.screenshot(path="jules-scratch/verification/landing_page_desktop.png")

    # 5. Act: Navigate to the Dashboard page.
    page.get_by_role("button", name="Get Started").click()

    # 6. Assert: Confirm the navigation was successful.
    expect(page).to_have_url("http://localhost:5173/dashboard")

    # 7. Act: Test mobile viewport.
    page.set_viewport_size({"width": 375, "height": 667})
    page.screenshot(path="jules-scratch/verification/dashboard_page_mobile.png")

    # 8. Act: Test tablet viewport.
    page.set_viewport_size({"width": 768, "height": 1024})
    page.screenshot(path="jules-scratch/verification/dashboard_page_tablet.png")

    # 9. Act: Test desktop viewport.
    page.set_viewport_size({"width": 1920, "height": 1080})
    page.screenshot(path="jules-scratch/verification/dashboard_page_desktop.png")
