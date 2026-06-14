"""
AksharaWorld — Daily Social Media Runner
Runs at 7:00 AM daily via Windows Task Scheduler.
Orchestrates: content selection → video generation → multi-platform posting
→ Sheets logging → Telegram owner digest.

Schedule:
  07:00 AM — Instagram + Facebook + Threads (simultaneous)
  07:05 AM — X (Twitter)
  09:00 AM — Pinterest
  10:00 AM — YouTube Short

Author: Sam | 2026-06-14
"""

import time
import json
from pathlib import Path
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed

from content_parser import (
    parse_week1_content, get_today_content, mark_posted, is_posted
)
from video_generator import generate_reel, generate_campaign_reel
from poster import AksharaWorldPoster


# ── Paths ─────────────────────────────────────────────────────────────────────

REPO_ROOT = Path(__file__).resolve().parents[2]
LOG_PATH  = REPO_ROOT / "services" / "social-media" / "run_log.jsonl"


# ── Logger ────────────────────────────────────────────────────────────────────

def log_run(entry: dict):
    entry["timestamp"] = datetime.now().isoformat()
    with open(LOG_PATH, "a", encoding="utf-8") as f:
        f.write(json.dumps(entry, ensure_ascii=False) + "\n")


# ── Platform runners ──────────────────────────────────────────────────────────

def run_instagram(poster: AksharaWorldPoster, content: dict) -> dict:
    day = content["day"]
    if is_posted(day, "instagram"):
        return {"platform": "instagram", "status": "already_posted"}

    video_path = str(REPO_ROOT / content.get("video_path", ""))
    caption = content.get("caption", "")
    result = poster.post_instagram_reel(video_path, caption)
    mark_posted(day, "instagram", result.get("post_id", ""), result.get("status", "error"))
    poster.log_post("instagram", result.get("post_id", ""), result.get("status"), "reel", caption)
    return result


def run_facebook(poster: AksharaWorldPoster, content: dict) -> dict:
    day = content["day"]
    if is_posted(day, "facebook"):
        return {"platform": "facebook", "status": "already_posted"}

    video_path = str(REPO_ROOT / content.get("video_path", ""))
    caption = content.get("caption", "")
    result = poster.post_facebook(message=caption, video_path=video_path)
    mark_posted(day, "facebook", result.get("post_id", ""), result.get("status", "error"))
    poster.log_post("facebook", result.get("post_id", ""), result.get("status"), "video", caption)
    return result


def run_threads(poster: AksharaWorldPoster, content: dict) -> dict:
    day = content["day"]
    if is_posted(day, "threads"):
        return {"platform": "threads", "status": "already_posted"}

    caption = content.get("caption", "")
    image_path = str(REPO_ROOT / content.get("image_path", ""))
    result = poster.post_threads(text=caption, image_path=image_path)
    mark_posted(day, "threads", result.get("post_id", ""), result.get("status", "error"))
    poster.log_post("threads", result.get("post_id", ""), result.get("status"), "image", caption)
    return result


def run_x_twitter(poster: AksharaWorldPoster, content: dict) -> dict:
    day = content["day"]
    if is_posted(day, "x_twitter"):
        return {"platform": "x_twitter", "status": "already_posted"}

    # X has 280 char limit — use hook + CTA
    hook = content.get("caption_hook", content.get("caption", "")[:200])
    cta = content.get("cta", "Comment BLUEPRINT for the full guide 👇")
    text = f"{hook}\n\n{cta}\n\n#AksharaWorld #AI #Jobs #India"[:280]
    image_path = str(REPO_ROOT / content.get("image_path", ""))
    result = poster.post_x_twitter(text=text, media_path=image_path)
    mark_posted(day, "x_twitter", result.get("post_id", ""), result.get("status", "error"))
    poster.log_post("x_twitter", result.get("post_id", ""), result.get("status"), "tweet", text)
    return result


def run_pinterest(poster: AksharaWorldPoster, content: dict) -> dict:
    day = content["day"]
    if is_posted(day, "pinterest"):
        return {"platform": "pinterest", "status": "already_posted"}

    title = content.get("title", content.get("type", "AksharaWorld"))
    description = content.get("caption", "")[:500]
    image_path = str(REPO_ROOT / content.get("image_path", ""))
    result = poster.post_pinterest(image_path=image_path, title=title, description=description)
    mark_posted(day, "pinterest", result.get("post_id", ""), result.get("status", "error"))
    poster.log_post("pinterest", result.get("post_id", ""), result.get("status"), "pin", title)
    return result


def run_youtube(poster: AksharaWorldPoster, content: dict) -> dict:
    day = content["day"]
    if is_posted(day, "youtube"):
        return {"platform": "youtube", "status": "already_posted"}

    video_path = str(REPO_ROOT / content.get("video_path", ""))
    title = content.get("title", "AksharaWorld | AI Career Tips")
    description = content.get("caption", "") + "\n\n🔗 aksharaworld.in"
    tags = [h.lstrip("#") for h in content.get("hashtags", [])]
    result = poster.post_youtube_short(video_path, title, description, tags)
    mark_posted(day, "youtube", result.get("post_id", ""), result.get("status", "error"))
    poster.log_post("youtube", result.get("post_id", ""), result.get("status"), "short", title)
    return result


# ── Main runner ───────────────────────────────────────────────────────────────

def run():
    start = datetime.now()
    print(f"\n{'='*60}")
    print(f"  AksharaWorld Daily Runner — {start.strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*60}\n")

    poster = AksharaWorldPoster()
    results = {}

    # ── Step 1: Get today's content ───────────────────────────────────────
    try:
        content = get_today_content()
    except Exception as e:
        msg = f"❌ Content load failed: {e}"
        print(msg)
        poster.notify_owner(f"Daily runner FAILED — content load error:\n{e}")
        return

    if not content:
        poster.notify_owner("📭 No content scheduled for today. All days posted!")
        print("Nothing to post today.")
        return

    day = content["day"]
    title = content.get("title", content.get("type", f"Day {day}"))
    print(f"📅 Today's content: Day {day} — {title}")

    # ── Step 2: Generate video if needed ──────────────────────────────────
    video_path = content.get("video_path")
    if video_path:
        full_video = REPO_ROOT / video_path
        if not full_video.exists():
            print(f"[Runner] Video not found, generating...")
            try:
                image_path = str(REPO_ROOT / content.get("image_path", "assets/images/ganesh_day0.png"))
                out = generate_reel(
                    image_path=image_path,
                    output_name=f"day{day}_auto",
                    duration_secs=25
                )
                content["video_path"] = str(Path(out).relative_to(REPO_ROOT))
                print(f"[Runner] ✅ Video generated: {out}")
            except Exception as e:
                print(f"[Runner] ⚠️ Video generation failed: {e} — continuing without video")
                content["video_path"] = None
    elif content.get("type") == "blueprint_campaign":
        try:
            out = generate_campaign_reel(day, content.get("topic", "campaign"))
            content["video_path"] = str(Path(out).relative_to(REPO_ROOT))
        except Exception as e:
            print(f"[Runner] ⚠️ Campaign video generation failed: {e}")

    # ── Step 3: 7:00 AM — Instagram + Facebook + Threads (parallel) ───────
    print(f"\n[07:00] Posting to Instagram, Facebook, Threads simultaneously...")
    with ThreadPoolExecutor(max_workers=3) as executor:
        futures = {
            executor.submit(run_instagram, poster, content): "instagram",
            executor.submit(run_facebook, poster, content): "facebook",
            executor.submit(run_threads, poster, content): "threads",
        }
        for future in as_completed(futures):
            platform = futures[future]
            try:
                results[platform] = future.result()
            except Exception as e:
                results[platform] = {"status": "error", "reason": str(e)}
            print(f"  [{platform}] → {results[platform].get('status')}")

    # ── Step 4: 7:05 AM — X (Twitter) ────────────────────────────────────
    print(f"\n[07:05] Posting to X (Twitter)...")
    time.sleep(5)  # brief pause
    try:
        results["x_twitter"] = run_x_twitter(poster, content)
    except Exception as e:
        results["x_twitter"] = {"status": "error", "reason": str(e)}
    print(f"  [x_twitter] → {results['x_twitter'].get('status')}")

    # ── Step 5: 9:00 AM — Pinterest ──────────────────────────────────────
    # Note: In production this waits until 9AM. In the scheduler, daily_runner.py
    # is called ONCE at 7AM and uses time.sleep() or sub-schedules for later tasks.
    # For simplicity, Pinterest posts immediately after X here.
    print(f"\n[09:00] Posting to Pinterest...")
    try:
        results["pinterest"] = run_pinterest(poster, content)
    except Exception as e:
        results["pinterest"] = {"status": "error", "reason": str(e)}
    print(f"  [pinterest] → {results['pinterest'].get('status')}")

    # ── Step 6: 10:00 AM — YouTube Short ─────────────────────────────────
    print(f"\n[10:00] Uploading YouTube Short...")
    try:
        results["youtube"] = run_youtube(poster, content)
    except Exception as e:
        results["youtube"] = {"status": "error", "reason": str(e)}
    print(f"  [youtube] → {results['youtube'].get('status')}")

    # ── Step 7: Summary ───────────────────────────────────────────────────
    elapsed = (datetime.now() - start).seconds
    success  = [p for p, r in results.items() if r.get("status") == "success"]
    skipped  = [p for p, r in results.items() if r.get("status") in ("skipped", "already_posted")]
    failed   = [p for p, r in results.items() if r.get("status") == "error"]

    summary = (
        f"📊 <b>Daily Post Report — Day {day}</b>\n"
        f"📅 {start.strftime('%Y-%m-%d')}\n"
        f"📌 {title}\n\n"
        f"✅ Posted: {', '.join(success) or 'None'}\n"
        f"⏭ Skipped: {', '.join(skipped) or 'None'}\n"
        f"❌ Failed: {', '.join(failed) or 'None'}\n"
        f"⏱ Duration: {elapsed}s"
    )

    print(f"\n{summary}")
    poster.notify_owner(summary)

    # Log to file
    log_run({"day": day, "title": title, "results": results, "elapsed_secs": elapsed})

    print(f"\n{'='*60}")
    print(f"  Run complete. {len(success)} posted, {len(skipped)} skipped, {len(failed)} failed.")
    print(f"{'='*60}\n")


# ── Entry point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import sys
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('--dry-run', action='store_true')
    args = parser.parse_args()
    
    if args.dry_run:
        print("[DRY RUN] Would execute daily runner, but skipping actual execution.")
        try:
            content = get_today_content()
            if content:
                print(f"[DRY RUN] Content to post: Day {content['day']} - {content.get('title', '')}")
            else:
                print("[DRY RUN] No content scheduled for today.")
        except Exception as e:
            print(f"[DRY RUN] Error loading content: {e}")
    else:
        run()
