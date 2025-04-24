import requests
from django.conf import settings
from asgiref.sync import async_to_sync

@async_to_sync
async def send_people_count_async(room: str, count: int):
    await requests.post(
        f"{settings.BACKEND_URL}/api/ai/people-count/",
        json={"room": room, "count": count}
    )

def send_people_count(room: str, count: int):
    send_people_count_async(room, count)