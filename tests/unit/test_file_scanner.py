import pytest
from app.modules.base import ScanContext
from app.modules.file_scanner.apk_parser import inspect_package_name, inspect_permissions
from app.modules.file_scanner.service import file_scanner


def test_dangerous_permissions_inspection():
    dangerous_perms = [
        "android.permission.BIND_ACCESSIBILITY_SERVICE",
        "android.permission.READ_SMS",
        "android.permission.INTERNET",
    ]
    flags, is_critical, summary = inspect_permissions(dangerous_perms)
    assert is_critical
    assert len(flags) >= 2


def test_package_impersonation():
    is_imp, note = inspect_package_name("com.sbi.rewards.update")
    assert is_imp
    assert "com.sbi.rewards" in note


@pytest.mark.asyncio
async def test_file_scanner_apk_and_hash():
    # EICAR test hash from Scenario 5
    ctx = ScanContext(
        scan_id="test-file-1",
        file_name="SBI_Rewards.apk",
        metadata={
            "sha256": "275a021bbfb6489e54d471899f7db9d1663fc695ec2fe2a2c4538aabf651fd0f",
            "package_name": "com.sbi.rewards.update",
            "permissions": [
                "android.permission.BIND_ACCESSIBILITY_SERVICE",
                "android.permission.READ_SMS",
            ],
        },
    )
    finding = await file_scanner.analyze(ctx)
    assert finding.module == "file_scanner"
    assert finding.score >= 0.90
    assert finding.verdict.value == "dangerous"

    codes = [e.code for e in finding.evidence]
    assert "VIRUSTOTAL_MALWARE_HIT" in codes
    assert "DANGEROUS_PERMISSIONS_COMBO" in codes
    assert "PACKAGE_NAME_IMPERSONATION" in codes
