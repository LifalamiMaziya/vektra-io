from playwright.sync_api import Page, expect

def test_ui_verification(page: Page):
    """
    This test verifies the UI changes to the Landing and Dashboard pages.
    """
    # 1. Arrange: Go to the Landing page.
    page.goto("http://localhost:5173")

    # 2. Act: Take a screenshot of the Landing page.
    page.screenshot(path="jules-scratch/verification/landing_page.png")

    # 3. Act: Navigate to the Dashboard page.
    page.get_by_role("button", name="Get Started").click()

    # 4. Assert: Confirm the navigation was successful.
    expect(page).to_have_url("http://localhost:5173/dashboard")

    # 5. Act: Take a screenshot of the Dashboard page.
    page.screenshot(path="jules-scratch/verification/dashboard_page.png")
