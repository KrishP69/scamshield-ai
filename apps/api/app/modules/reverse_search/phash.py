import io
from typing import Optional, Tuple
from PIL import Image
import imagehash

# Known scam profile photo perceptual hashes (pHash/dHash hex strings)
KNOWN_SCAM_PHOTO_HASHES = {
    # Demo Scenario 2: Cloned friend / stolen profile photo pHash
    "8f8f8e8e1c1c1c1c": {
        "title": "Reported Cloned Identity Photo",
        "description": "Perceptual hash matches a known stolen profile picture repeatedly utilized in urgent WhatsApp/Facebook impersonation fraud.",
        "corroborations": 14,
    },
    "ffff0000ffff0000": {
        "title": "Stolen Military Officer Portrait",
        "description": "Recycled stock photo of Indian Armed Forces personnel frequently abused for OLX/Marketplace advance-payment scams.",
        "corroborations": 23,
    },
}


def compute_image_phash(image_bytes: bytes) -> Optional[str]:
    """Computes 64-bit perceptual hash (pHash) from image bytes."""
    try:
        img = Image.open(io.BytesIO(image_bytes))
        h = imagehash.phash(img)
        return str(h)
    except Exception:
        return None


def match_scam_photo_phash(phash_str: str, max_hamming_distance: int = 4) -> Tuple[bool, Optional[dict]]:
    """
    Compares perceptual hash against known scam image hashes using Hamming distance.
    Distance <= 4 indicates identical or lightly cropped/recompressed image.
    """
    if not phash_str:
        return False, None

    try:
        target_hash = imagehash.hex_to_hash(phash_str)
    except Exception:
        return False, None

    for known_hex, meta in KNOWN_SCAM_PHOTO_HASHES.items():
        try:
            known_hash = imagehash.hex_to_hash(known_hex)
            distance = target_hash - known_hash
            if distance <= max_hamming_distance:
                return True, meta
        except Exception:
            continue

    return False, None
