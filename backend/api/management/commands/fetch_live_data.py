import json
import urllib.request
import random
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from api.models import Complaint, ComplaintTimeline, User, OfficerAssignment
from api import ai_services

User = get_user_model()

class Command(BaseCommand):
    help = 'Fetch live incident data from API and map them to India/Ahmedabad areas for local demo'

    def handle(self, *args, **options):
        self.stdout.write("Connecting to Open Data incident API...")
        
        # Coordinates for London to get street data
        url = "https://data.police.uk/api/crimes-street/all-crime?lat=51.5074&lng=-0.1278"
        
        try:
            req = urllib.request.Request(
                url, 
                headers={'User-Agent': 'Mozilla/5.0'}
            )
            with urllib.request.urlopen(req) as response:
                crimes = json.loads(response.read().decode())
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Failed to fetch data: {e}"))
            return

        self.stdout.write(f"Successfully fetched {len(crimes)} live incident feeds.")

        # Ahmedabad areas for dynamic mapping
        AHMEDABAD_AREAS = [
            "S.G. Highway, Sector 7G",
            "C.G. Road, Navrangpura",
            "Vastrapur Lake Area",
            "Satellite Road, Ahmedabad",
            "Ashram Road, Usmanpura",
            "Ghatlodia Ward, Sector 7G",
            "Maninagar Crossing",
            "Bapunagar Industrial Estate",
            "Prahlad Nagar, Anandnagar",
            "Paldi Circle"
        ]

        # Indian names for realistic complainants
        INDIAN_NAMES = [
            ("Rajesh", "Kumar"),
            ("Priya", "Sharma"),
            ("Amit", "Patel"),
            ("Sunita", "Joshi"),
            ("Karan", "Mehta"),
            ("Deepak", "Shah"),
            ("Sneha", "Nair"),
            ("Vikram", "Singh"),
            ("Anjali", "Desai"),
            ("Sanjay", "Verma")
        ]

        # Get demo officer
        officer = User.objects.filter(role=User.ROLE_OFFICER).first()
        if not officer:
            self.stdout.write(self.style.ERROR("Demo officer user not found. Please run seed_data first."))
            return

        # Import up to 15 crimes to avoid cluttering
        imported = 0
        for idx, crime in enumerate(crimes[:15]):
            crime_id = f"CP-IND{crime['id']}"
            if Complaint.objects.filter(complaint_id=crime_id).exists():
                continue

            # Deterministic selection based on crime ID
            loc_name = AHMEDABAD_AREAS[int(crime['id']) % len(AHMEDABAD_AREAS)]
            first, last = INDIAN_NAMES[int(crime['id']) % len(INDIAN_NAMES)]
            
            # Get or create an Indian citizen user for this complaint
            username = f"{first.lower()}{random.randint(10,99)}"
            citizen, _ = User.objects.get_or_create(
                username=username,
                defaults={
                    'email': f"{username}@gmail.com",
                    'first_name': first,
                    'last_name': last,
                    'role': User.ROLE_CITIZEN,
                    'district': 'Sector 7G'
                }
            )

            category_map = {
                'anti-social-behaviour': 'General',
                'bicycle-theft': 'Theft',
                'burglary': 'Theft',
                'criminal-damage-arson': 'General',
                'drugs': 'General',
                'other-theft': 'Theft',
                'possession-of-weapons': 'General',
                'public-order': 'General',
                'robbery': 'Theft',
                'shoplifting': 'Theft',
                'theft-from-the-person': 'Theft',
                'vehicle-crime': 'Theft',
                'violent-crime': 'Assault',
                'other-crime': 'General'
            }

            raw_cat = crime.get('category', 'other-crime')
            mapped_cat = category_map.get(raw_cat, 'General')
            
            # Formulate realistic Indian police descriptions
            desc_template = [
                f"Incident reported at {loc_name}. Callers reported {raw_cat.replace('-', ' ')} in progress. Local PCR unit dispatched.",
                f"Local patrol unit responded to a complaint of {raw_cat.replace('-', ' ')} near {loc_name}.",
                f"Disruption reported at {loc_name} involving {raw_cat.replace('-', ' ')}. First information report filed."
            ]
            desc = random.choice(desc_template)

            # Inject phone/account to link suspect graph and mule detection
            if random.random() > 0.4:
                phone_num = f"+91-987654{random.randint(1000, 9999)}"
                acct_num = f"998877{random.randint(100000, 999999)}"
                desc += f" Suspect contact phone: {phone_num}. Fund transfers were routed through bank account {acct_num}."

            title = f"{mapped_cat} - {loc_name}"

            # Calculate ML details
            urgency = ai_services.compute_urgency_score(desc, mapped_cat)
            readiness = ai_services.compute_readiness_score({'description': desc})
            
            c = Complaint.objects.create(
                complaint_id=crime_id,
                citizen=citizen,
                title=title,
                description=desc,
                category=mapped_cat,
                location=loc_name,
                urgency_score=urgency,
                readiness_score=readiness,
                assigned_officer=officer,
                status='pending',
                qr_code=f'QR-{crime_id}'
            )

            # Register assignment if high urgency
            if urgency >= 0.7:
                OfficerAssignment.objects.create(
                    complaint=c,
                    officer=officer,
                    priority=1 if urgency > 0.9 else 2,
                    golden_hour=urgency >= 0.9
                )

            ComplaintTimeline.objects.create(
                complaint=c,
                event='Complaint Ingested',
                description=f'Real incident data imported and mapped to local sector {loc_name}.',
                actor=None
            )
            imported += 1

        self.stdout.write(self.style.SUCCESS(f"Successfully ingested {imported} live Indian area incident records into the database!"))
