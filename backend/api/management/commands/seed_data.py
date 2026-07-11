from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from api.models import (
    Complaint, ComplaintTimeline, MuleAlert, ScamDNA,
    SuspectNode, SuspectEdge, Notification, OfficerAssignment, SystemLog,
)

User = get_user_model()


class Command(BaseCommand):
    help = 'Seed SmartPol AI demo data'

    def handle(self, *args, **options):
        users = {
            'admin': {'role': User.ROLE_ADMIN, 'email': 'admin@smartpol.gov', 'first_name': 'System', 'last_name': 'Admin', 'badge_id': 'ADM-001'},
            'officer1': {'role': User.ROLE_OFFICER, 'email': 'miller@smartpol.gov', 'first_name': 'Chief', 'last_name': 'Miller', 'badge_id': '0944'},
            'supervisor1': {'role': User.ROLE_SUPERVISOR, 'email': 'supervisor@smartpol.gov', 'first_name': 'Sarah', 'last_name': 'Chen', 'badge_id': 'SUP-001'},
            'agent1': {'role': User.ROLE_SECRET_AGENT, 'email': 'agent@smartpol.gov', 'first_name': 'Shadow', 'last_name': 'Operative', 'badge_id': 'SA-007', 'duress_code': 'DELTA-7'},
            'citizen1': {'role': User.ROLE_CITIZEN, 'email': 'citizen@example.com', 'first_name': 'John', 'last_name': 'Citizen'},
        }

        for username, data in users.items():
            user, created = User.objects.get_or_create(username=username, defaults={**data, 'district': 'Sector 7G'})
            if created:
                user.set_password('password123')
                user.save()
                self.stdout.write(f'Created user: {username}')

        officer = User.objects.get(username='officer1')
        citizen = User.objects.get(username='citizen1')
        agent = User.objects.get(username='agent1')
        admin = User.objects.get(username='admin')

        if not Complaint.objects.exists():
            complaints_data = [
                ('CP-DEMO001', 'UPI Fraud - Fake Refund', 'Received OTP request for UPI refund scam. Lost 45000 rupees.', 'Financial Fraud', 'Metro District 4', 0.92),
                ('CP-DEMO002', 'Assault Report', 'Physical assault near South Pier 9. Victim needs immediate help.', 'Assault', 'South Pier 9', 0.95),
                ('CP-DEMO003', 'Cyber Breach Attempt', 'Phishing email targeting finance department credentials.', 'Cybercrime', 'Finance Cluster', 0.78),
                ('CP-DEMO004', 'Suspicious Activity', 'Multiple drones near terminal 4 loading docks.', 'Surveillance', 'Terminal 4', 0.55),
                ('CP-DEMO005', 'Investment Scam', 'Fake crypto investment platform draining accounts.', 'Financial Fraud', 'Cyber Park Dr.', 0.88),
            ]
            for cid, title, desc, cat, loc, urgency in complaints_data:
                c = Complaint.objects.create(
                    complaint_id=cid, citizen=citizen, title=title, description=desc,
                    category=cat, location=loc, urgency_score=urgency,
                    readiness_score=0.75, fraud_classification='scam' if 'Fraud' in cat or 'Scam' in title else 'legitimate',
                    assigned_officer=officer, status='investigating' if urgency > 0.8 else 'pending',
                    qr_code=f'QR-{cid}',
                )
                ComplaintTimeline.objects.create(complaint=c, event='Complaint Filed', description=desc[:100], actor=citizen)
                if urgency >= 0.7:
                    OfficerAssignment.objects.create(complaint=c, officer=officer, priority=1 if urgency > 0.9 else 2, golden_hour=urgency >= 0.9)

        if not MuleAlert.objects.exists():
            MuleAlert.objects.bulk_create([
                MuleAlert(account_id='ACC-7821', bank_name='NeoBank', risk_level='critical', transaction_count=47, total_amount=2840000, ai_analysis={'pattern': 'rapid_layering'}),
                MuleAlert(account_id='ACC-3392', bank_name='GlobalTrust', risk_level='high', transaction_count=23, total_amount=890000, ai_analysis={'pattern': 'smurfing'}),
                MuleAlert(account_id='ACC-1105', bank_name='CyberPay', risk_level='medium', transaction_count=12, total_amount=340000, ai_analysis={'pattern': 'round_tripping'}),
            ])

        if not ScamDNA.objects.exists():
            ScamDNA.objects.bulk_create([
                ScamDNA(pattern_id='DNA-PHISH01', name='UPI Refund Phishing', description='OTP-based refund scam pattern', dna_sequence=[{'step': 'SMS Link'}, {'step': 'Fake Portal'}, {'step': 'OTP Capture'}], confidence=0.94, linked_cases=127, category='phishing'),
                ScamDNA(pattern_id='DNA-INV02', name='Crypto Investment Trap', description='Fake trading platform pattern', dna_sequence=[{'step': 'Social Media Ad'}, {'step': 'WhatsApp Group'}, {'step': 'Initial Profit'}, {'step': 'Large Deposit Request'}], confidence=0.91, linked_cases=89, category='investment'),
                ScamDNA(pattern_id='DNA-LOT03', name='Lottery Winner Scam', description='Advance fee lottery fraud', dna_sequence=[{'step': 'Congratulations Call'}, {'step': 'Processing Fee'}], confidence=0.87, linked_cases=56, category='lottery'),
            ])

        if not SuspectNode.objects.exists():
            nodes = {}
            node_data = [
                ('N1', 'Rajesh Kumar', 'person', 0.92),
                ('N2', 'ACC-7821', 'account', 0.95),
                ('N3', 'FakeRefund.in', 'domain', 0.88),
                ('N4', 'Priya Sharma', 'person', 0.76),
                ('N5', '+91-9876543210', 'phone', 0.82),
                ('N6', 'CryptoVault.io', 'domain', 0.91),
                ('N7', 'ACC-3392', 'account', 0.87),
            ]
            for nid, name, ntype, risk in node_data:
                nodes[nid] = SuspectNode.objects.create(node_id=nid, name=name, node_type=ntype, risk_score=risk)

            edges = [
                ('N1', 'N2', 'owns', 0.9), ('N1', 'N5', 'uses', 0.85),
                ('N3', 'N1', 'targets', 0.88), ('N4', 'N7', 'linked_to', 0.72),
                ('N6', 'N4', 'recruited_by', 0.91), ('N2', 'N7', 'transfers_to', 0.95),
                ('N5', 'N3', 'registered_with', 0.80),
            ]
            for src, tgt, rel, weight in edges:
                SuspectEdge.objects.create(source=nodes[src], target=nodes[tgt], relationship=rel, weight=weight)

        Notification.objects.get_or_create(
            user=officer, title='Golden Hour Alert',
            defaults={'message': 'High urgency complaint CP-DEMO002 requires immediate response.', 'notification_type': 'alert'},
        )

        from api.models import Message
        if not Message.objects.filter(recipient=agent).exists():
            Message.objects.create(sender=admin, recipient=agent, subject='Mission Briefing', body='Operation Nightfall commences at 2200 hours. Maintain encrypted channel.', encrypted=True, is_urgent=True)

        self.stdout.write(self.style.SUCCESS('Seed data created successfully!'))
        self.stdout.write('Demo accounts (password: password123):')
        for u in ['admin', 'officer1', 'supervisor1', 'agent1', 'citizen1']:
            self.stdout.write(f'  - {u}')
