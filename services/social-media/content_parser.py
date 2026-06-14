"""
AksharaWorld — Content Parser
Reads docs/INSTAGRAM_CONTENT_WEEK1.md and extracts structured daily content.
Tracks which days have been posted using SQLite.
Author: Sam | 2026-06-14
"""

import re
import json
import sqlite3
from pathlib import Path
from datetime import datetime, date
from typing import Optional


# ── Paths ────────────────────────────────────────────────────────────────────

REPO_ROOT    = Path(__file__).resolve().parents[2]
CONTENT_FILE = REPO_ROOT / "docs" / "INSTAGRAM_CONTENT_WEEK1.md"
DB_PATH      = REPO_ROOT / "services" / "social-media" / "posting_state.db"
CONTENT_DIR  = REPO_ROOT / "assets" / "content"


# ── Database ─────────────────────────────────────────────────────────────────

def init_db():
    """Create posting state table if not exists."""
    conn = sqlite3.connect(DB_PATH)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS post_log (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            day         INTEGER NOT NULL,
            platform    TEXT NOT NULL,
            post_id     TEXT,
            status      TEXT NOT NULL,
            content_key TEXT,
            posted_at   TEXT DEFAULT (datetime('now')),
            UNIQUE(day, platform)
        )
    """)
    conn.commit()
    conn.close()


def mark_posted(day: int, platform: str, post_id: str, status: str = "success"):
    init_db()
    conn = sqlite3.connect(DB_PATH)
    conn.execute("""
        INSERT OR REPLACE INTO post_log (day, platform, post_id, status)
        VALUES (?, ?, ?, ?)
    """, (day, platform, post_id, status))
    conn.commit()
    conn.close()


def is_posted(day: int, platform: str) -> bool:
    init_db()
    conn = sqlite3.connect(DB_PATH)
    row = conn.execute(
        "SELECT 1 FROM post_log WHERE day=? AND platform=? AND status='success'",
        (day, platform)
    ).fetchone()
    conn.close()
    return row is not None


def get_post_history() -> list:
    init_db()
    conn = sqlite3.connect(DB_PATH)
    rows = conn.execute(
        "SELECT day, platform, post_id, status, posted_at FROM post_log ORDER BY posted_at DESC"
    ).fetchall()
    conn.close()
    return [{"day": r[0], "platform": r[1], "post_id": r[2],
             "status": r[3], "posted_at": r[4]} for r in rows]


# ── Content JSON loader ───────────────────────────────────────────────────────

def load_content_json(day: int) -> Optional[dict]:
    """Load structured content from assets/content/dayN_*.json if exists."""
    for f in CONTENT_DIR.glob(f"day{day}_*.json"):
        return json.loads(f.read_text(encoding="utf-8"))
    return None


# ── Markdown parser ───────────────────────────────────────────────────────────

def parse_week1_content() -> dict:
    """
    Parse docs/INSTAGRAM_CONTENT_WEEK1.md into structured day-by-day content.
    Returns dict keyed by day number (0 = launch, 1-7 = campaign days).
    """
    if not CONTENT_FILE.exists():
        raise FileNotFoundError(f"Content file not found: {CONTENT_FILE}")

    text = CONTENT_FILE.read_text(encoding="utf-8")
    days = {}

    # ── Day 0 — Launch Blessing ───────────────────────────────────────────
    # First load from JSON if available
    day0_json = load_content_json(0)
    if day0_json:
        days[0] = day0_json
    else:
        # Extract from markdown
        day0_section = _extract_section(text, "DAY 0", "TASK 1")
        caption_block = _extract_code_block(text, after="### TASK 2", index=0)
        vandana_block = _extract_code_block(text, after="### TASK 3", index=0)
        days[0] = {
            "day": 0,
            "type": "launch_blessing",
            "video_path": "assets/videos/ganesh_day0_reel_v2.mp4",
            "image_path": "assets/images/ganesh_day0.png",
            "caption": caption_block or "Shubharambha. 🙏\n\nJai Ganesh. 🙏🌼\n\n#GaneshaBlessings #AksharaWorld",
            "vandana": vandana_block or "Vakratunda Mahakaya Suryakoti Samaprabha",
            "platforms": ["instagram", "facebook", "threads"],
            "hashtags": ["#GaneshaBlessings", "#Ganpati", "#JaiGanesh", "#AksharaWorld",
                         "#Shubharambha", "#IndianStartup", "#StartupIndia", "#LaunchDay"],
            "scheduled_time": "immediate",
            "posted": False,
        }

    # ── Days 1–7 — BLUEPRINT Campaign ────────────────────────────────────
    day_pattern = re.compile(
        r"### Day (\d+) — (\w+) \| (.+?)\n"
        r"\*\*Title:\*\* \"(.+?)\"\n"
        r"\n\*\*15-sec Script Outline:\*\*\n(.*?)\n"
        r"\n\*\*Caption Hook:\*\*\n`(.+?)`",
        re.DOTALL
    )

    for match in day_pattern.finditer(text):
        day_num   = int(match.group(1))
        weekday   = match.group(2)
        topic     = match.group(3).strip()
        title     = match.group(4).strip()
        script_raw = match.group(5).strip()
        hook      = match.group(6).strip()

        # Parse script bullets
        script_bullets = [
            line.strip("- ").strip()
            for line in script_raw.splitlines()
            if line.strip().startswith("- ")
        ]

        days[day_num] = {
            "day": day_num,
            "type": "blueprint_campaign",
            "weekday": weekday,
            "topic": topic,
            "title": title,
            "script_outline": script_bullets,
            "caption_hook": hook,
            "caption": _build_campaign_caption(hook, title),
            "image_path": "assets/images/ganesh_day0.png",  # default; swap per day
            "video_path": None,  # generated on the fly by video_generator.py
            "platforms": ["instagram", "facebook", "threads", "x_twitter", "pinterest", "youtube"],
            "hashtags": _default_hashtags(),
            "cta": "Comment BLUEPRINT below and I'll DM you the link instantly 👇",
            "posted": False,
        }

    print(f"[ContentParser] Parsed {len(days)} days of content")
    return days


def get_today_content(days: Optional[dict] = None) -> Optional[dict]:
    """
    Return today's content based on the current date.
    Day 0 = first run ever. Days 1-7 = subsequent days.
    """
    if days is None:
        days = parse_week1_content()

    init_db()
    conn = sqlite3.connect(DB_PATH)

    # Find the first day not yet posted to Instagram
    for day_num in sorted(days.keys()):
        row = conn.execute(
            "SELECT 1 FROM post_log WHERE day=? AND platform='instagram' AND status='success'",
            (day_num,)
        ).fetchone()
        if not row:
            conn.close()
            return days[day_num]

    conn.close()
    print("[ContentParser] All days have been posted!")
    return None


def get_day_content(day_num: int) -> Optional[dict]:
    """Get content for a specific day number."""
    days = parse_week1_content()
    return days.get(day_num)


# ── Helpers ───────────────────────────────────────────────────────────────────

def _extract_section(text: str, start_marker: str, end_marker: str) -> str:
    start = text.find(start_marker)
    end = text.find(end_marker, start) if end_marker else len(text)
    if start == -1:
        return ""
    return text[start:end].strip()


def _extract_code_block(text: str, after: str = "", index: int = 0) -> str:
    """Extract the nth ```...``` code block, optionally after a section header."""
    search_text = text[text.find(after):] if after and after in text else text
    blocks = re.findall(r"```\n(.*?)```", search_text, re.DOTALL)
    if len(blocks) > index:
        return blocks[index].strip()
    return ""


def _build_campaign_caption(hook: str, title: str) -> str:
    return f"""{hook}

Here's exactly what most job seekers are missing — and how to fix it fast.

Drop a comment with BLUEPRINT and I'll send you the full guide instantly. 👇

#resume #resumetips #jobs #jobseekers #india #AI #careertips
#artificialintelligence #atsresume #resumewriting #jobtips
#careergrowth #jobsearch #hiringIndia #linkedintips
#jobhunting #freshersjobs #naukri #worklife #careeradvice"""


def _default_hashtags() -> list:
    return [
        "#resume", "#resumetips", "#jobs", "#jobseekers", "#india", "#AI",
        "#careertips", "#artificialintelligence", "#atsresume", "#resumewriting",
        "#careergrowth", "#jobsearch", "#hiringIndia", "#linkedintips",
        "#jobhunting", "#freshersjobs", "#naukri", "#worklife", "#careeradvice",
        "#AksharaWorld"
    ]


# ── CLI ───────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    days = parse_week1_content()
    print(f"\nParsed {len(days)} days:")
    for day_num, content in days.items():
        status = "✅ POSTED" if is_posted(day_num, "instagram") else "⬜ PENDING"
        print(f"  Day {day_num}: {content.get('title', content.get('type', '?'))} — {status}")

    print("\n--- Today's content ---")
    today = get_today_content(days)
    if today:
        print(json.dumps({k: v for k, v in today.items() if k != "script_outline"}, indent=2, ensure_ascii=False))
    else:
        print("Nothing scheduled for today.")
