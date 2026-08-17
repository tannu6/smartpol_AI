import json
from channels.generic.websocket import AsyncWebsocketConsumer

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # We'll broadcast to a single global group for the hackathon MVP
        self.room_group_name = 'officer_notifications'

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from WebSocket (if client sends one, though we mostly push)
    async def receive(self, text_data):
        pass

    # Receive message from room group
    async def send_notification(self, event):
        message = event['message']
        alert_type = event.get('alert_type', 'info')

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': message,
            'alert_type': alert_type
        }))
