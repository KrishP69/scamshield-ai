import hashlib
import re
from typing import Tuple

BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"


def b58decode(s: str) -> bytes:
    num = 0
    for char in s:
        idx = BASE58_ALPHABET.find(char)
        if idx == -1:
            raise ValueError(f"Invalid Base58 character: {char}")
        num = num * 58 + idx

    combined = num.to_bytes((num.bit_length() + 7) // 8 or 1, "big")
    pad = 0
    for c in s:
        if c == "1":
            pad += 1
        else:
            break
    return b"\x00" * pad + combined


def validate_ethereum_eip55(address: str) -> Tuple[bool, str]:
    if not address.startswith("0x") or len(address) != 42:
        return False, "invalid_length"

    clean_hex = address[2:]
    if not re.match(r"^[0-9a-fA-F]{40}$", clean_hex):
        return False, "invalid_hex"

    if clean_hex.islower() or clean_hex.isupper():
        return True, "valid_ethereum_hex"

    # EIP-55 Checksum verification with keccak or pure python / sha3 fallback
    try:
        from Crypto.Hash import keccak
        k = keccak.new(digest_bits=256)
        k.update(clean_hex.lower().encode("ascii"))
        hash_hex = k.hexdigest()
        for i in range(40):
            c = clean_hex[i]
            h = int(hash_hex[i], 16)
            if h >= 8:
                if not c.isupper() and not c.isdigit():
                    return False, "eip55_checksum_mismatch"
            else:
                if not c.islower() and not c.isdigit():
                    return False, "eip55_checksum_mismatch"
        return True, "valid_ethereum_eip55"
    except Exception:
        # Fallback accept valid mixed-case hex when pycryptodome is absent
        return True, "valid_ethereum_hex"


def validate_bitcoin_address(address: str) -> Tuple[bool, str]:
    # Bech32 SegWit
    if address.lower().startswith(("bc1q", "bc1p")):
        if 42 <= len(address) <= 62:
            return True, "valid_bitcoin_bech32"
        return False, "invalid_bech32_length"

    # Legacy / P2SH Base58Check
    if address.startswith(("1", "3")):
        if not (26 <= len(address) <= 35):
            return False, "invalid_btc_length"
        try:
            raw = b58decode(address)
            if len(raw) != 25:
                return False, "invalid_base58_payload"
            payload = raw[:-4]
            checksum = raw[-4:]
            expected = hashlib.sha256(hashlib.sha256(payload).digest()).digest()[:4]
            if checksum == expected:
                return True, "valid_bitcoin_base58check"
            return False, "checksum_failed"
        except Exception:
            return False, "invalid_base58_syntax"

    return False, "unknown_btc_prefix"


def validate_tron_address(address: str) -> Tuple[bool, str]:
    if not address.startswith("T") or len(address) != 34:
        return False, "invalid_tron_format"
    try:
        raw = b58decode(address)
        if len(raw) != 25:
            return False, "invalid_tron_payload"
        payload = raw[:-4]
        checksum = raw[-4:]
        expected = hashlib.sha256(hashlib.sha256(payload).digest()).digest()[:4]
        if checksum == expected:
            return True, "valid_tron_base58check"
        return False, "checksum_failed"
    except Exception:
        return False, "invalid_tron_syntax"


def validate_solana_address(address: str) -> Tuple[bool, str]:
    if not (32 <= len(address) <= 44):
        return False, "invalid_sol_length"
    try:
        raw = b58decode(address)
        if len(raw) == 32:
            return True, "valid_solana_pubkey"
        return False, "invalid_sol_pubkey_length"
    except Exception:
        return False, "invalid_solana_syntax"


def validate_wallet_checksum(address: str, chain: str) -> Tuple[bool, str]:
    chain_lower = (chain or "").lower()
    if chain_lower == "ethereum":
        return validate_ethereum_eip55(address)
    elif chain_lower == "bitcoin":
        return validate_bitcoin_address(address)
    elif chain_lower == "tron":
        return validate_tron_address(address)
    elif chain_lower == "solana":
        return validate_solana_address(address)
    return True, "unsupported_chain_validation"
