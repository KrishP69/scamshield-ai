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
    
    # telegram_task_job & task scams
    ("Part time online job like youtube videos and earn Rs 3000 daily work from home on Telegram task review", "fake_job_task"),
    ("Earn 5000 rupees daily by rating hotels on Google Maps join our official Telegram task group", "fake_job_task"),
    ("Hello dear! We have high commission online work. Rating apps on Google Play Store, earn 2000-5000 per day. If interested message our Telegram customer service: @MaryManager", "fake_job_task"),
    ("Amazon Flipkart hiring work from home part time daily salary 1000 to 3000 RS contact via Telegram @Amazon_Job_Help", "fake_job_task"),
    ("Watch youtube videos like and get 50 per like daily payout 2000-5000 INR on UPI contact manager on Telegram @hr_priya or t.me/dailyearn", "fake_job_task"),
    ("Prepaid merchant task complete 5 orders and get 30% commission withdraw to bank account instantly", "fake_job_task"),
    ("Part time online job like youtube videos and subscribe channels earn 3000 to 8000 daily work from home on Telegram", "fake_job_task"),
    ("Google maps hotel review rating task daily salary 4000 rupees contact Telegram receptionist @TaskSupervisor", "fake_job_task"),
    
    # investment_crypto & signals
    ("Send 0.5 ETH to official smart contract pool and immediately receive 3X back guaranteed 300% instant returns", "investment_crypto"),
    ("Double your Bitcoin in 24 hours guaranteed VIP signal group invest 1000 get 5000 profit daily", "investment_crypto"),
    ("VIP Crypto Signals Channel! Daily 200% - 500% guaranteed profit. Join our exclusive insider group: t.me/crypto_vip_pumps. Send 100 USDT get 500 USDT in 2 hours", "investment_crypto"),
    ("Guaranteed trading signals with 99% accuracy recover all losses in 1 week VIP membership fee 50 USDT contact admin @crypto_whale_signals", "investment_crypto"),
    ("Earn 10% daily ROI in USDT passive income smart contract join Telegram channel t.me/CryptoWealthOfficial", "investment_crypto"),
    ("Join Telegram pump group next coin will pump 1000% buy now before announcement insider leak", "investment_crypto"),
    ("Invest 1000 get 10000 in 30 minutes 100% genuine recovery plan binary options trading forex manager", "investment_crypto"),
    
    # airdrop_giveaway & telegram gifts
    ("Binance 10th anniversary official airdrop connect wallet enter your 12-word seed phrase to claim reward allocation", "airdrop_giveaway"),
    ("Free 500 USDT giveaway click link connect metamask private key to claim", "airdrop_giveaway"),
    ("Congratulations! You have won $10,000 USDT in Telegram Lucky Draw! Connect your wallet at claim-telegram-airdrop.xyz to withdraw", "airdrop_giveaway"),
    ("Free 1000 Stars on Telegram! Send your phone number and login code to claim free telegram stars", "airdrop_giveaway"),
    ("Free 1 year Telegram Premium subscription gift click link claim gift enter login code", "airdrop_giveaway"),
    ("Free Telegram Premium 1 year gift claim now at t.me/FreePremiumClaimBot enter phone and verification code", "airdrop_giveaway"),
    
    # lottery_prize
    ("Congratulations you have won 25 Lakh in Kaun Banega Crorepati KBC lottery call manager to claim prize", "lottery_prize"),
    ("Your mobile number selected for international cash prize lottery pay processing tax to release cheque", "lottery_prize"),
    ("Kaun Banega Crorepati Head Office your number selected for 2500000 cash lottery contact Rana Pratap Singh 8923719823 pay clearance tax", "lottery_prize"),
    
    # kyc_bank_upi
    ("Dear customer your SBI Yono NetBanking account deactivated today due to PAN KYC update details http sbi login", "kyc_bank_upi"),
    ("HDFC Alert your debit card is blocked update your KYC urgently click here to verify pan card", "kyc_bank_upi"),
    ("URGENT NOTICE Your PAN card has not been linked to your HDFC bank account your account will be closed in 12 hours update immediately here http hdfc-pan-update", "kyc_bank_upi"),
    ("Dear customer your SBI account suspended update PAN card immediately to avoid permanent deactivation http sbi-kyc-verify", "kyc_bank_upi"),
    
    # tech_support_impersonation & telegram account phishing
    ("Microsoft Support detected Trojan virus on your computer do not restart call toll free technician immediately", "tech_support_impersonation"),
    ("Telegram security team detected unauthorized login verify identity by providing the login code sent to you", "tech_support_impersonation"),
    ("Telegram Notification: Your account will be terminated in 24 hours. Click t.me/TelegramVerificationBot to verify or enter your login code", "tech_support_impersonation"),
    ("Telegram security bot unauthorized login attempt detected from Russia send your verification login code to cancel termination", "tech_support_impersonation"),
    
    # loan_app_harassment
    ("Immediate instant personal loan without cibil check or income proof approve in 2 minutes download apk now", "loan_app_harassment"),
    ("Your loan overdue pay penalty or we will send morphed photos to all your contact numbers", "loan_app_harassment"),
    ("Instant Loan 100000 approved in 5 minutes no income proof zero cibil install APK cash fast loan pay processing charge or contacts will be harassed", "loan_app_harassment"),
    
    # utility_electricity_scam
    ("Dear consumer your electricity power will be disconnected at 9:30 PM tonight because your previous month bill was not updated contact officer", "utility_electricity_scam"),
    ("Electricity bill pending your meter will be disconnected today call electricity department officer immediately", "utility_electricity_scam"),
    ("Dear User Your electricity line will be disconnected tonight at 9.30 pm from electricity office because your previous month bill was not updated please contact electricity officer 8250000000", "utility_electricity_scam"),

    # digital_arrest_customs
    ("FedEx courier parcel from Mumbai containing MDMA drugs and illegal passports confiscated by Customs connect with CBI inspector on Skype for digital arrest", "digital_arrest_customs"),
    ("Mumbai Police and Narcotics department non-bailable arrest warrant issued against your Aadhaar card join video call immediately", "digital_arrest_customs"),
    ("Your parcel from FedEx DHL tracking number 892189 is on hold at Delhi Airport Customs due to illegal narcotics MDMA found attend Skype interrogation with Mumbai Police digital arrest", "digital_arrest_customs"),
    ("Narcotics Control Bureau NCB and CBI non-bailable arrest warrant issued against your Aadhaar card for money laundering join Skype immediately", "digital_arrest_customs"),
    
    # fake_buyer_overpay_refund
    ("I accidentally sent Rs 25000 instead of 2500 on PhonePe please scan this QR code and enter UPI PIN to receive refund into account", "fake_buyer_overpay_refund"),
    ("I am army officer Subedar Amit Kumar buying your sofa on OLX sending advance money via QR code please scan QR code and put UPI PIN to receive money", "fake_buyer_overpay_refund"),

    # cloned_friend_account
    ("Hi bro are you free? My gpay is not working can you please send 3000 rs to this upi number 9876543210 urgently? I will send you cash tomorrow morning", "cloned_friend_account"),

    # marketplace_advance_payment
    ("I am army officer Subedar Rajesh Sharma posted at Pune Cantonment transfer Rs 2500 refundable gate pass security deposit to dispatch military truck", "marketplace_advance_payment"),
    
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
