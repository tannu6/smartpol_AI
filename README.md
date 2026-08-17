# 🛡️ SmartPol AI

### AI-Powered Smart Policing & Cyber Crime Command Platform

SmartPol AI is an enterprise-grade intelligent policing and cybercrime triage platform. It is engineered to assist citizens with rapid reporting of emerging cyber fraud, empower police officers with digital evidence forensics and CAD dispatch telemetry, and equip command supervisors with AI explainability, spatial heat canvases, scam DNA clustering, and suspect network graphs.

The platform aligns with real-world Indian Cyber Crime Coordination Centre (**I4C**) and **CERT-In** threat reporting protocols (such as **1930 Helpline** integration patterns and **CCTNS** legal case resolution workflows).

---

## ⚡ Quick Start

### Backend (Django 5.x REST API)
```bash
# 1. Clone the repository
git clone <repo-url> && cd smartpol_AI

# 2. Set up Python environment
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
source venv/bin/activate       # Linux/Mac

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run migrations and seed Ahmedabad Command Grid data
python manage.py migrate
python manage.py seed_data

# 5. Start development server
python manage.py runserver
```

### Frontend (React 18 + Vite + Tailwind CSS)
```bash
# In a new terminal
cd frontend
npm install
npm run dev
# App available at http://localhost:5173
```

---

## 🚨 Real-World Threat Vectors Covered (I4C / CERT-In Aligned)

SmartPol AI detects and processes modern cybercrime vectors highlighted by **I4C** and **CERT-In**:

1. 🚨 **Digital Arrest Scams**: CBI / ED / Custom Officer impersonation via video call extortion.
2. ⚠️ **Sextortion & Cyber Blackmail**: Photo morphing & intimacy threat extortion.
3. 📱 **APK Utility & Electricity Bill Hijack**: SMS link malicious APK installation & device screen mirroring.
4. 🤖 **AI Deepfake Video & Voice Impersonation**: Synthetic voice cloning & CEO video call scam.
5. 💳 **SIM Swap & NetBanking Takeover**: Duplicate SIM issuance & OTP interception.
6. 📈 **Telegram Task & Part-Time Job Scams**: Task-based investment fraud.
7. 🪙 **Crypto Wallet Mule Laundering**: Multi-tiered smurfing across mule bank accounts.

---

## 🏗️ Platform Architecture & Engineering

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SmartPol AI Command Grid                        │
│                                                                        │
│  ┌──────────────────────┐               ┌───────────────────────────┐  │
│  │   React 18 + Vite    │ ──REST APIs── │   Django 5.x DRF Backend  │  │
│  │  Tailwind + D3.js    │ ◄─WebSockets─ │   Python 3.12 Core        │  │
│  └──────────┬───────────┘               └─────────────┬─────────────┘  │
│             │                                         │                │
│    ┌────────▼─────────┐                      ┌────────▼────────────┐   │
│    │ Spatial Heat Canvas │                      │ Digital Evidence ELA │   │
│    │ D3 Suspect Graph  │                      │ Forensic Engine     │   │
│    └──────────────────┘                      └─────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

### Key Technical Pillars:
- **Backend**: Python 3.12 · Django 5.x · Django REST Framework · SimpleJWT
- **Frontend**: React 18 · Vite · Tailwind CSS · D3.js Force Simulation · Leaflet.js
- **Forensics & AI**: Pillow Error Level Analysis (ELA) · SHA-256 Cryptographic Hashing · Rule-Based & Naive Bayes Intelligence Engine
- **Accessibility**: Multi-language i18n (**Gujarati**, **Hindi**, **English**) · Web Speech API Text-to-Speech (TTS) readout

---

## 🎯 Core Modules & Feature Matrix

### 👤 Citizen Portal
- **Rapid Reporting**: Guided complaint filing with NCRP acknowledgement tracking.
- **Geolocation Pinning**: Interactive Ahmedabad sector map picker with auto-address resolving.
- **Speech-to-Text**: Live microphone voice input for multi-lingual description typing.
- **Evidence Vault**: Secure file upload generating SHA-256 chain-of-custody checksums.

### 👮 Officer Command Center
- **Golden Hour Emergency Alerts**: Active 0–2 hour financial fraud priority queue.
- **AI Explainability Panel**: Dynamic Urgency Scoring (0–98%), Readiness metrics, and synchronized next-action suggestions.
- **Computer-Aided Dispatch (CAD) Telemetry**: Live patrol callsign status (`Unit Blue-4`, `Unit Red-1 SWAT`, `Unit Gold-7`), speed, ping, and vectoring controls.
- **Formal Case Closure Workflow**: Legal resolution options (*Chargesheet Filed in Court*, *Accused Arrested*, *Untraced Final Report*) with court reference recording.

### 📊 Supervisor War Room & Intelligence Fusion
- **Spatial Thermal Density Canvas**: Custom HTML5 Canvas radar grid visualizing crime density hotspot isolines.
- **D3 Suspect Syndicate Graph**: Interactive network mapping connections between Suspect Kingpins, Mule Bank Accounts, Phishing Domains, and Phone SIMs.
- **Scam DNA Laboratory**: Pattern clustering grouping individual complaints into unified attack families.
- **Mule Account Tracking**: Velocity analysis detecting rapid layering and smurfing transactions.

---

## 👤 Developer & Maintainer

### Tannu Sharma
- **Role**: Full-Stack Engineer & AI Cybersecurity Researcher
- **Specialization**: Smart Policing Technologies, Cyber Fraud Intelligence & Digital Forensics
- **Repository**: [smartpol_AI](https://github.com/tannu6/smartpol_AI)

---

⭐ **Built for Law Enforcement Excellence & Cyber Crime Prevention** ⭐
