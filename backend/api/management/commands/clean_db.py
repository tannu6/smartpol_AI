from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.contrib.admin.models import LogEntry
from api.models import (
    Complaint, AssignmentRecord, ComplaintTimeline, Evidence,
    Message, AnonymousTip, Notification, Identifier, OfficerAssignment,
    SystemLog, OTPRecord, PasswordResetToken, Operation, CaseTask, CaseNote,
    CanonicalEntity, EntityRelation
)

User = get_user_model()

class Command(BaseCommand):
    help = 'Clean database: removes complaints, user accounts, and system logs.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--create-admin',
            action='store_true',
            help='Create default superadmin account after wiping',
        )

    def handle(self, *args, **options):
        # 1. Clear complaints, cases, and logs
        Complaint.objects.all().delete()
        AssignmentRecord.objects.all().delete()
        ComplaintTimeline.objects.all().delete()
        Evidence.objects.all().delete()
        Message.objects.all().delete()
        AnonymousTip.objects.all().delete()
        Notification.objects.all().delete()
        Identifier.objects.all().delete()
        OfficerAssignment.objects.all().delete()
        SystemLog.objects.all().delete()
        LogEntry.objects.all().delete()
        OTPRecord.objects.all().delete()
        PasswordResetToken.objects.all().delete()
        Operation.objects.all().delete()
        CaseTask.objects.all().delete()
        CaseNote.objects.all().delete()
        CanonicalEntity.objects.all().delete()
        EntityRelation.objects.all().delete()

        # 2. Delete all user accounts safely
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute("PRAGMA foreign_keys = OFF;")
            cursor.execute("DELETE FROM api_user;")
            cursor.execute("PRAGMA foreign_keys = ON;")

        if options.get('create_admin'):
            admin = User.objects.create(
                username='admin',
                email='admin@smartpol.gov',
                first_name='System',
                last_name='Admin',
                role=User.ROLE_ADMIN,
                is_active=True,
                is_staff=True,
                is_superuser=True
            )
            admin.set_password('password123')
            admin.save()
            self.stdout.write(self.style.SUCCESS(f'Created SuperAdmin User: {admin.username} (email: {admin.email})'))

        self.stdout.write(self.style.SUCCESS('Successfully cleaned all complaints, users, and logs!'))
        self.stdout.write(self.style.SUCCESS(f'Total Users in DB: {User.objects.count()}'))
        self.stdout.write(self.style.SUCCESS(f'Total Complaints in DB: {Complaint.objects.count()}'))
