import os
from .model import FraudRiskModel


def train_and_save():
    """Train the fraud risk model on a balanced synthetic dataset."""
    texts = [
        # financial_fraud (8 samples)
        "My account was hacked and money was transferred to an unknown bank account",
        "Fraudsters drained my entire savings account via an unauthorized NEFT transfer",
        "My credit card was charged Rs 50000 without my permission or knowledge",
        "Someone made an international wire transfer from my account without authorization",
        "I found multiple unauthorized debits on my bank statement this morning",
        "My bank account was emptied overnight via multiple small transactions",
        "Someone changed my mobile banking credentials and transferred all my money",
        "Unauthorized RTGS transfer of Rs 200000 from my account to unknown beneficiary",

        # phishing_scam (7 samples)
        "They sent a phishing link to my email to steal my login password",
        "Got an SMS saying my UPI is blocked and I need to click a suspicious link",
        "I received a suspicious email from my bank asking for my pin and password",
        "A fake website that looked exactly like my bank stole my login credentials",
        "I got a message with a link to verify my account details on a fake page",
        "They sent me an email with my bank logo asking me to update my KYC online",
        "Received WhatsApp message with link to claim prize that asked for card details",

        # otp_fraud (5 samples)
        "Received a call asking for my OTP for a lottery win and then lost money",
        "Someone called pretending to be bank staff and asked for my OTP code",
        "I shared my OTP thinking it was for a refund and my account was debited",
        "A caller said they need my OTP to process my cashback and stole my money",
        "Person said they are from government and needed OTP to deposit subsidy amount",

        # investment_scam (5 samples)
        "Invest in this crypto scheme and double your money in 2 days guaranteed",
        "A trading app promised 30 percent monthly returns and disappeared with Rs 300000",
        "They showed me fake profits in an app for 3 months then blocked my withdrawal",
        "A Telegram group asked me to invest in forex for guaranteed daily profits",
        "Online investment scheme promised high returns but now they are not responding",

        # tech_support_scam (5 samples)
        "Customer support asked me to download a remote desktop app and they stole money",
        "A person claiming to be Microsoft support accessed my computer and stole data",
        "Fake antivirus pop-up showed virus alert and asked me to call a support number",
        "They accessed my computer remotely pretending to fix a problem and looted bank",
        "A pop-up on my screen said my computer is hacked call this toll free number",

        # social_media_fraud (4 samples)
        "Someone created a fake profile of my friend and asked me to send money urgently",
        "A Facebook account pretending to be my cousin asked for emergency money transfer",
        "Someone hacked my Instagram and used it to scam my followers for money",
        "Received fake matrimonial profile that built trust over months and then demanded money",

        # identity_theft (4 samples)
        "Someone took a loan in my name using my Aadhaar and PAN card documents",
        "My identity was stolen and used to open multiple credit cards without my consent",
        "I received notice for a loan I never took showing my forged signature on documents",
        "Credit report shows accounts I never opened suggesting someone stole my identity",

        # card_fraud (4 samples)
        "My debit card details were stolen and used for online shopping without my knowledge",
        "I got OTP for transactions I never initiated using my credit card number",
        "My ATM card was cloned and cash was withdrawn from an ATM in another city",
        "Someone made multiple international online purchases using my credit card details",

        # online_shopping_fraud (4 samples)
        "I paid for a mobile phone on an online marketplace and never received the product",
        "Seller on e-commerce platform sent empty box after taking full payment for laptop",
        "I bought clothes from an Instagram shop that took payment and then blocked me",
        "Paid for a product on a fake website that looked genuine and got nothing delivered",

        # loan_scam (3 samples)
        "A loan app charged processing fee upfront and then denied my loan and disappeared",
        "They said I am pre-approved for loan and asked for insurance fee before disbursement",
        "Instant loan app charged multiple fees but never transferred the loan amount",

        # sextortion (3 samples)
        "Someone recorded me on video call and now threatening to send to my family for money",
        "A woman added me on social media and then blackmailed me with intimate photos for money",
        "Received threatening messages saying my intimate videos will be shared if I don't pay",

        # crypto_scam (3 samples)
        "A trading platform convinced me to invest Bitcoin and now I cannot withdraw my funds",
        "Lost cryptocurrency to a fake exchange that closed overnight with all deposited funds",
        "Someone promised guaranteed crypto returns and disappeared with my entire investment",

        # theft (4 samples)
        "Someone stole my phone near the bus stop while I was waiting for the bus",
        "My car was broken into and the stereo and laptop bag were stolen overnight",
        "Pickpocket stole my wallet containing cash and cards at the railway station",
        "My bicycle was stolen from outside the market while I was shopping inside",

        # emergency (3 samples)
        "Emergency someone got stabbed at the metro station and is bleeding badly",
        "A guy is trying to break into the neighbor house right now please send police",
        "There is a fire in the building and people are trapped on the upper floors",

        # general (5 samples)
        "I want to report a loud party next door that is disturbing residents at night",
        "There is a traffic jam on Main street due to an accident blocking both lanes",
        "I lost my wallet in the park yesterday with some cash and my bus pass inside",
        "Stray dogs near our colony are creating nuisance and biting children playing",
        "There is illegal construction happening next to my house without any permit",
    ]

    labels = [
        # financial_fraud
        'financial_fraud', 'financial_fraud', 'financial_fraud', 'financial_fraud',
        'financial_fraud', 'financial_fraud', 'financial_fraud', 'financial_fraud',
        # phishing_scam
        'phishing_scam', 'phishing_scam', 'phishing_scam', 'phishing_scam',
        'phishing_scam', 'phishing_scam', 'phishing_scam',
        # otp_fraud
        'otp_fraud', 'otp_fraud', 'otp_fraud', 'otp_fraud', 'otp_fraud',
        # investment_scam
        'investment_scam', 'investment_scam', 'investment_scam', 'investment_scam', 'investment_scam',
        # tech_support_scam
        'tech_support_scam', 'tech_support_scam', 'tech_support_scam', 'tech_support_scam', 'tech_support_scam',
        # social_media_fraud
        'social_media_fraud', 'social_media_fraud', 'social_media_fraud', 'social_media_fraud',
        # identity_theft
        'identity_theft', 'identity_theft', 'identity_theft', 'identity_theft',
        # card_fraud
        'card_fraud', 'card_fraud', 'card_fraud', 'card_fraud',
        # online_shopping_fraud
        'online_shopping_fraud', 'online_shopping_fraud', 'online_shopping_fraud', 'online_shopping_fraud',
        # loan_scam
        'loan_scam', 'loan_scam', 'loan_scam',
        # sextortion
        'sextortion', 'sextortion', 'sextortion',
        # crypto_scam
        'crypto_scam', 'crypto_scam', 'crypto_scam',
        # theft
        'theft', 'theft', 'theft', 'theft',
        # emergency
        'emergency', 'emergency', 'emergency',
        # general
        'general', 'general', 'general', 'general', 'general',
    ]

    assert len(texts) == len(labels), f"Mismatch: {len(texts)} texts vs {len(labels)} labels"

    model = FraudRiskModel()
    model.fit(texts, labels)

    # Evaluate baseline accuracy on training set
    correct = 0
    for t, l in zip(texts, labels):
        pred = model.analyze(t)['detected_patterns'][0]
        if pred == l:
            correct += 1
    accuracy = correct / len(texts)
    print(f"Training completed on {len(texts)} samples across {len(set(labels))} categories.")
    print(f"Baseline Accuracy: {accuracy * 100:.1f}%")

    save_path = os.path.join(os.path.dirname(__file__), 'fraud_model.json')
    model.save(save_path)
    print(f"Model saved to {save_path}")
    return model


if __name__ == '__main__':
    train_and_save()
