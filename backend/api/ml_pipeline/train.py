import os
from .model import FraudRiskModel

def train_and_save():
    # Synthetic dataset spanning various fraud types and general complaints
    texts = [
        "My account was hacked and money was transferred to an unknown bank",
        "Received a call asking for my OTP for a lottery win",
        "Someone stole my phone near the bus stop",
        "I want to report a loud party next door",
        "They sent a phishing link to my email to reset my password",
        "My credit card was charged $500 without my permission",
        "Two guys were fighting outside the mall",
        "Got an SMS saying my UPI is blocked and I need to click a link",
        "Fraudsters drained my entire savings account via an unauthorized NEFT",
        "My car was broken into and the stereo is gone",
        "A guy is trying to break into the neighbor's house right now!",
        "Invest in this crypto scheme and double your money in 2 days",
        "Customer support asked me to download a remote desktop app",
        "I lost my wallet in the park yesterday",
        "Emergency, someone got stabbed at the station!",
        "I received a suspicious email from my bank asking for my pin",
        "There is a traffic jam on Main street",
    ]
    labels = [
        "financial_fraud",
        "phishing_scam",
        "theft",
        "general",
        "phishing_scam",
        "financial_fraud",
        "general",
        "phishing_scam",
        "financial_fraud",
        "theft",
        "emergency",
        "investment_scam",
        "tech_support_scam",
        "general",
        "emergency",
        "phishing_scam",
        "general"
    ]
    
    model = FraudRiskModel()
    model.fit(texts, labels)
    
    # Evaluate baseline
    correct = 0
    for t, l in zip(texts, labels):
        pred = model.analyze(t)['detected_patterns'][0]
        if pred == l:
            correct += 1
    
    accuracy = correct / len(texts)
    print(f"Training completed. Baseline Accuracy: {accuracy*100:.1f}%")
    
    # Save
    save_path = os.path.join(os.path.dirname(__file__), 'fraud_model.json')
    model.save(save_path)
    print(f"Model saved to {save_path}")

if __name__ == '__main__':
    train_and_save()
