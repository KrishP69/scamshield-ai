from app.core.crypto import decrypt_field, encrypt_field, hash_indicator


def test_field_encryption_roundtrip():
    original_text = "Secret conversation with suspicious seller regarding payment"
    ciphertext = encrypt_field(original_text)
    assert ciphertext != original_text
    decrypted = decrypt_field(ciphertext)
    assert decrypted == original_text


def test_salted_indicator_hashing():
    wallet_1 = "0x71C95911E9a5D330f4d621842EC243EE1343292e"
    wallet_2 = "0x71c95911e9a5d330f4d621842ec243ee1343292e"
    # Salting & lowercase normalisation ensures identical hash
    hash_1 = hash_indicator(wallet_1)
    hash_2 = hash_indicator(wallet_2)
    assert hash_1 == hash_2
    assert len(hash_1) == 64
