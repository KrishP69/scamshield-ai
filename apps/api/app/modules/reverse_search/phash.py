import io
from typing import Optional, Tuple
from PIL import Image

try:
    import imagehash
except ImportError:
    imagehash = None

KNOWN_SCAM_PHOTO_HASHES = {
    "8f8f8e8e1c1c1c1c": {
        "title": "Reported Cloned Identity Photo",
        "description": "Perceptual hash matches a known stolen profile picture repeatedly utilized in urgent WhatsApp/Facebook impersonation fraud.",
        "corroborations": 18,
    },
    "ffff0000ffff0000": {
        "title": "Stolen Military Officer Portrait",
        "description": "Recycled stock photo of Indian Armed Forces personnel frequently abused for OLX/Marketplace advance-payment scams.",
        "corroborations": 34,
    },
}


def compute_image_phash(image_bytes: bytes) -> Optional[str]:
    try:
        img = Image.open(io.BytesIO(image_bytes))
        if imagehash:
            h = imagehash.phash(img)
            return str(h)
        # Fallback simple average hash if imagehash not installed
        resized = img.convert("L").resize((8, 8), Image.Resampling.LANCZOS)
        pixels = list(resized.getdata())
        avg = sum(pixels) / len(pixels)
        bits = "".join("1" if p > avg else "0" for p in pixels)
        return f"{int(bits, 2):016x}"
    except Exception:
        return None


def match_scam_photo_phash(phash_str: str, max_hamming_distance: int = 4) -> Tuple[bool, Optional[dict]]:
    if not phash_str:
        return False, None

    for known_hex, meta in KNOWN_SCAM_PHOTO_HASHES.items():
        try:
            if imagehash:
                target_hash = imagehash.hex_to_hash(phash_str)
                known_hash = imagehash.hex_to_hash(known_hex)
                distance = target_hash - known_hash
            else:
                # Bitwise hamming distance
                v1 = int(phash_str, 16)
                v2 = int(known_hex, 16)
                distance = bin(v1 ^ v2).count("1")

            if distance <= max_hamming_distance:
                return True, meta
        except Exception:
            continue

    return False, None

