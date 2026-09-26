import re
from typing import Dict, List, Tuple
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline

# Seed training corpus covering the 14 scam-type classes from Blueprint Section 7.1
SEED_CORPUS: List[Tuple[str, str]] = [
    # marketplace_advance_payment
    ("Hello I am in the Indian Army at Pune Cantonment transfer Rs 2000 advance refundable gate pass deposit via UPI", "marketplace_advance_payment"),
    ("I am army officer buying your furniture please send courier security deposit 1500 to confirm truck dispatch", "marketplace_advance_payment"),
    ("Pay advance booking fee 3000 to reserve the vehicle and I will deliver it tomorrow", "marketplace_advance_payment"),
    
    # fake_buyer_overpay_refund
    ("I accidentally sent Rs 50000 instead of 5000 on Google Pay please refund the difference immediately check screenshot", "fake_buyer_overpay_refund"),
    ("I have sent extra money by mistake please scan this QR code to receive the refund into your account", "fake_buyer_overpay_refund"),
    
    # cloned_friend_account
    ("Hi dear lost my old phone in taxi this is my new whatsapp number mother admitted ICU send 5000 UPI hospital emergency", "cloned_friend_account"),
    ("Hey bro this is my new temporary number wallet stolen need 2000 urgently will repay tomorrow morning", "cloned_friend_account"),
    
    # romance_impersonation
    ("My beloved I have sent you a luxury gift parcel containing gold jewelry from London customs is demanding clearance fee", "romance_impersonation"),
    ("Darling I am trapped at Dubai airport immigration officer demands clearance fee send money to help me", "romance_impersonation"),
    
    # fake_job_task
    ("Part time online job like youtube videos and earn Rs 3000 daily work from home on Telegram task review", "fake_job_task"),
    ("Earn 5000 rupees daily by rating hotels on Google Maps join our official Telegram task group", "fake_job_task"),
    
    # investment_crypto
    ("Send 0.5 ETH to official smart contract pool and immediately receive 3X back guaranteed 300% instant returns", "investment_crypto"),
    ("Double your Bitcoin in 24 hours guaranteed VIP signal group invest 1000 get 5000 profit daily", "investment_crypto"),
    
    # airdrop_giveaway
    ("Binance 10th anniversary official airdrop connect wallet enter your 12-word seed phrase to claim reward allocation", "airdrop_giveaway"),
    ("Free 500 USDT giveaway click link connect metamask private key to claim", "airdrop_giveaway"),
    
    # lottery_prize
    ("Congratulations you have won 25 Lakh in Kaun Banega Crorepati KBC lottery call manager to claim prize", "lottery_prize"),
    ("Your mobile number selected for international cash prize lottery pay processing tax to release cheque", "lottery_prize"),
    
    # kyc_bank_upi
    ("Dear customer your SBI Yono NetBanking account deactivated today due to PAN KYC update details http sbi login", "kyc_bank_upi"),
    ("HDFC Alert your debit card is blocked update your KYC urgently click here to verify pan card", "kyc_bank_upi"),
    
    # tech_support_impersonation
    ("Microsoft Support detected Trojan virus on your computer do not restart call toll free technician immediately", "tech_support_impersonation"),
    ("Telegram security team detected unauthorized login verify identity by providing the login code sent to you", "tech_support_impersonation"),
    
    # loan_app_harassment
    ("Immediate instant personal loan without cibil check or income proof approve in 2 minutes download apk now", "loan_app_harassment"),
    ("Your loan overdue pay penalty or we will send morphed photos to all your contact numbers", "loan_app_harassment"),
    
    # legit
    ("Hi yes the bicycle is still available you can come test ride it this Saturday in Bandra West cash on collection works", "legit"),
    ("Good morning sir I would like to know if the apartment is still open for rent can we schedule a visit", "legit"),
    ("Your HDFC Bank account ending in 4102 was debited by INR 450.00 at STARBUCKS MUMBAI available balance 18240", "legit"),
    ("Thanks for sending the document I have reviewed the code and everything looks solid let's merge the PR", "legit"),
    ("Hey mom reaching home in 15 minutes please keep dinner ready love you", "legit"),
    ("Meeting is rescheduled to 4 PM in the conference room please bring your laptop", "legit"),
]


class BaselineScamClassifier:
    """TF-IDF + Naive Bayes baseline multi-class scam classifier."""

    def __init__(self):
        texts, labels = zip(*SEED_CORPUS)
        self.pipeline = Pipeline([
            ("tfidf", TfidfVectorizer(ngram_range=(1, 2), stop_words="english")),
            ("clf", MultinomialNB(alpha=0.1)),
        ])
        self.pipeline.fit(texts, labels)
        self.classes = list(self.pipeline.classes_)

    def predict(self, text: str) -> Tuple[str, float]:
        """Predicts scam type class and probability confidence score."""
        if not text.strip():
            return "legit", 0.9

        probs = self.pipeline.predict_proba([text])[0]
        max_idx = probs.argmax()
        scam_type = self.classes[max_idx]
        confidence = float(probs[max_idx])

        # If highest confidence is below threshold, categorize as other_suspicious
        if scam_type != "legit" and confidence < 0.25:
            scam_type = "other_suspicious"

        return scam_type, round(confidence, 2)


# Singleton instance for fast zero-cost inference
baseline_classifier = BaselineScamClassifier()
