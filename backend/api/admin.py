from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth import get_user_model

from .models import (
    Complaint, ComplaintTimeline, Evidence, Message, Notification,
    Identifier, MuleAlert, ScamDNA, OfficerAssignment, SuspectNode,
    SuspectEdge, SystemLog,
)

User = get_user_model()


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'role', 'district', 'badge_id']
    list_filter = ['role']
    fieldsets = BaseUserAdmin.fieldsets + (
        ('SmartPol', {'fields': ('role', 'badge_id', 'district', 'avatar_url', 'duress_code', 'phone')}),
    )


admin.site.register(Complaint)
admin.site.register(ComplaintTimeline)
admin.site.register(Evidence)
admin.site.register(Message)
admin.site.register(Notification)
admin.site.register(Identifier)
admin.site.register(MuleAlert)
admin.site.register(ScamDNA)
admin.site.register(OfficerAssignment)
admin.site.register(SuspectNode)
admin.site.register(SuspectEdge)
admin.site.register(SystemLog)
