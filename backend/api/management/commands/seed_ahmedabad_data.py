from django.core.management.base import BaseCommand
from api.models import PoliceStation

class Command(BaseCommand):
    help = 'Seeds Ahmedabad Police Stations dataset for demonstration purposes.'

    def handle(self, *args, **options):
        stations_data = [
            {
                'name': 'Mithakhali Cyber Crime Police Station',
                'district': 'Ahmedabad',
                'area': 'Mithakhali / Shahibaug',
                'latitude': 23.0333,
                'longitude': 72.5667,
                'jurisdiction': 'Ahmedabad Urban Cyber Jurisdiction (Entire City)',
                'is_cyber_specialized': True,
                'contact_number': '+91-79-2656-CYBER',
                'officer_capacity': 25,
                'status': 'active',
            },
            {
                'name': 'Satellite Police Station',
                'district': 'Ahmedabad',
                'area': 'Satellite / Jodhpur',
                'latitude': 23.0298,
                'longitude': 72.5180,
                'jurisdiction': 'Satellite, Ramdev Nagar, Shyamal, Jodhpur Circle',
                'is_cyber_specialized': False,
                'contact_number': '+91-79-2685-1100',
                'officer_capacity': 18,
                'status': 'active',
            },
            {
                'name': 'Navrangpura Police Station',
                'district': 'Ahmedabad',
                'area': 'Navrangpura / CG Road',
                'latitude': 23.0372,
                'longitude': 72.5609,
                'jurisdiction': 'Navrangpura, Commerce Six Roads, CG Road, Commerce College',
                'is_cyber_specialized': False,
                'contact_number': '+91-79-2640-0200',
                'officer_capacity': 20,
                'status': 'active',
            },
            {
                'name': 'Vastrapur Police Station',
                'district': 'Ahmedabad',
                'area': 'Vastrapur / IIM Road',
                'latitude': 23.0375,
                'longitude': 72.5284,
                'jurisdiction': 'Vastrapur Lake, IIMA Campus, Gurukul, Helmet Circle',
                'is_cyber_specialized': False,
                'contact_number': '+91-79-2676-0300',
                'officer_capacity': 16,
                'status': 'active',
            },
            {
                'name': 'Shahibaug Police Station',
                'district': 'Ahmedabad',
                'area': 'Shahibaug / Cantonment',
                'latitude': 23.0560,
                'longitude': 72.5890,
                'jurisdiction': 'Shahibaug, Camp Road, Civil Hospital Complex, Subhash Bridge',
                'is_cyber_specialized': False,
                'contact_number': '+91-79-2286-0400',
                'officer_capacity': 22,
                'status': 'active',
            },
            {
                'name': 'Maninagar Police Station',
                'district': 'Ahmedabad',
                'area': 'Maninagar / Kankaria',
                'latitude': 22.9985,
                'longitude': 72.6025,
                'jurisdiction': 'Maninagar, Kankaria Lake, Jawahar Chowk, Balvatika',
                'is_cyber_specialized': False,
                'contact_number': '+91-79-2546-0500',
                'officer_capacity': 15,
                'status': 'active',
            },
            {
                'name': 'Bodakdev Police Station',
                'district': 'Ahmedabad',
                'area': 'Bodakdev / Judges Bungalow',
                'latitude': 23.0410,
                'longitude': 72.5110,
                'jurisdiction': 'Bodakdev, Judges Bungalow Road, Sindhu Bhavan Road, Pakwan',
                'is_cyber_specialized': False,
                'contact_number': '+91-79-2687-0600',
                'officer_capacity': 14,
                'status': 'active',
            },
            {
                'name': 'Sabarmati Police Station',
                'district': 'Ahmedabad',
                'area': 'Sabarmati / RTO',
                'latitude': 23.0800,
                'longitude': 72.5800,
                'jurisdiction': 'Sabarmati, Ashram Road North, RTO Circle, Motera Stadium Rd',
                'is_cyber_specialized': False,
                'contact_number': '+91-79-2750-0700',
                'officer_capacity': 18,
                'status': 'active',
            },
            {
                'name': 'S.G. Highway Crime Branch Cell',
                'district': 'Ahmedabad',
                'area': 'SG Highway / Thaltej',
                'latitude': 23.0500,
                'longitude': 72.5050,
                'jurisdiction': 'SG Highway Corridor, Thaltej Cross Roads, Science City Circle',
                'is_cyber_specialized': True,
                'contact_number': '+91-79-2693-0800',
                'officer_capacity': 30,
                'status': 'active',
            },
            {
                'name': 'Ellisbridge Police Station',
                'district': 'Ahmedabad',
                'area': 'Ellisbridge / VS Hospital',
                'latitude': 23.0210,
                'longitude': 72.5710,
                'jurisdiction': 'Ellisbridge, Town Hall, VS Hospital, Ashram Road South',
                'is_cyber_specialized': False,
                'contact_number': '+91-79-2657-0900',
                'officer_capacity': 16,
                'status': 'active',
            },
        ]

        created_count = 0
        for data in stations_data:
            st, created = PoliceStation.objects.get_or_create(
                name=data['name'],
                defaults=data
            )
            if created:
                created_count += 1

        from api.models import User
        User.objects.filter(role='admin').update(phone='9045303803')

        self.stdout.write(self.style.SUCCESS(
            f"Successfully seeded {created_count} Ahmedabad police stations (Total registered: {PoliceStation.objects.count()}). Admin phone set to 9045303803."
        ))
