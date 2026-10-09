import io
import base64
from typing import Dict, Any, Tuple
from PIL import Image, ImageDraw, ImageFont


def _create_gradient_banner(
    size: Tuple[int, int],
    start_color: Tuple[int, int, int],
    end_color: Tuple[int, int, int],
) -> Image.Image:
    """Generates a smooth 2D gradient background."""
    w, h = size
    base = Image.new("RGB", (w, h), start_color)
    top = Image.new("RGB", (w, h), end_color)
    mask = Image.new("L", (w, h))
    mask_data = []
    for y in range(h):
        alpha = int(255 * (y / h))
        mask_data.extend([alpha] * w)
    mask.putdata(mask_data)
    base.paste(top, (0, 0), mask)
    return base


def generate_preset_screenshot(preset: str) -> Dict[str, Any]:
    """
    Renders high-resolution forensic sample banners for representative scam archetypes.
    Returns:
        image_bytes: Raw PNG bytes
        base64_url: Data URI string for immediate browser rendering
        ground_truth_text: Exact text content present in the banner
        metadata: Annotations for threat regions and category
    """
    w, h = 680, 480

    if preset == "instagram_game_phishing":
        # Archetype: Free Fire / BGMI Diamonds Instagram Credential Harvester
        img = _create_gradient_banner((w, h), (180, 20, 20), (20, 10, 40))
        draw = ImageDraw.Draw(img)

        # Border neon glow
        draw.rectangle([10, 10, w - 10, h - 10], outline=(255, 60, 60), width=3)
        draw.rectangle([16, 16, w - 16, h - 16], outline=(255, 180, 0), width=1)

        # Top Urgent Ribbon
        draw.rectangle([20, 24, w - 20, 64], fill=(220, 38, 38))
        draw.text((w // 2 - 190, 34), "🔥 LIMITED TIME GIVEAWAY: 50,000 DIAMONDS 🔥", fill=(255, 255, 255))

        # Main Headline
        draw.rectangle([40, 80, w - 40, 150], fill=(0, 0, 0, 180), outline=(255, 215, 0), width=2)
        draw.text((w // 2 - 180, 95), "FREE FIRE & BGMI SEASON AIRDROP", fill=(255, 215, 0))
        draw.text((w // 2 - 220, 122), "CLAIM 50,000 DIAMONDS + EXCLUSIVE ELITE PASS", fill=(255, 255, 255))

        # Credential Trap Container (The Phishing Box)
        draw.rectangle([60, 170, w - 60, 380], fill=(24, 24, 27), outline=(236, 72, 153), width=2)
        draw.rectangle([70, 178, w - 70, 210], fill=(131, 24, 67))
        draw.text((w // 2 - 190, 186), "⚠️ SYNC WITH INSTAGRAM TO VERIFY YOUR GAMER ID", fill=(255, 255, 255))

        # Input field 1: Username
        draw.rectangle([80, 225, w - 80, 265], fill=(39, 39, 42), outline=(113, 113, 122), width=1)
        draw.text((95, 237), "Instagram Username / Login ID:", fill=(212, 212, 216))

        # Input field 2: Password
        draw.rectangle([80, 280, w - 80, 320], fill=(39, 39, 42), outline=(113, 113, 122), width=1)
        draw.text((95, 292), "Instagram Password:", fill=(212, 212, 216))

        # Action Button
        draw.rectangle([w // 2 - 130, 335, w // 2 + 130, 370], fill=(22, 163, 74), outline=(187, 247, 208), width=2)
        draw.text((w // 2 - 90, 344), "VERIFY & CLAIM DIAMONDS", fill=(255, 255, 255))

        # Footer Urgency Timer & Social Proof
        draw.text((w // 2 - 170, 398), "⏳ Offer Expires in: 04:59 minutes | 14,892 Claimed Today", fill=(251, 191, 36))
        draw.text((w // 2 - 210, 425), "Notice: Do not refresh page while account synchronization is in progress.", fill=(156, 163, 175))

        ground_truth = (
            "LIMITED TIME GIVEAWAY: 50,000 DIAMONDS! FREE FIRE & BGMI SEASON AIRDROP. "
            "CLAIM 50,000 DIAMONDS + EXCLUSIVE ELITE PASS. "
            "SYNC WITH INSTAGRAM TO VERIFY YOUR GAMER ID. "
            "Instagram Username / Login ID. Instagram Password. "
            "VERIFY & CLAIM DIAMONDS. "
            "Offer Expires in 04:59 minutes. 14,892 Claimed Today. "
            "Notice: Do not refresh page while account synchronization is in progress."
        )

        metadata = {
            "archetype": "game_reward_credential_harvesting",
            "bait_item": "50,000 Free Fire Diamonds",
            "target_credential": "Instagram Username & Password",
            "impersonated_brand": "Free Fire & Instagram",
        }

    elif preset == "instagram_copyright_strike":
        # Archetype: Fake Instagram Copyright Infringement Extortion
        img = _create_gradient_banner((w, h), (15, 23, 42), (9, 9, 11))
        draw = ImageDraw.Draw(img)

        draw.rectangle([14, 14, w - 14, h - 14], outline=(79, 70, 229), width=2)

        # Instagram styled top banner
        draw.rectangle([30, 30, w - 30, 80], fill=(24, 24, 27))
        draw.text((50, 46), "Instagram Help Center | Copyright Legal Department", fill=(244, 244, 245))

        # Warning Card
        draw.rectangle([40, 100, w - 40, 230], fill=(30, 41, 59), outline=(239, 68, 68), width=2)
        draw.text((60, 115), "NOTICE: COPYRIGHT INFRINGEMENT DETECTED ON YOUR ACCOUNT", fill=(248, 113, 113))
        draw.text(
            (60, 145),
            "We have received a DMCA copyright takedown request regarding posts on your profile.",
            fill=(226, 232, 240),
        )
        draw.text(
            (60, 170),
            "Your account is scheduled for PERMANENT TERMINATION within 24 hours.",
            fill=(254, 202, 202),
        )
        draw.text(
            (60, 195),
            "If you believe this is an error, you must verify your identity immediately.",
            fill=(203, 213, 225),
        )

        # Phishing Action Form
        draw.rectangle([60, 250, w - 60, 400], fill=(15, 23, 42), outline=(147, 51, 234), width=1)
        draw.text((80, 265), "Appeal Copyright Penalty & Retain Account:", fill=(255, 255, 255))
        draw.rectangle([80, 290, w - 80, 325], fill=(30, 41, 59), outline=(100, 116, 139), width=1)
        draw.text((95, 301), "Enter Instagram Username / Email:", fill=(148, 163, 184))
        draw.rectangle([80, 335, w - 80, 370], fill=(30, 41, 59), outline=(100, 116, 139), width=1)
        draw.text((95, 346), "Enter Instagram Password:", fill=(148, 163, 184))

        draw.rectangle([w // 2 - 110, 415, w // 2 + 110, 450], fill=(225, 29, 72))
        draw.text((w // 2 - 80, 424), "SUBMIT APPEAL & VERIFY", fill=(255, 255, 255))

        ground_truth = (
            "Instagram Help Center | Copyright Legal Department. "
            "NOTICE: COPYRIGHT INFRINGEMENT DETECTED ON YOUR ACCOUNT. "
            "We have received a DMCA copyright takedown request regarding posts on your profile. "
            "Your account is scheduled for PERMANENT TERMINATION within 24 hours. "
            "If you believe this is an error, you must verify your identity immediately. "
            "Appeal Copyright Penalty & Retain Account. "
            "Enter Instagram Username / Email. Enter Instagram Password. "
            "SUBMIT APPEAL & VERIFY."
        )

        metadata = {
            "archetype": "account_takeover_phishing",
            "bait_item": "Account Termination Threat",
            "target_credential": "Instagram Password & Email",
            "impersonated_brand": "Instagram Security Team",
        }

    elif preset == "iphone_lottery_giveaway":
        # Archetype: Absurd iPhone 16 Pro Giveaway Advance Fee
        img = _create_gradient_banner((w, h), (245, 158, 11), (67, 20, 7))
        draw = ImageDraw.Draw(img)

        draw.rectangle([12, 12, w - 12, h - 12], outline=(254, 240, 138), width=3)

        # Header
        draw.rectangle([30, 25, w - 30, 75], fill=(180, 83, 9))
        draw.text((w // 2 - 180, 38), "🎉 CONGRATULATIONS! LUCKY DRAW WINNER 🎉", fill=(255, 255, 255))

        # Main Prize
        draw.rectangle([40, 95, w - 40, 200], fill=(255, 255, 255), outline=(217, 119, 6), width=2)
        draw.text((w // 2 - 160, 110), "YOU HAVE WON AN APPLE iPHONE 16 PRO (1TB)!", fill=(180, 83, 9))
        draw.text((w // 2 - 200, 140), "Market Value: ₹1,59,900 | Special Anniversary Promotional Winner", fill=(75, 85, 99))
        draw.text((w // 2 - 170, 168), "Status: RESERVED FOR DISPATCH | Only 1 Unit Left", fill=(22, 163, 74))

        # Fee Demands Trap
        draw.rectangle([50, 220, w - 50, 340], fill=(254, 242, 242), outline=(239, 68, 68), width=2)
        draw.text((70, 235), "⚠️ MANDATORY DISPATCH VERIFICATION:", fill=(185, 28, 28))
        draw.text(
            (70, 260),
            "To clear airport customs and insurance courier handling, pay refundable fee of ₹499.",
            fill=(55, 65, 81),
        )
        draw.text((70, 285), "Scan UPI QR Code to pay ₹499 or send to upi@expresscourier", fill=(31, 41, 55))
        draw.text((70, 310), "Enter your UPI PIN to complete parcel registration.", fill=(220, 38, 38))

        # Urgency
        draw.rectangle([w // 2 - 150, 365, w // 2 + 150, 410], fill=(220, 38, 38))
        draw.text((w // 2 - 120, 378), "CLAIM WITHIN 09:30 OR FORFEIT", fill=(255, 255, 255))
        draw.text((w // 2 - 190, 430), "Unclaimed devices will be re-allocated to next queue participant.", fill=(254, 243, 199))

        ground_truth = (
            "CONGRATULATIONS! LUCKY DRAW WINNER! "
            "YOU HAVE WON AN APPLE iPHONE 16 PRO (1TB)! Market Value: ₹1,59,900. "
            "Special Anniversary Promotional Winner. Status: RESERVED FOR DISPATCH. "
            "MANDATORY DISPATCH VERIFICATION: To clear airport customs and insurance courier handling, "
            "pay refundable fee of ₹499. Scan UPI QR Code to pay ₹499 or send to upi@expresscourier. "
            "Enter your UPI PIN to complete parcel registration. "
            "CLAIM WITHIN 09:30 OR FORFEIT."
        )

        metadata = {
            "archetype": "absurd_giveaway_lottery",
            "bait_item": "Apple iPhone 16 Pro (₹1,59,900)",
            "target_credential": "Advance UPI Fee & UPI PIN Entry",
            "impersonated_brand": "Apple & Express Courier",
        }

    elif preset == "task_like_reels_job":
        # Archetype: Fake Instagram Reel Liking / Part-Time Job Scam
        img = _create_gradient_banner((w, h), (13, 148, 136), (15, 23, 42))
        draw = ImageDraw.Draw(img)

        draw.rectangle([12, 12, w - 12, h - 12], outline=(45, 212, 191), width=2)

        # Header
        draw.rectangle([30, 25, w - 30, 80], fill=(19, 78, 74))
        draw.text((w // 2 - 160, 40), "📱 ONLINE PART-TIME JOB OPPORTUNITY 📱", fill=(255, 255, 255))

        # Main Offer
        draw.rectangle([40, 100, w - 40, 220], fill=(255, 255, 255))
        draw.text((60, 115), "EARN ₹2,000 - ₹5,000 DAILY FROM HOME!", fill=(15, 118, 110))
        draw.text(
            (60, 145),
            "Task: Like Instagram Reels & Subscribe to YouTube Channels. (₹50 per like)",
            fill=(30, 41, 59),
        )
        draw.text((60, 170), "Time required: 20 to 30 minutes daily on mobile.", fill=(71, 85, 105))
        draw.text((60, 195), "Instant payout directly on Google Pay, PhonePe, or UPI.", fill=(16, 185, 129))

        # Off-Platform move
        draw.rectangle([50, 240, w - 50, 360], fill=(240, 253, 250), outline=(13, 148, 136), width=2)
        draw.text((70, 255), "HOW TO START IMMEDIATELY:", fill=(15, 118, 110))
        draw.text(
            (70, 280),
            "1. Contact HR Manager on Telegram: @earn_daily_manager or t.me/dailyearntasks",
            fill=(15, 23, 42),
        )
        draw.text((70, 305), "2. Complete initial test tasks and receive ₹150 bonus.", fill=(51, 65, 85))
        draw.text((70, 330), "3. Upgrade to VIP prepaid task tier for 300% commission returns.", fill=(225, 29, 72))

        draw.rectangle([w // 2 - 140, 385, w // 2 + 140, 430], fill=(13, 148, 136))
        draw.text((w // 2 - 100, 398), "JOIN TELEGRAM CHANNEL NOW", fill=(255, 255, 255))

        ground_truth = (
            "ONLINE PART-TIME JOB OPPORTUNITY. "
            "EARN ₹2,000 - ₹5,000 DAILY FROM HOME! "
            "Task: Like Instagram Reels & Subscribe to YouTube Channels. (₹50 per like). "
            "Time required: 20 to 30 minutes daily on mobile. "
            "Instant payout directly on Google Pay, PhonePe, or UPI. "
            "HOW TO START IMMEDIATELY: Contact HR Manager on Telegram: @earn_daily_manager or t.me/dailyearntasks. "
            "Complete initial test tasks and receive ₹150 bonus. "
            "Upgrade to VIP prepaid task tier for 300% commission returns. "
            "JOIN TELEGRAM CHANNEL NOW."
        )

        metadata = {
            "archetype": "task_job_fraud",
            "bait_item": "Earn ₹5,000/day liking reels",
            "target_credential": "Telegram Off-Platform & Prepaid Task Trap",
            "impersonated_brand": "Instagram & YouTube",
        }

    else:
        # Default: Legitimate Authentic Game Update Banner
        img = _create_gradient_banner((w, h), (30, 58, 138), (15, 23, 42))
        draw = ImageDraw.Draw(img)

        draw.rectangle([12, 12, w - 12, h - 12], outline=(96, 165, 250), width=2)
        draw.text((w // 2 - 140, 40), "OFFICIAL GAME COMMUNITY UPDATE", fill=(147, 197, 253))

        draw.rectangle([40, 80, w - 40, 260], fill=(30, 41, 59), outline=(59, 130, 246), width=1)
        draw.text((60, 100), "FREE FIRE MAX: SEASON 15 CHAMPIONSHIP PATCH", fill=(255, 255, 255))
        draw.text((60, 135), "- Balanced assault rifle recoil and sprint mechanics.", fill=(203, 213, 225))
        draw.text((60, 165), "- New Bermuda map weather system and optimized textures.", fill=(203, 213, 225))
        draw.text((60, 195), "- Anti-cheat engine v4.2 upgrade activated.", fill=(203, 213, 225))
        draw.text((60, 225), "- Official Garena Release. Download update from store.", fill=(147, 197, 253))

        draw.rectangle([60, 290, w - 60, 380], fill=(15, 23, 42), outline=(71, 85, 105), width=1)
        draw.text((80, 310), "AVAILABLE NOW ON GOOGLE PLAY & APPLE APP STORE", fill=(255, 255, 255))
        draw.text(
            (80, 340),
            "Always update through official app stores. Staff will NEVER ask for passwords.",
            fill=(148, 163, 184),
        )

        draw.rectangle([w // 2 - 120, 410, w // 2 + 120, 450], fill=(37, 99, 235))
        draw.text((w // 2 - 90, 422), "VISIT GOOGLE PLAY STORE", fill=(255, 255, 255))

        ground_truth = (
            "OFFICIAL GAME COMMUNITY UPDATE. "
            "FREE FIRE MAX: SEASON 15 CHAMPIONSHIP PATCH. "
            "Balanced assault rifle recoil and sprint mechanics. "
            "New Bermuda map weather system and optimized textures. "
            "Anti-cheat engine v4.2 upgrade activated. "
            "Official Garena Release. Download update from store. "
            "AVAILABLE NOW ON GOOGLE PLAY & APPLE APP STORE. "
            "Always update through official app stores. Staff will NEVER ask for passwords. "
            "VISIT GOOGLE PLAY STORE."
        )

        metadata = {
            "archetype": "legitimate_game_update",
            "bait_item": "Official Patch Notes",
            "target_credential": "None - Legitimate",
            "impersonated_brand": "Garena / Google Play",
        }

    # Save to buffer
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    raw_bytes = buf.getvalue()
    b64_str = base64.b64encode(raw_bytes).decode("ascii")
    data_url = f"data:image/png;base64,{b64_str}"

    return {
        "image_bytes": raw_bytes,
        "base64_url": data_url,
        "ground_truth_text": ground_truth,
        "metadata": metadata,
    }
