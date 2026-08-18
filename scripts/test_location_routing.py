import os
import sys
import django

sys.stdout.reconfigure(encoding='utf-8')

# Setup Django environment
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'smartpol.settings')
django.setup()

from api.models import User, PoliceStation, Complaint
from api.ai_services import recommend_police_station_and_officer
from api.management.commands.seed_ahmedabad_data import Command as SeedCommand

def run_test():
    print("\n" + "="*70)
    print("  TESTING DYNAMIC POLICE STATION ROUTING ENGINE")
    print("="*70 + "\n")

    # 1. Ensure police stations are seeded
    if PoliceStation.objects.count() < 10:
        print("[SETUP] Seeding Ahmedabad Police Station dataset...")
        SeedCommand().handle()

    # 2. Setup mock Citizen User registered at "Nikol, Ahmedabad"
    citizen_nikol, _ = User.objects.get_or_create(
        username='nikol_citizen',
        defaults={
            'first_name': 'Ramesh',
            'last_name': 'Patel',
            'email': 'ramesh.nikol@example.com',
            'role': User.ROLE_CITIZEN,
            'district': 'Nikol, Ahmedabad',
            'phone': '9898989898',
        }
    )

    # ── CASE 1: Citizen profile at Nikol, NO incident location entered in complaint ──
    print("[CASE 1] Complaint submitted with NO entered location (using Citizen Profile Home: Nikol)")
    complaint_data_1 = {
        'title': 'Theft of Bicycle',
        'description': 'My bicycle was stolen near my house. Please investigate.',
        'category': 'Theft / Burglary',
        'location': '',
        'locality': '',
        'latitude': None,
        'longitude': None,
    }

    res1 = recommend_police_station_and_officer(complaint_data_1, citizen_user=citizen_nikol)
    station1 = res1['station']
    print(f"  -> Assigned Station: {station1.name if station1 else 'None'}")
    print(f"  -> Distance: {res1['distance_km']} km")
    print(f"  -> Explanation:\n{res1['explanation']}\n")

    assert station1 is not None, "Station 1 should not be None"
    assert "nikol" in station1.name.lower() or "nikol" in station1.area.lower(), f"Expected Nikol Police Station, got {station1.name}"
    print("✓ [PASS] Case 1 correctly routed to Nikol Police Station based on Citizen Home Location!\n")

    # ── CASE 2: Citizen profile at Nikol, BUT specifies Entered Incident Location = 'Satellite' ──
    print("[CASE 2] Complaint submitted with Entered Incident Location = 'Satellite, Ahmedabad'")
    complaint_data_2 = {
        'title': 'Stolen Wallet at Mall',
        'description': 'My wallet was picked while shopping at Satellite market area.',
        'category': 'Theft',
        'location': 'Satellite, Ahmedabad',
        'locality': 'Satellite',
        'latitude': None,
        'longitude': None,
    }

    res2 = recommend_police_station_and_officer(complaint_data_2, citizen_user=citizen_nikol)
    station2 = res2['station']
    print(f"  -> Assigned Station: {station2.name if station2 else 'None'}")
    print(f"  -> Distance: {res2['distance_km']} km")
    print(f"  -> Explanation:\n{res2['explanation']}\n")

    assert station2 is not None, "Station 2 should not be None"
    assert "satellite" in station2.name.lower() or "satellite" in station2.area.lower(), f"Expected Satellite Police Station, got {station2.name}"
    print("✓ [PASS] Case 2 correctly routed to Satellite Police Station based on Entered Incident Location!\n")

    # ── CASE 3: Cyber Fraud Complaint from Nikol Citizen ──
    print("[CASE 3] Cyber Fraud Complaint submitted by Nikol Citizen")
    complaint_data_3 = {
        'title': 'UPI Scam OTP Fraud',
        'description': 'Received fake call claiming to be bank manager and lost Rs 50,000 via UPI.',
        'category': 'UPI Cyber Fraud',
        'location': '',
        'locality': '',
        'latitude': None,
        'longitude': None,
    }

    res3 = recommend_police_station_and_officer(complaint_data_3, citizen_user=citizen_nikol)
    station3 = res3['station']
    print(f"  -> Assigned Station: {station3.name if station3 else 'None'}")
    print(f"  -> Cyber Specialization: {res3['is_cybercrime']}")
    print(f"  -> Explanation:\n{res3['explanation']}\n")

    assert station3 is not None, "Station 3 should not be None"
    assert station3.is_cyber_specialized, "Station 3 should be cyber specialized"
    print("✓ [PASS] Case 3 correctly routed to East Ahmedabad Cyber Crime Unit!\n")

    # ── CASE 4: Citizen profile at Sarkhej, BUT incident location entered = 'Vastral' ──
    print("[CASE 4] Citizen registered at 'Sarkhej, Ahmedabad' filing complaint with incident location = 'Vastral, Ahmedabad'")
    citizen_sarkhej, _ = User.objects.get_or_create(
        username='sarkhej_citizen',
        defaults={
            'first_name': 'Suresh',
            'last_name': 'Shah',
            'email': 'suresh.sarkhej@example.com',
            'role': User.ROLE_CITIZEN,
            'district': 'Sarkhej, Ahmedabad',
            'phone': '9797979797',
        }
    )

    complaint_data_4 = {
        'title': 'Accident on Vastral Ring Road',
        'description': 'Vehicle hit and run occurred while visiting Vastral Ring Road.',
        'category': 'Traffic Accident / Hit and Run',
        'location': 'Vastral, Ahmedabad',
        'locality': 'Vastral',
        'latitude': None,
        'longitude': None,
    }

    res4 = recommend_police_station_and_officer(complaint_data_4, citizen_user=citizen_sarkhej)
    station4 = res4['station']
    print(f"  -> Assigned Station: {station4.name if station4 else 'None'}")
    print(f"  -> Distance: {res4['distance_km']} km")
    print(f"  -> Explanation:\n{res4['explanation']}\n")

    assert station4 is not None, "Station 4 should not be None"
    assert "vastral" in station4.area.lower() or "ramol" in station4.name.lower() or "vastral" in station4.jurisdiction.lower(), f"Expected Ramol/Vastral Police Station, got {station4.name}"
    print("✓ [PASS] Case 4 correctly routed to Ramol / Vastral Police Station based on Entered Incident Location!\n")

    print("="*70)
    print("  ALL LOCATION ROUTING TESTS PASSED SUCCESSFULLY!")
    print("="*70 + "\n")

if __name__ == '__main__':
    run_test()
