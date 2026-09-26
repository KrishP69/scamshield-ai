import io
from typing import Dict, List, Optional, Tuple
from PIL import Image, ImageEnhance, ImageFilter

try:
    import pytesseract
    PYTESSERACT_AVAILABLE = True
except ImportError:
    PYTESSERACT_AVAILABLE = False


def preprocess_image_for_ocr(image: Image.Image) -> Image.Image:
    """Preprocesses screenshot: converts to grayscale, enhances contrast, and sharpens edges."""
    # Convert to grayscale
    gray = image.convert("L")
    # Enhance contrast
    enhancer = ImageEnhance.Contrast(gray)
    enhanced = enhancer.enhance(1.8)
    # Median filter to reduce digital noise from compression
    filtered = enhanced.filter(ImageFilter.MedianFilter(size=3))
    return filtered


def extract_text_from_image(image_bytes: bytes, lang: str = "eng+hin") -> Dict[str, any]:
    """
    Extracts text from uploaded image / screenshot using Tesseract OCR.
    Returns extracted text, confidence estimation, and operational status.
    """
    if not image_bytes:
        return {"text": "", "confidence": 0.0, "status": "empty_input"}

    try:
        image = Image.open(io.BytesIO(image_bytes))
    except Exception as e:
        return {"text": "", "confidence": 0.0, "status": f"invalid_image: {str(e)}"}

    processed_image = preprocess_image_for_ocr(image)

    if not PYTESSERACT_AVAILABLE:
        return {
            "text": "",
            "confidence": 0.0,
            "status": "offline_fallback: pytesseract not installed",
        }

    try:
        # Run OCR with Tesseract
        text = pytesseract.image_to_string(processed_image, lang=lang)
        # Calculate mean word confidence from OCR data
        data = pytesseract.image_to_data(processed_image, output_type=pytesseract.Output.DICT)
        confidences = [int(c) for c in data.get("conf", []) if int(c) >= 0]
        avg_confidence = (sum(confidences) / len(confidences)) / 100.0 if confidences else 0.5

        return {
            "text": text.strip(),
            "confidence": round(avg_confidence, 2),
            "status": "success",
        }
    except Exception as e:
        # Handles cases where tesseract binary is not in PATH
        return {
            "text": "",
            "confidence": 0.0,
            "status": f"offline_fallback: {str(e)}",
        }
