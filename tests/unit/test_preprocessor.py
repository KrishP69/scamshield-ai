from app.preprocess.clean import clean_text
from app.preprocess.entities import extract_all_entities, extract_crypto_wallets, extract_phone_numbers, extract_urls
from app.preprocess.lang import detect_language


def test_clean_text_deobfuscation():
    raw = "Contact me on w.h.a.t.s.a.p.p for G i v e a w a y !!!!"
    cleaned, flags = clean_text(raw)
    assert "whatsapp" in cleaned
    assert "Giveaway" in cleaned
    assert len(flags) >= 2


def test_language_detection():
    en_res = detect_language("Hello, I am interested in buying your sofa set.")
    assert en_res["language"] == "en"

    hi_res = detect_language("यह संदेश बहुत महत्वपूर्ण है और बैंक खाता ब्लॉक हो सकता है")
    assert hi_res["language"] == "hi"

    hinglish_res = detect_language("Bhai jaldi paisa bhejo turant warna police thana me complaint hogi")
    assert hinglish_res["language"] == "hinglish"


def test_entity_extraction_urls():
    text = "Visit http://sbi-yono-kyc-update.xyz/login or www.google.com for more info."
    urls = extract_urls(text)
    assert any("sbi-yono-kyc-update.xyz" in u for u in urls)
    assert any("google.com" in u for u in urls)


def test_entity_extraction_phones():
    text = "Call me at +919820099999 or 9820011111 immediately."
    phones = extract_phone_numbers(text)
    assert len(phones) >= 1
    assert any("+91" in p["e164"] for p in phones)


def test_entity_extraction_crypto_wallets():
    text = (
        "Send funds to 0x71C95911E9a5D330f4d621842EC243EE1343292e (ETH) "
        "or 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa (BTC) "
        "or TJkNNN7bWc4oAep3Dq1xT2e19aWk44aX8a (TRON)"
    )
    wallets = extract_crypto_wallets(text)
    chains = [w["chain"] for w in wallets]
    assert "ethereum" in chains
    assert "bitcoin" in chains
    assert "tron" in chains


def test_entity_extraction_amounts():
    text = "Please transfer Rs. 2,000 or ₹25,000 advance payment."
    entities = extract_all_entities(text)
    assert len(entities["amounts"]) >= 2
