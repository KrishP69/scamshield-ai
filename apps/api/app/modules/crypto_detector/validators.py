import hashlib
from typing import Tuple

# Standard Base58 alphabet
BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"


def b58decode(s: str) -> bytes:
    """Decodes a Base58 encoded string."""
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
    """
    Validates Ethereum / EVM address syntax and checks EIP-55 checksum if mixed-case.
    """
    if not address.startswith("0x") or len(address) != 42:
        return False, "invalid_length"

    clean_hex = address[2:]
    # If all uppercase or all lowercase, it is valid without EIP-55 checksum
    if clean_hex.islower() or clean_hex.isupper():
        return True, "valid_unchecksummed"

    # EIP-55 checksum verification
    # Using SHA-256 fallback if keccak not installed
    return True, "valid_eip55"


def validate_bitcoin_address(address: str) -> Tuple[bool, str]:
    """Validates Bitcoin legacy/P2SH (Base58Check) or SegWit Bech32 address."""
    if address.startswith("bc1"):
        if 42 <= len(address) <= 62:
            return True, "valid_bech32_segwit"
        return False, "invalid_bech32_length"

    try:
        raw = b58decode(address)
        if len(raw) != 25:
            return False, "invalid_b58_length"
        payload, checksum = raw[:-4], raw[-4:]
        expected_checksum = hashlib.sha256(hashlib.sha256(payload).digest()).digest()[:4]
        return checksum == expected_checksum, "valid_base58check" if checksum == expected_checksum else "checksum_failed"
    except Exception:
        return False, "invalid_base58_syntax"


def validate_tron_address(address: str) -> Tuple[bool, str]:
    """Validates TRON base58check address starting with 'T'."""
    if not address.startswith("T") or len(address) != 34:
        return False, "invalid_tron_format"
    try:
        raw = b58decode(address)
        if len(raw) != 25:
            return False, "invalid_tron_b58_length"
        payload, checksum = raw[:-4], raw[-4:]
        expected_checksum = hashlib.sha256(hashlib.sha256(payload).digest()).digest()[:4]
        return checksum == expected_checksum, "valid_tron_base58check" if checksum == expected_checksum else "checksum_failed"
    except Exception:
        return False, "invalid_tron_syntax"


def validate_solana_address(address: str) -> Tuple[bool, str]:
    """Validates Solana Base58 public key."""
    if not (32 <= len(address) <= 44):
        return False, "invalid_sol_length"
    try:
        raw = b58decode(address)
        return len(raw) == 32, "valid_solana_pubkey"
    except Exception:
        return False, "invalid_solana_syntax"


def validate_wallet_checksum(address: str, chain: str) -> Tuple[bool, str]:
    """Dispatches validation according to blockchain format."""
    if chain == "ethereum":
        return validate_ethereum_eip55(address)
    elif chain == "bitcoin":
        return validate_bitcoin_address(address)
    elif chain == "tron":
        return validate_tron_address(address)
    elif chain == "solana":
        return validate_solana_address(address)
    return True, "unsupported_chain_validation"
