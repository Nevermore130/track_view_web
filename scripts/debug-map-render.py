#!/usr/bin/env python3
import json
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright


url = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:3000/"
screenshot_path = Path("/tmp/trace-atlas-map-repro.png")
events: list[dict[str, str]] = []

with sync_playwright() as playwright:
    browser = playwright.chromium.launch(
        executable_path="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        headless=True,
    )
    page = browser.new_page(viewport={"width": 1440, "height": 900})
    page.on(
        "console",
        lambda message: events.append(
            {"kind": f"console:{message.type}", "message": message.text}
        ),
    )
    page.on(
        "pageerror",
        lambda error: events.append({"kind": "pageerror", "message": str(error)}),
    )
    page.on(
        "requestfailed",
        lambda request: events.append(
            {
                "kind": "requestfailed",
                "message": f"{request.url} — {request.failure}",
            }
        ),
    )

    page.goto(url, wait_until="domcontentloaded", timeout=30_000)
    page.wait_for_timeout(8_000)
    canvas = page.locator(".maplibregl-canvas")
    canvas_count = canvas.count()
    canvas_box = canvas.first.bounding_box() if canvas_count else None
    map_shell = page.locator(".map-stage")
    map_shell_count = map_shell.count()
    map_text = map_shell.inner_text(timeout=1_000) if map_shell_count else ""
    body_text = page.locator("body").inner_text(timeout=1_000)
    page.screenshot(path=str(screenshot_path), full_page=True)
    browser.close()

result = {
    "url": url,
    "canvas_count": canvas_count,
    "canvas_box": canvas_box,
    "map_shell_count": map_shell_count,
    "map_text": map_text,
    "body_text": body_text[:500],
    "events": events,
    "screenshot": str(screenshot_path),
}
print(json.dumps(result, ensure_ascii=False, indent=2))

fatal_events = [
    event
    for event in events
    if event["kind"] == "pageerror"
    or "maplibre-gl-worker" in event["message"]
]
if (
    map_shell_count != 1
    or canvas_count != 1
    or not canvas_box
    or canvas_box["width"] < 300
    or "OpenFreeMap" not in map_text
    or fatal_events
):
    raise SystemExit(1)
